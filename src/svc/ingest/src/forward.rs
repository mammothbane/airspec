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

#[tracing::instrument(skip_all, fields(%chunk_size, ?chunk_timeout))]
pub async fn forward_to_influx(
    client: impl Borrow<influxdb2::Client>,
    influxcfg: crate::opt::Influx,
    chunk_size: usize,
    chunk_timeout: Duration,
    datapoints: impl Stream<Item = DataPoint> + Unpin + Send + Sync + 'static,
    empty_marker: Option<async_std::channel::Sender<()>>,
) {
    use futures_batch::ChunksTimeoutStreamExt;

    let mut datapoints = datapoints.chunks_timeout(chunk_size, chunk_timeout);
    let mut last_empty = false;

    while let Some(chunk) = datapoints.next().await {
        tracing::debug!(len = chunk.len(), "influx chunk");

        if chunk.is_empty() {
            tracing::debug!("skipping empty chunk");

            if !last_empty && let Some(ref x) = empty_marker {
                if let Err(e) = x.try_send(()) {
                    tracing::warn!(error = %e, "tried to notify about empty chunk");
                }
            }

            last_empty = true;

            continue;
        }

        last_empty = false;

        if let Err(e) = client
            .borrow()
            .write(&influxcfg.org, &influxcfg.bucket, async_std::stream::from_iter(chunk))
            .compat()
            .await
        {
            tracing::error!(%e, "submitting batch to influx");
        }
    }
}
