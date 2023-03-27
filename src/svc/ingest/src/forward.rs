use std::{
    borrow::Borrow,
    time::Duration,
};

use async_compat::CompatExt;
use async_std::prelude::{
    Stream,
    StreamExt,
};
use influxdb2::models::DataPoint;

lazy_static::lazy_static! {
    static ref CHUNKS_SUBMITTED: prometheus::IntCounter = prometheus::register_int_counter!("chunks_submitted", "chunks submitted to influx").unwrap();
    static ref CHUNKS_SUBMITTED_LEN: prometheus::Histogram = prometheus::register_histogram!("chunks_submitted_len", "lengths of chunks submitted to influx").unwrap();
    static ref SUBMIT_ERRORS: prometheus::IntCounter = prometheus::register_int_counter!("chunk_submit_errors", "errors submitting chunks to influx").unwrap();
}

#[tracing::instrument(skip_all, fields(%chunk_size, ?chunk_timeout))]
pub async fn forward_to_influx(
    client: impl Borrow<influxdb2::Client>,
    influxcfg: crate::opt::Influx,
    chunk_size: usize,
    chunk_timeout: Duration,
    datapoints: impl Stream<Item = Vec<DataPoint>> + Unpin + Send + Sync + 'static,
    empty_marker: Option<async_std::channel::Sender<()>>,
) {
    use crate::ChunksTimeoutStreamExt;

    let mut datapoints = datapoints
        .flat_map(async_std::stream::from_iter)
        .chunks_timeout(Some(chunk_size), chunk_timeout);

    let mut was_empty = false;

    while let Some(chunk) = datapoints.next().await {
        tracing::trace!(len = chunk.len(), "influx chunk");

        if chunk.is_empty() {
            tracing::trace!("skipping empty chunk");

            if !was_empty && let Some(ref x) = empty_marker {
                if let Err(e) = x.try_send(()) {
                    tracing::warn!(error = %e, "tried to notify about empty chunk");
                }
            }

            was_empty = true;

            continue;
        }
        was_empty = false;

        CHUNKS_SUBMITTED.inc();
        CHUNKS_SUBMITTED_LEN.observe(chunk.len() as f64);

        if let Err(e) = client
            .borrow()
            .write(&influxcfg.org, &influxcfg.bucket, async_std::stream::from_iter(chunk))
            .compat()
            .await
        {
            SUBMIT_ERRORS.inc();
            tracing::error!(%e, "submitting batch to influx");
        }
    }
}
