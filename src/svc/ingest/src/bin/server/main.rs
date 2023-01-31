#![feature(option_result_contains)]

use async_std::channel;
use structopt::StructOpt;

mod forward;
mod opt;

use opt::*;

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let Opt {
        bind,
        influx: influx_cfg,
    } = Opt::from_args();

    airspecs_ingest::trace::init(true);

    let (msr_tx, msr_rx) = channel::bounded(4096);

    let token = influx_cfg.token_or_env().ok_or(eyre::eyre!("influx token was missing"))?;

    let client = influxdb2::Client::new(&influx_cfg.url, &token);
    let client = std::sync::Arc::new(client);

    let influx_fwd = async_std::task::spawn(forward::forward_to_influx(
        client.clone(),
        influx_cfg.clone(),
        msr_rx,
    ));

    tracing::info!(bind = ?bind, "starting");

    influx_fwd.await;

    Ok(())
}
