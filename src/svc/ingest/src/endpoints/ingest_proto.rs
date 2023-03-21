use std::{
    ops::Deref,
    str::FromStr,
};

use influxdb2::models::DataPoint;
use prost::Message;
use smol::stream::StreamExt;
use tap::Pipe;
use tide::{
    Status,
    StatusCode,
};

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

    pub static ref PACKETS_RECEIVED: prometheus::IntCounterVec
        = prometheus::register_int_counter_vec!("packets_received", "total protobuf packets received", &["auth_token_id"]).unwrap();

    pub static ref DECODE_FAILURES: prometheus::IntCounterVec
        = prometheus::register_int_counter_vec!("decode_failures", "protobuf decode failures", &["auth_token_id"]).unwrap();

    pub static ref READINGS_PER_PACKET: prometheus::HistogramVec
        = prometheus::register_histogram_vec!("readings_per_packet", "sensor readings per packet", &["auth_token_id"]).unwrap();

    pub static ref READINGS: prometheus::IntCounterVec
        = prometheus::register_int_counter_vec!("sensor_readings", "individual sensor readings", &["sensor"]).unwrap();

    pub static ref SENSOR_CONVERT_TIME: prometheus::Histogram
        = prometheus::register_histogram!("sensor_convert_time", "how long it takes each sensor to convert to datapoint", vec![0.0, 0.00001, 0.0001, 0.001, 0.01]).unwrap();

    pub static ref BODY_SIZE: prometheus::Histogram
        = prometheus::register_histogram!("body_size_bytes", "protobuf request body size in bytes", vec![0., 10000., 100000., 10000000., 1000000000.]).unwrap();
}

macro_rules! convert_all {
    ($parent:ident, $augments:expr => $x:ident) => {
        convert_all!($parent, $augments => $x,)
    };
    ($parent:ident, $augments:expr => $x:ident,) => {
        match $parent.payload {
            Some(crate::pb::sensor_packet::Payload::$x(ref inner)) => {
                READINGS.with(&prometheus::labels! {
                    "sensor" => stringify!($x),
                }).inc();

                Some(inner.to_data_points($augments))
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
    let user_info = req
        .ext::<UserAuthInfo>()
        .ok_or_else(|| {
            tide::Error::from_str(StatusCode::InternalServerError, "could not get user auth info")
        })?
        .clone();

    let user_id = user_info.id.to_string();

    PACKETS_RECEIVED
        .with(&prometheus::labels! {
            "auth_token_id" => user_id.as_str(),
        })
        .inc();

    let body = req.body_bytes().await?;
    BODY_SIZE.observe(body.len() as f64);

    let state = req.state();

    let submit_packets = match crate::pb::SubmitPackets::decode(body.as_slice()) {
        Ok(pkts) => pkts,
        Err(e) => {
            DECODE_FAILURES
                .with(&prometheus::labels! {
                    "auth_token_id" => user_id.as_str(),
                })
                .inc();

            if let Err(e) = crate::db::bad_packet::save(state.store.as_ref(), &body) {
                tracing::error!(error = %e, "storing body to db");
            }

            return Err(e).status(StatusCode::BadRequest);
        },
    };

    tracing::trace!(?submit_packets, "received packets");

    READINGS_PER_PACKET
        .with(&prometheus::labels! {
            "auth_token_id" => user_id.as_str(),
        })
        .observe(submit_packets.sensor_data.len() as f64);

    let timer_hist = SENSOR_CONVERT_TIME.start_timer();

    submit_packets
        .sensor_data
        .into_iter()
        .map(|pkt| {
            let mut augments: Vec<&dyn AugmentDatapoint> = vec![&user_info];

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
                MicLevelPacket,
            )
            .unwrap()
        })
        .collect::<Result<Vec<Vec<DataPoint>>, _>>()?
        .into_iter()
        .pipe(async_std::stream::from_iter)
        .then(|x| async move {
            tracing::trace!(submitting_packet = ?x);
            state.tx.send(x).await
        })
        .try_collect()
        .await?;

    timer_hist.stop_and_record();

    Ok(StatusCode::Accepted.into())
}
