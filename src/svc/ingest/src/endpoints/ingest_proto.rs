use std::{
    ops::Deref,
    str::FromStr,
};

use crate::db::user_token::UserAuthInfo;
use influxdb2::models::DataPoint;
use prost::Message;
use tide::StatusCode;

use crate::normalize::{
    AugmentDatapoint,
    ToDatapoints,
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
        $parent.$x.iter().map(|z| z.to_data_points($augments))
    };
    ($parent:ident, $augments:expr => $x:ident, $($xs:ident,)+) => {
        convert_all!($parent, $augments => $x,)$(.chain(convert_all!($parent, $augments => $xs,)))+
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
            let header = pkt.header.unwrap();

            let augments: Vec<&dyn AugmentDatapoint> = vec![user_info, &header];

            convert_all!(pkt, &augments =>
                blink_packet,
                bme_packet,
                imu_packet,
                lux_packet,
                mic_packet,
                sgp_packet,
                sht_packet,
                spec_packet,
                therm_packet,
            )
            .collect::<Result<Vec<Vec<DataPoint>>, _>>()
            .map(|v| v.into_iter().flatten().collect::<Vec<DataPoint>>())
        })
        .collect::<Result<Vec<Vec<DataPoint>>, _>>()?
        .into_iter()
        .flatten()
        .inspect(|pkt| tracing::trace!(submitting_packet = ?pkt))
        .try_for_each(|x| state.0.try_send(x))?;

    Ok(StatusCode::Accepted.into())
}
