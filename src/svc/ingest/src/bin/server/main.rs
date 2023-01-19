#![feature(option_result_contains)]

use async_std::channel;
use structopt::StructOpt;

use airspecs_ingest::pb::{
    airspecs::svc,
    FILE_DESCRIPTOR_SET,
};

mod forward;
mod grpc;
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

    tonic::transport::server::Server::builder()
        .concurrency_limit_per_connection(256)
        .add_service(
            tonic_reflection::server::Builder::configure()
                .include_reflection_service(true)
                .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
                .build()?,
        )
        .add_service(svc::dump::csv_dump_server::CsvDumpServer::with_interceptor(
            grpc::Dump {
                influx_client: client,
                influx_cfg,
            },
            grpc::authenticate,
        ))
        .add_service(svc::ingest::ingest_server::IngestServer::with_interceptor(
            grpc::Ingest {
                msr_tx,
            },
            grpc::authenticate,
        ))
        .serve(bind)
        .await?;

    influx_fwd.await;

    Ok(())
}
