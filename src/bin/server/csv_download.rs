use std::sync::Arc;

use async_compat::CompatExt;
use influxdb2::models::Query;
use tide::{
    Request,
    Response,
    StatusCode,
};

use crate::{
    SpecsId,
    State,
    UserId,
};

#[derive(serde::Deserialize)]
pub struct CsvRequest {
    user:  Option<UserId>,
    specs: Option<SpecsId>,
}

pub async fn csv_download(req: Request<Arc<State>>) -> tide::Result {
    let dlreq: CsvRequest = req.query().map_err(|e| {
        tracing::error!(%e);
        e
    })?;

    let state = req.state();

    let content = match dlreq {
        CsvRequest {
            specs: Some(SpecsId(id)),
            user: None,
        } => {
            if id.contains('"') {
                tracing::error!(%id, "injection detected");
                return Ok(StatusCode::BadRequest.into());
            }

            let items = state
                .influx_client
                .query_raw(
                    &state.influx_cfg.org,
                    Some(Query::new(format!(
                        r#"
                    from(bucket: "{}")
                        |> range(start: 0)
                        |> filter(fn: (r) => r.specs == "{}")
                    "#,
                        state.influx_cfg.bucket, id,
                    ))),
                )
                .compat()
                .await?;

            items
        },
        CsvRequest {
            user: Some(UserId(id)),
            specs: None,
        } => {
            if id.contains('"') {
                tracing::error!(%id, "injection detected");
                return Ok(StatusCode::BadRequest.into());
            }

            let items = state
                .influx_client
                .query_raw(
                    &state.influx_cfg.org,
                    Some(Query::new(format!(
                        r#"
                    from(bucket: "{}")
                        |> range(start: 0)
                        |> filter(fn: (r) => r.user == "{}")
                    "#,
                        state.influx_cfg.bucket, id,
                    ))),
                )
                .compat()
                .await
                .map_err(|e| {
                    tracing::error!(%e);
                    e
                })?;

            items
        },

        _ => return Ok(StatusCode::BadRequest.into()),
    };

    let resp = {
        let mut resp = Response::from_res(content);
        resp.set_content_type("text/csv");
        resp
    };

    Ok(resp)
}
