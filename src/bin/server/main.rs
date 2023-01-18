#![feature(option_result_contains)]

use async_std::channel;
use structopt::StructOpt;

mod forward;
mod grpc;
mod opt;
mod util;

use opt::*;

#[async_std::main]
async fn main() -> eyre::Result<()> {
    airspec::trace::init(true);

    let Opt {
        bind,
        influx,
    } = Opt::from_args();

    let (msr_tx, msr_rx) = channel::bounded(4096);

    let token = influx.token_or_env().ok_or(eyre::eyre!("influx token was missing"))?;

    let client = influxdb2::Client::new(&influx.url, &token);
    let client = std::sync::Arc::new(client);

    let influx_fwd =
        async_std::task::spawn(forward::forward_to_influx(client.clone(), influx.clone(), msr_rx));

    tonic::transport::server::Server::builder()
        .concurrency_limit_per_connection(256)
        .add_service(airspec::pb::airspecs::server::backend_server::BackendServer::new(
            grpc::Server {
                msr_tx,
                influx_client: client,
                influx_cfg: influx,
            },
        ))
        .serve(bind)
        .await?;

    influx_fwd.await;

    Ok(())
}
