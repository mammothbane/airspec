use std::{
    sync::Arc,
    time::Duration,
};

use async_std::{
    channel,
    channel::Sender,
};
use tide::{
    http::headers::HeaderValue,
    security::CorsMiddleware,
};

use crate::{
    auth,
    auth::WithStore,
    db,
    endpoints,
    forward,
    opt::Opt,
    trace,
    util,
};

pub async fn serve(
    Opt {
        bind,
        auth_db,
        influx: influx_cfg,
        chunk_config: chunk_cfg,
        prometheus,
    }: Opt,
    empty_marker: Option<Sender<()>>,
) -> eyre::Result<()> {
    let channel_size: usize = chunk_cfg.chunk_size * 8;
    tracing::debug!(%channel_size);

    let (msr_tx, msr_rx) = channel::bounded(channel_size);

    let token = influx_cfg.token_or_env().ok_or(eyre::eyre!("influx token was missing"))?;

    let client = influxdb2::Client::new(&influx_cfg.url, &token);
    let client = Arc::new(client);

    let influx_fwd = async_std::task::spawn(forward::forward_to_influx(
        client.clone(),
        influx_cfg.clone(),
        chunk_cfg.chunk_size,
        Duration::from_millis(chunk_cfg.chunk_timeout_millis as u64),
        msr_rx,
        empty_marker,
    ));

    let prometheus =
        async_std::task::spawn(crate::prometheus::serve_prometheus(prometheus.prometheus_bind));

    let mut server = tide::new();

    server.with(trace::middleware).with(util::error_middleware);

    server.with(
        CorsMiddleware::new()
            .allow_credentials(true)
            .allow_origin("*")
            .allow_methods("*".parse::<HeaderValue>().unwrap()),
    );

    server.with(crate::prometheus::middleware);

    let auth_store = db::default_store(auth_db.as_deref().unwrap_or(*db::DEFAULT_STORE_PATH))?;
    let auth_store = Arc::new(auth_store);

    let mut dump_server = tide::with_state(WithStore(
        endpoints::dump::State {
            influx_cfg,
            influx: client.clone(),
        },
        auth_store.clone(),
    ));

    dump_server.with(auth::authenticate);
    dump_server.at("/").get(endpoints::dump);

    let mut ingest_server =
        tide::with_state(WithStore(endpoints::ingest::State(msr_tx), auth_store.clone()));

    ingest_server.with(auth::authenticate);
    ingest_server.at("/").post(endpoints::ingest);

    server.at("/dump").nest(dump_server);
    server.at("/").nest(ingest_server);
    server.at("/admin").nest(endpoints::admin::server(auth_store));

    tracing::info!("starting");
    server.listen(bind).await?;

    influx_fwd.await;
    prometheus.cancel().await;

    Ok(())
}
