use std::{
    ops::Deref,
    sync::Arc,
};

use async_compat::CompatExt;
use futures::TryStreamExt;
use influxdb2::{
    models::Query,
    Client,
};
use smol::{
    stream,
    stream::{
        Stream,
        StreamExt,
    },
};
use tide::{
    Body,
    Response,
    StatusCode,
};
use tracing::Instrument;

use crate::opt::Influx;

#[derive(Debug, Clone)]
pub struct State {
    pub influx_cfg: Influx,
    pub influx:     Arc<Client>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Deserialize)]
pub struct DumpRequest {
    id:    String,
    start: i64,
    end:   i64,
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

fn base_query(
    state: &State,
    &DumpRequest {
        start,
        end,
        ref id,
    }: &DumpRequest,
) -> String {
    format!(
        r#"
        from(bucket: "{}")
            |> range(start: {start}, stop: {end})
            |> drop(columns: ["_start", "_stop"])
            |> filter(fn: (r) => r.system_uid == "{id}")
        "#,
        &state.influx_cfg.bucket,
    )
}

#[tracing::instrument(skip(state))]
pub async fn get_count(state: &State, req: &DumpRequest) -> tide::Result<usize> {
    let ret = state
        .influx
        .query_raw(
            &state.influx_cfg.org,
            Some(Query::new(format!(
                r#"
        {} |> count()
        "#,
                base_query(state, req)
            ))),
        )
        .compat()
        .await?;

    let ret = ret.trim();
    if ret.is_empty() {
        tracing::debug!("no rows");
        return Ok(0);
    }

    tracing::debug!(?ret);

    let x = serde_json::from_str::<serde_json::Value>(ret)?;
    tracing::debug!(count = ?x);

    Ok(0)
}

fn make_dump_query(state: &State, req: &DumpRequest, limit: usize, offset: usize) -> String {
    format!(
        r#"
            {}
            |> limit(n: {limit}, offset: {offset})
        "#,
        base_query(state, req),
    )
}

#[tracing::instrument(skip(client))]
pub async fn dump_once(
    client: Arc<Client>,
    org: String,
    query: String,
) -> Box<dyn Stream<Item = Result<bytes::Bytes, futures::io::Error>> + Send + Sync + Unpin + 'static>
{
    tracing::debug!("requesting csv");

    match client
        .query_raw_stream(&org, Some(Query::new(query)))
        .compat()
        .instrument(tracing::debug_span!("influx dump query"))
        .await
    {
        Ok(s) => {
            let err_mapped = s.map(|x| {
                x.map_err(|e| futures::io::Error::new(futures::io::ErrorKind::BrokenPipe, e))
            });

            Box::new(err_mapped)
        },
        Err(e) => Box::new(stream::once(Err(futures::io::Error::new(
            futures::io::ErrorKind::BrokenPipe,
            e,
        )))),
    }
}

pub async fn dump(
    req: tide::Request<impl Deref<Target = State> + Send + Sync + Unpin + 'static>,
) -> tide::Result {
    let dump_req = req.query::<DumpRequest>()?;

    tracing::debug!(?dump_req, "dump request");

    test_inject(&dump_req.id, "id")?;

    const LIMIT: usize = 10000;

    let state = req.state();
    let count = get_count(state, &dump_req).await?;

    tracing::info!(?count);

    let influx = state.influx.clone();
    let org = state.influx_cfg.org.to_string();

    let queries = (0..count)
        .step_by(LIMIT)
        .map(|n| make_dump_query(state, &dump_req, LIMIT, n))
        .collect::<Vec<_>>();

    let reqs = stream::iter(queries)
        .then(move |query| {
            let influx = influx.clone();
            let org = org.clone();

            async move {
                let ret = dump_once(influx, org, query).await;

                tracing::info!("single dump request");

                ret
            }
        })
        .flat_map(|x| x);

    let reader = reqs.into_async_read();
    let body = Body::from_reader(Box::pin(reader), None);

    Ok(Response::builder(StatusCode::Ok).content_type("text/csv").body(body).build())
}
