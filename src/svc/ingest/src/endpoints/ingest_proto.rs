use std::str::FromStr;

use influxdb2::models::DataPoint;
use prost::Message;

use crate::normalize::{
    ToDatapoints,
    WithHeader,
};

lazy_static::lazy_static! {
    pub static ref PROTO_MIME: tide::http::Mime = tide::http::Mime::from_str("application/protobuf")
        .expect("parsing protobuf mime");
}

macro_rules! convert_all {
    ($parent:ident | $x:ident) => {
        convert_all!($parent:ident | $x:ident,)
    };
    ($parent:ident | $x:ident,) => {
        $parent.$x.iter().map(|z| WithHeader($parent.header.as_ref().unwrap(), z).to_data_points())
    };
    ($parent:ident | $x:ident, $($xs:ident,)+) => {
        convert_all!($parent | $x,)$(.chain(convert_all!($parent | $xs,)))+
    };
}

pub async fn ingest_proto(mut req: tide::Request<crate::run::State>) -> tide::Result {
    let body = req.body_bytes().await?;
    let submit_packets = crate::pb::SubmitPackets::decode(body.as_slice())?;

    let state = req.state();

    submit_packets
        .sensor_data
        .into_iter()
        .map(|pkt| {
            convert_all!(
                pkt | blink_packet,
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
        .try_for_each(|x| state.tx.try_send(x))?;

    Ok(tide::StatusCode::Accepted.into())
}
