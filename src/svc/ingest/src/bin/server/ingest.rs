use async_std::channel;
use tonic::{
    Request,
    Response,
    Status,
    Streaming,
};

use airspecs_ingest::pb::airspecs::svc::ingest::{
    self,
    Point,
    RawSample,
    RawSampleResponse,
};

#[derive(Clone, Debug)]
pub struct Ingest {
    pub msr_tx: channel::Sender<influxdb2::models::DataPoint>,
}

#[tonic::async_trait]
impl ingest::ingest_server::Ingest for Ingest {
    type SubmitPointsStream = Self::SubmitSamplesStream;
    type SubmitSamplesStream = Box<
        dyn async_std::stream::Stream<Item = Result<ingest::SamplesAck, Status>> + Send + Unpin,
    >;

    async fn submit_raw_samples(
        &self,
        request: Request<Streaming<RawSample>>,
    ) -> Result<Response<RawSampleResponse>, Status> {
        let _contents = request.into_inner();

        let resp = Response::new(RawSampleResponse {
            status: ingest::raw_sample_response::RawSampleStatus::Ok.into(),
        });

        Ok(resp)
    }

    async fn submit_samples(
        &self,
        _request: Request<Streaming<airspecs_ingest::pb::airspecs::bluetooth::SensorPacket>>,
    ) -> Result<Response<Self::SubmitSamplesStream>, Status> {
        todo!()
    }

    async fn submit_points(
        &self,
        _request: Request<Streaming<Point>>,
    ) -> Result<Response<Self::SubmitPointsStream>, Status> {
        let _msr_tx = &self.msr_tx;
        todo!()
    }
}
