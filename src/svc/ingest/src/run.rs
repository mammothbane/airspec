use std::{
    sync::Arc,
    time::Duration,
};

use async_std::channel;
use tide::{
    listener::ToListener,
    utils::After,
    Response,
};

use crate::{
    auth,
    db::DEFAULT_STORE_PATH,
    endpoints,
    forward,
    opt,
};

#[derive(Clone, Debug)]
pub struct State {
    pub influx:     Arc<influxdb2::Client>,
    pub influx_cfg: opt::Influx,
    pub tx:         channel::Sender<influxdb2::models::DataPoint>,
}

pub async fn serve(
    bind: impl ToListener<State>,
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

    let mut server = tide::with_state(State {
        influx: client.clone(),
        influx_cfg,
        tx: msr_tx,
    });

    server
        // .with(auth::authenticate)
        .with(After(|resp: Response| async move {
            if let Some(e) = resp.error() {
                tracing::error!(request_error = ?e);
            } else if !resp.status().is_success() {
                tracing::warn!("error response without error");
            }

            Ok(resp)
        }));

    server.at("/dump").get(endpoints::dump);
    server.at("/").post(endpoints::ingest);

    let mut admin_route = server.at("/admin");

    admin_route.reset_middleware();
    admin_route.nest(endpoints::admin::server(*DEFAULT_STORE_PATH)?);

    tracing::info!("starting");
    server.listen(bind).await?;
    influx_fwd.await;

    Ok(())
}
