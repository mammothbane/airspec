use std::sync::Arc;

use async_std::channel;

use crate::{
    auth,
    endpoints,
    forward,
    opt,
};

#[derive(Clone)]
pub struct State {
    pub influx:     Arc<influxdb2::Client>,
    pub influx_cfg: opt::Influx,
    pub tx:         channel::Sender<influxdb2::models::DataPoint>,
}

pub async fn serve(opt: opt::Opt) -> eyre::Result<()> {
    let opt::Opt {
        bind,
        influx: influx_cfg,
    } = opt;

    let (msr_tx, msr_rx) = channel::bounded(4096);

    let token = influx_cfg.token_or_env().ok_or(eyre::eyre!("influx token was missing"))?;

    let client = influxdb2::Client::new(&influx_cfg.url, &token);
    let client = Arc::new(client);

    let influx_fwd = async_std::task::spawn(forward::forward_to_influx(
        client.clone(),
        influx_cfg.clone(),
        msr_rx,
    ));

    tracing::info!(bind = ?bind, "starting");

    let mut server = tide::with_state(State {
        influx: client.clone(),
        influx_cfg,
        tx: msr_tx,
    });

    server
        .with(auth::authenticate)
        .at("/")
        .post(endpoints::ingest)
        .at("/dump")
        .get(endpoints::dump);

    server.listen(bind).await?;
    influx_fwd.await;

    Ok(())
}
