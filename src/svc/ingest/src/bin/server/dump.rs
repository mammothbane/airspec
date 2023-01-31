use std::sync::Arc;

use influxdb2::models::Query;
use tonic::{
    Request,
    Response,
    Status,
};

use airspecs_ingest::pb::airspecs::svc::dump::{
    self,
    dump_request::What,
    Csv,
    DumpRequest,
};

pub struct Dump {
    pub influx_client: Arc<influxdb2::Client>,
    pub influx_cfg:    airspecs_ingest::opt::Influx,
}

#[tonic::async_trait]
impl dump::csv_dump_server::CsvDump for Dump {
    async fn dump(&self, request: Request<DumpRequest>) -> Result<Response<Csv>, Status> {
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

        Ok(Response::new(Csv {
            csv,
        }))
    }
}
