use std::sync::Arc;

use async_std::channel;
use tide::{
    listener::ToListener,
    utils::After,
    Response,
};

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

pub async fn serve(bind: impl ToListener<State>, influx_cfg: opt::Influx) -> eyre::Result<()> {
    let (msr_tx, msr_rx) = channel::bounded(4096);

    let token = influx_cfg.token_or_env().ok_or(eyre::eyre!("influx token was missing"))?;

    let client = influxdb2::Client::new(&influx_cfg.url, &token);
    let client = Arc::new(client);

    let influx_fwd = async_std::task::spawn(forward::forward_to_influx(
        client.clone(),
        influx_cfg.clone(),
        msr_rx,
    ));

    let mut server = tide::with_state(State {
        influx: client.clone(),
        influx_cfg,
        tx: msr_tx,
    });

    server
        .with(auth::authenticate)
        .with(After(|resp: Response| async move {
            if let Some(e) = resp.error() {
                tracing::error!(request_error = ?e);
            }

            Ok(resp)
        }))
        .at("/dump")
        .get(endpoints::dump)
        .at("/")
        .post(endpoints::ingest);

    tracing::info!("starting");
    server.listen(bind).await?;
    influx_fwd.await;

    Ok(())
}
