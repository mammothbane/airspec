use std::{
    ops::Deref,
    sync::Arc,
};

use async_compat::CompatExt;
use async_std::stream::StreamExt as _;
use futures::TryStreamExt;
use influxdb2::{
    models::Query,
    Client,
};
use tide::{
    Body,
    Response,
    Status,
    StatusCode,
};
use tracing::Instrument;

use crate::opt::Influx;

#[derive(Debug, Clone)]
pub struct State {
    pub influx_cfg: Influx,
    pub influx:     Arc<Client>,
}

#[derive(serde::Deserialize)]
struct DumpRequest {
    id:    String,
    start: String,
    end:   String,
}

lazy_static::lazy_static! {
    static ref INJECT_OK: regex::Regex = regex::Regex::new(r#"^[a-zA-Z0-9\-_+]*$"#).unwrap();
}

fn test_inject(s: &str, name: &str) -> Result<(), tide::Error> {
    if INJECT_OK.is_match(s) {
        return Ok(());
    }

    Err(tide::Error::from_str(
        StatusCode::BadRequest,
        format!("injection detected in field {name:?}"),
    ))
}

pub async fn dump(req: tide::Request<impl Deref<Target = State>>) -> tide::Result {
    let DumpRequest {
        id,
        start,
        end,
    } = req.query::<DumpRequest>()?;

    test_inject(&id, "id")?;
    test_inject(&start, "start")?;
    test_inject(&end, "end")?;

    let state = req.state();

    let query = format!(
        r#"
        from(bucket: "{}")
            |> range(start: {start}, stop: {end})
            |> drop(columns: ["_start", "_stop"])
            |> filter(fn: (r) => r.system_uid == "{id}")
            |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        "#,
        state.influx_cfg.bucket,
    );

    tracing::debug!(%id, %start, %end, %query, "requesting csv");

    let req = state
        .influx
        .query_raw_stream(&state.influx_cfg.org, Some(Query::new(query)))
        .compat()
        .instrument(tracing::debug_span!("influx dump query"))
        .await
        .status(StatusCode::BadGateway)?
        .map(|x| x.map_err(|e| futures::io::Error::new(futures::io::ErrorKind::BrokenPipe, e)))
        .into_async_read();

    let bufread = async_std::io::BufReader::new(req);
    let body = Body::from_reader(bufread, None);

    Ok(Response::builder(StatusCode::Ok).content_type("text/csv").body(body).build())
}
