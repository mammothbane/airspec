use std::sync::Arc;

use async_std::channel;
use tonic::{
    metadata::MetadataMap,
    Request,
    Response,
    Status,
    Streaming,
};

use airspec::pb::airspecs::{
    server,
    server::{
        Point,
        RawSample,
        RawSampleResponse,
    },
};

const AUTH_KEY: &str = "Authentication";

#[derive(Clone, Debug)]
pub struct Server {
    pub msr_tx:        channel::Sender<influxdb2::models::DataPoint>,
    pub influx_client: Arc<influxdb2::Client>,
    pub influx_cfg:    airspec::opt::Influx,
}

impl Server {
    fn verify_auth(&self, meta: &MetadataMap) -> Result<(), tonic::Status> {
        let _auth_value = meta.get(AUTH_KEY).ok_or_else(|| {
            tonic::Status::unauthenticated(format!(
                "auth key (metadata field: \"{AUTH_KEY}\") missing"
            ))
        })?;

        Ok(())
    }
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
        self.verify_auth(request.metadata())?;

        let _contents = request.into_inner();

        let resp = Response::new(server::RawSampleResponse {
            status: server::raw_sample_response::RawSampleStatus::Ok.into(),
        });

        Ok(resp)
    }

    async fn submit_samples(
        &self,
        request: Request<Streaming<airspec::pb::airspecs::bluetooth::SensorPacket>>,
    ) -> Result<Response<Self::SubmitSamplesStream>, Status> {
        self.verify_auth(request.metadata())?;

        todo!()
    }

    async fn submit_points(
        &self,
        request: Request<Streaming<Point>>,
    ) -> Result<Response<Self::SubmitPointsStream>, Status> {
        self.verify_auth(request.metadata())?;
        let _msr_tx = &self.msr_tx;
        todo!()
    }

    async fn dump(
        &self,
        request: Request<server::DumpRequest>,
    ) -> Result<Response<server::Csv>, Status> {
        use influxdb2::models::Query;
        use server::dump_request::What;

        self.verify_auth(request.metadata())?;

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
