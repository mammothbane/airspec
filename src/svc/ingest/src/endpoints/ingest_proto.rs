use std::{
    ops::Deref,
    str::FromStr,
};

use influxdb2::models::DataPoint;
use prost::Message;
use smol::stream::StreamExt;
use tap::Pipe;
use tide::StatusCode;

use crate::{
    db::user_token::UserAuthInfo,
    normalize::{
        AugmentDatapoint,
        ToDatapoints,
    },
};

lazy_static::lazy_static! {
    pub static ref PROTO_MIME: tide::http::Mime = tide::http::Mime::from_str("application/protobuf")
        .expect("parsing protobuf mime");
}

macro_rules! convert_all {
    ($parent:ident, $augments:expr => $x:ident) => {
        convert_all!($parent, $augments => $x,)
    };
    ($parent:ident, $augments:expr => $x:ident,) => {
        match $parent.payload {
            Some(crate::pb::sensor_packet::Payload::$x(ref inner)) => {
                let timestamp = $parent.header.as_ref().and_then(|hdr| chrono::NaiveDateTime::from_timestamp_millis(hdr.epoch as i64));

                Some(inner.to_data_points(timestamp, $augments))
            },
            _ => None,
        }
    };
    ($parent:ident, $augments:expr => $x:ident, $($xs:ident,)+) => {
        convert_all!($parent, $augments => $x,)$(.or(convert_all!($parent, $augments => $xs,)))+
    };
}

#[tracing::instrument(skip(req), err(Display))]
pub async fn ingest_proto(
    mut req: tide::Request<impl Deref<Target = crate::endpoints::ingest::State>>,
) -> tide::Result {
    let body = req.body_bytes().await?;

    let submit_packets = crate::pb::SubmitPackets::decode(body.as_slice())?;
    tracing::trace!(?submit_packets, "received packets");

    let state = req.state();

    let user_info = req.ext::<UserAuthInfo>().ok_or_else(|| {
        tide::Error::from_str(StatusCode::InternalServerError, "could not get user auth info")
    })?;

    submit_packets
        .sensor_data
        .into_iter()
        .map(|pkt| {
            let mut augments: Vec<&dyn AugmentDatapoint> = vec![user_info];

            if let Some(ref meta) = submit_packets.meta {
                augments.push(meta);
            }

            if let Some(ref header) = pkt.header {
                augments.push(header);
            }

            convert_all!(pkt, &augments =>
                BlinkPacket,
                BmePacket,
                ImuPacket,
                LuxPacket,
                MicPacket,
                SgpPacket,
                ShtPacket,
                SpecPacket,
                ThermPacket,
                SurveyPacket,
                MetaDataPacket,
            )
            .unwrap()
        })
        .collect::<Result<Vec<Vec<DataPoint>>, _>>()?
        .into_iter()
        .pipe(async_std::stream::from_iter)
        .then(|x| async move {
            tracing::trace!(submitting_packet = ?x);
            state.0.send(x).await
        })
        .try_collect()
        .await?;

    Ok(StatusCode::Accepted.into())
}
