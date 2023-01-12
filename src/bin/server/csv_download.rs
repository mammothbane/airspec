use std::sync::Arc;

use influxdb2::models::Query;
use tide::Request;

use crate::{
    SpecsId,
    State,
    UserId,
};

#[derive(serde::Deserialize)]
pub enum CsvRequest {
    User {
        user: UserId,
    },
    Specs {
        specs: SpecsId,
    },
}

pub async fn csv_download(mut req: Request<Arc<State>>) -> tide::Result {
    let dlreq: CsvRequest = crate::util::decode_msgpack_or_json(&mut req).await?;

    let state = req.state();

    match dlreq {
        CsvRequest::Specs {
            specs: SpecsId(id),
        } => {
            let items = state
                .influx_client
                .query_raw(
                    &state.influx_cfg.org,
                    Some(Query::new(format!(
                        r#"
                    from(bucket: "{}")
                        |> filter(fn(r) => r.specs == "{}")
                        |> yield()
                    "#,
                        state.influx_cfg.bucket, id,
                    ))),
                )
                .await?;

            Ok(items.into())
        },
        CsvRequest::User {
            user: UserId(id),
        } => {
            let items = state
                .influx_client
                .query_raw(
                    &state.influx_cfg.org,
                    Some(Query::new(format!(
                        r#"
                    from(bucket: "{}")
                        |> filter(fn(r) => r.user == "{}")
                        |> yield()
                    "#,
                        state.influx_cfg.bucket, id,
                    ))),
                )
                .await?;

            Ok(items.into())
        },
    }
}
