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
    msrs: impl Stream<Item = DataPoint> + Unpin + Send + Sync + 'static,
) {
    use futures_batch::ChunksTimeoutStreamExt;

    let mut msrs = msrs.chunks_timeout(chunk_size, chunk_timeout);

    while let Some(chunk) = msrs.next().await {
        if chunk.is_empty() {
            tracing::trace!("skipping empty chunk");
            continue;
        }

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
