use std::collections::BTreeMap;

use influxdb2::models::{
    data_point::DataPointError,
    DataPoint,
    FieldValue,
};
use serde::Deserializer;
use serde_with::DeserializeAs;
use tide::{
    Status,
    StatusCode,
};

#[serde_with::serde_as]
#[derive(serde::Deserialize)]
struct RemoteDataPoint {
    measurement: String,
    tags:        BTreeMap<String, String>,
    #[serde_as(as = "BTreeMap<_, RemoteFieldValue>")]
    fields:      BTreeMap<String, FieldValue>,
    timestamp:   Option<i64>,
}

impl TryInto<DataPoint> for RemoteDataPoint {
    type Error = DataPointError;

    fn try_into(self) -> Result<DataPoint, DataPointError> {
        let RemoteDataPoint {
            measurement,
            tags,
            fields,
            timestamp,
        } = self;

        let builder = DataPoint::builder(measurement);

        let builder = timestamp.into_iter().fold(builder, |builder, ts| builder.timestamp(ts));
        let builder = tags.into_iter().fold(builder, |builder, (k, v)| builder.tag(k, v));
        let builder = fields.into_iter().fold(builder, |builder, (k, v)| builder.field(k, v));

        builder.build()
    }
}

#[serde_with::serde_as]
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(remote = "influxdb2::models::FieldValue")]
enum RemoteFieldValue {
    Bool(bool),
    F64(f64),
    I64(i64),
    U64(u64),
    String(String),
}

impl<'de> DeserializeAs<'de, FieldValue> for RemoteFieldValue {
    fn deserialize_as<D>(deserializer: D) -> Result<FieldValue, D::Error>
    where
        D: Deserializer<'de>,
    {
        RemoteFieldValue::deserialize(deserializer)
    }
}

pub async fn ingest(mut req: tide::Request<crate::run::State>) -> tide::Result {
    let msrs: Vec<RemoteDataPoint> = crate::util::decode_msgpack_or_json(&mut req).await?;

    let state = req.state();

    for msr in msrs.into_iter() {
        state.tx.send(msr.try_into().status(StatusCode::BadRequest)?).await?;
    }

    Ok(StatusCode::Accepted.into())
}
