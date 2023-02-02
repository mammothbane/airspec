use async_compat::CompatExt;
use influxdb2::models::Query;
use tide::{
    Response,
    Status,
    StatusCode,
};

#[derive(serde::Deserialize)]
pub struct DumpRequest {
    id: String,
}

pub async fn dump(req: tide::Request<crate::run::State>) -> tide::Result {
    let DumpRequest {
        id,
    } = req.query::<DumpRequest>()?;

    let state = req.state();

    if id.contains('"') {
        return Err(tide::Error::from_str(
            StatusCode::BadRequest,
            format!("injection detected: {id:?}"),
        ));
    }

    let query = format!(
        r#"
        from(bucket: "{}")
            |> range(start: 0)
            |> drop(columns: ["_start", "_stop"])
            |> filter(fn: (r) => r.system_uid == "{}")
            |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        "#,
        state.influx_cfg.bucket, id,
    );

    let csv = state
        .influx
        .query_raw(&state.influx_cfg.org, Some(Query::new(query)))
        .compat()
        .await
        .status(StatusCode::BadGateway)?;

    tracing::debug!(body = %csv, "requested csv");

    Ok(Response::builder(StatusCode::Ok).content_type("text/csv").body(csv).build())
}
