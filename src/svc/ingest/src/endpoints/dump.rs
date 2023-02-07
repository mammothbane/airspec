use async_compat::CompatExt;
use async_std::stream::StreamExt as _;
use futures::TryStreamExt;
use influxdb2::models::Query;
use tide::{
    Body,
    Response,
    Status,
    StatusCode,
};

#[derive(serde::Deserialize)]
pub struct DumpRequest {
    id:    String,
    start: String,
    end:   String,
}

#[tracing::instrument(err(Display))]
pub async fn dump(req: tide::Request<crate::run::State>) -> tide::Result {
    let DumpRequest {
        id,
        start,
        end,
    } = req.query::<DumpRequest>()?;

    if id.contains('"') {
        return Err(tide::Error::from_str(
            StatusCode::BadRequest,
            format!("injection detected: {id:?}"),
        ));
    }

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

    let req = state
        .influx
        .query_raw_stream(&state.influx_cfg.org, Some(Query::new(query)))
        .compat()
        .await
        .status(StatusCode::BadGateway)?
        .map(|x| x.map_err(|e| futures::io::Error::new(futures::io::ErrorKind::BrokenPipe, e)))
        .into_async_read();

    tracing::debug!("requested csv");

    let bufread = async_std::io::BufReader::new(req);
    let body = Body::from_reader(bufread, None);

    Ok(Response::builder(StatusCode::Ok).content_type("text/csv").body(body).build())
}
