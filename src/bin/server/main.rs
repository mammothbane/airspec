#![feature(option_result_contains)]

use std::sync::Arc;

use async_std::{
    channel,
};
use structopt::StructOpt;
use tonic::{
    Request,
    Response,
    Status,
    Streaming,
};

mod forward;
mod opt;
mod util;

use opt::*;

use airspec::pb::airspecs::{
    server,
    server::{
        RawSample,
        RawSampleResponse,
        SubmitPoint,
    },
};

#[derive(Clone, Debug)]
pub struct Server {
    msr_tx:        channel::Sender<influxdb2::models::DataPoint>,
    influx_client: Arc<influxdb2::Client>,
    influx_cfg:    airspec::opt::Influx,
}

#[tonic::async_trait]
impl server::backend_server::Backend for Server {
    type SubmitPointsStream = Self::SubmitSamplesStream;
    type SubmitSamplesStream = Box<
        dyn async_std::stream::Stream<Item = Result<server::SamplesAck, tonic::Status>>
            + Send
            + Unpin,
    >;

    async fn submit_raw_samples(
        &self,
        request: Request<Streaming<RawSample>>,
    ) -> Result<Response<RawSampleResponse>, Status> {
        let _contents = request.into_inner();

        let resp = Response::new(server::RawSampleResponse {
            status: server::raw_sample_response::RawSampleStatus::Ok.into(),
        });

        Ok(resp)
    }

    async fn submit_samples(
        &self,
        _request: Request<Streaming<airspec::pb::airspecs::bluetooth::SensorPacket>>,
    ) -> Result<Response<Self::SubmitSamplesStream>, Status> {
        todo!()
    }

    async fn submit_points(
        &self,
        _request: Request<Streaming<SubmitPoint>>,
    ) -> Result<Response<Self::SubmitPointsStream>, Status> {
        let _msr_tx = &self.msr_tx;
        todo!()
    }

    async fn dump(
        &self,
        request: Request<server::DumpRequest>,
    ) -> Result<Response<server::Csv>, Status> {
        use influxdb2::models::Query;
        use server::dump_request::What;

        let (field, id) = match request
            .into_inner()
            .what
            .ok_or_else(|| Status::invalid_argument("missing what field"))?
        {
            What::User(id) => ("user", id),
            What::SpecsId(id) => ("specs", id),
        };

        if id.contains('"') {
            tracing::error!(%id, "injection detected");
            return Err(Status::invalid_argument("injection detected"));
        }

        let query = format!(
            r#"
                    from(bucket: "{}")
                        |> range(start: 0)
                        |> filter(fn: (r) => r.{} == "{}")
                    "#,
            self.influx_cfg.bucket, field, id,
        );

        let csv = self
            .influx_client
            .query_raw(&self.influx_cfg.org, Some(Query::new(query)))
            .await
            .map_err(|e| {
                tracing::error!(?e, "influx request failed");
                Status::unavailable("datastore request failed")
            })?;

        Ok(Response::new(server::Csv {
            csv,
        }))
    }
}

#[async_std::main]
async fn main() -> eyre::Result<()> {
    airspec::trace::init(true);

    let Opt {
        bind,
        influx,
    } = Opt::from_args();

    let (msr_tx, msr_rx) = channel::bounded(4192);

    let token = influx.token_or_env().ok_or(eyre::eyre!("influx token was missing"))?;

    let client = influxdb2::Client::new(&influx.url, &token);
    let client = Arc::new(client);

    let influx_fwd =
        async_std::task::spawn(forward::forward_to_influx(client.clone(), influx.clone(), msr_rx));

    tonic::transport::server::Server::builder()
        .concurrency_limit_per_connection(256)
        .add_service(server::backend_server::BackendServer::new(Server {
            msr_tx,
            influx_client: client,
            influx_cfg: influx,
        }))
        .serve(bind)
        .await?;

    influx_fwd.await;

    Ok(())
}
