use std::{
    sync::Arc,
    time::Duration,
};

use async_std::channel;
use tide::{
    listener::ToListener,
    security::CorsMiddleware,
    utils::After,
    Response,
};

use crate::{
    auth,
    db::DEFAULT_STORE_PATH,
    endpoints,
    forward,
    opt,
    trace,
};

pub async fn serve(
    bind: impl ToListener<()>,
    influx_cfg: opt::Influx,
    chunk_cfg: opt::ChunkConfig,
) -> eyre::Result<()> {
    let (msr_tx, msr_rx) = channel::bounded(4096);

    let token = influx_cfg.token_or_env().ok_or(eyre::eyre!("influx token was missing"))?;

    let client = influxdb2::Client::new(&influx_cfg.url, &token);
    let client = Arc::new(client);

    let influx_fwd = async_std::task::spawn(forward::forward_to_influx(
        client.clone(),
        influx_cfg.clone(),
        chunk_cfg.chunk_size,
        Duration::from_millis(chunk_cfg.chunk_timeout_millis as u64),
        msr_rx,
    ));

    let mut server = tide::new();

    server.with(trace::middleware).with(After(|resp: Response| async move {
        if let Some(e) = resp.error() {
            tracing::error!(request_error = ?e);
        } else if !resp.status().is_success() {
            tracing::warn!("error response without error");
        }

        Ok(resp)
    }));

    #[cfg(debug_assertions)]
    {
        server.with(CorsMiddleware::new().allow_credentials(true).allow_origin("*"));
    }

    let mut dump_server = tide::with_state(endpoints::dump::State {
        influx_cfg,
        influx: client.clone(),
    });

    dump_server.with(auth::authenticate);
    dump_server.at("/").get(endpoints::dump);

    let mut ingest_server = tide::with_state(endpoints::ingest::State(msr_tx));

    ingest_server.with(auth::authenticate);
    ingest_server.at("/").post(endpoints::ingest);

    server.at("/dump").nest(dump_server);
    server.at("/").nest(ingest_server);
    server.at("/admin").nest(endpoints::admin::server(*DEFAULT_STORE_PATH)?);

    tracing::info!("starting");
    server.listen(bind).await?;
    influx_fwd.await;

    Ok(())
}
