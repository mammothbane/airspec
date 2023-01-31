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
            format!("injection detected: {:?}", id),
        ));
    }

    let query = format!(
        r#"
        from(bucket: "{}")
            |> range(start: 0)
            |> filter(fn: (r) => r.specs == "{}")
        "#,
        state.influx_cfg.bucket, id,
    );

    let csv = state
        .influx
        .query_raw(&state.influx_cfg.org, Some(Query::new(query)))
        .await
        .status(StatusCode::BadGateway)?;

    Ok(Response::builder(StatusCode::Ok).content_type("text/csv").body(csv).build())
}
