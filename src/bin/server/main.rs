#![feature(option_result_contains)]

use std::sync::Arc;

use async_std::channel;
use chrono::{
    DateTime,
    Utc,
};
use structopt::StructOpt;

mod csv_download;
mod forward;
mod opt;
mod util;

use csv_download::*;
use opt::*;

pub struct State {
    msr_tx:        channel::Sender<Measurement>,
    influx_client: Arc<influxdb2::Client>,
    influx_cfg:    airspec::opt::Influx,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub struct SpecsId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub struct UserId(pub String);

#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Measurement {
    pub specs: SpecsId,
    pub user:  UserId,

    pub timestamp: DateTime<Utc>,
    pub sensor:    String,
    pub values:    Vec<(String, FieldValue)>,
}

#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(untagged)]
pub enum FieldValue {
    Bool(bool),
    F64(f64),
    I64(i64),
    String(String),
}

impl From<FieldValue> for influxdb2::models::FieldValue {
    fn from(value: FieldValue) -> Self {
        use FieldValue::*;

        match value {
            Bool(b) => Self::Bool(b),
            F64(f) => Self::F64(f),
            I64(i) => Self::I64(i),
            String(s) => Self::String(s),
        }
    }
}

async fn submit(mut req: tide::Request<Arc<State>>) -> tide::Result {
    let msrs: Vec<Measurement> = util::decode_msgpack_or_json(&mut req).await?;
    let state = req.state();

    for msr in msrs.into_iter() {
        state.msr_tx.send(msr).await?;
    }

    Ok(tide::http::StatusCode::Accepted.into())
}

#[async_std::main]
async fn main() -> eyre::Result<()> {
    airspec::trace::init(true);

    let Opt {
        bind,
        influx,
    } = Opt::from_args();

    let (msr_tx, msr_rx) = channel::bounded(4192);

    let client = influxdb2::Client::new(&influx.url, &influx.token);
    let client = Arc::new(client);

    let influx_fwd =
        async_std::task::spawn(forward::forward_to_influx(client.clone(), influx.clone(), msr_rx));

    let server = {
        let mut server = tide::with_state(Arc::new(State {
            msr_tx,
            influx_client: client,
            influx_cfg: influx,
        }));

        server.at("/submit").post(submit);
        server.at("/dump").get(csv_download);

        server
    };

    server.listen(bind).await?;
    influx_fwd.await;

    Ok(())
}
