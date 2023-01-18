use std::borrow::Borrow;

use async_compat::CompatExt;
use async_std::prelude::Stream;
use influxdb2::models::DataPoint;

pub async fn forward_to_influx(
    client: impl Borrow<influxdb2::Client>,
    influxcfg: airspec::opt::Influx,
    msrs: impl Stream<Item = DataPoint> + Unpin + Send + Sync + 'static,
) {
    cfg_if::cfg_if! {
        if #[cfg(feature = "chunked")] {
            use futures_batch::ChunksTimeoutStreamExt;

            let mut msrs = msrs
                .chunks_timeout(1024 * 16, std::time::Duration::from_millis(5_000));

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
        } else {
            if let Err(e) = client
                .borrow()
                .write(&influxcfg.org, &influxcfg.bucket, msrs)
                .compat()
                .await
            {
                tracing::error!(%e, "submitting batch to influx");
            }
        }
    }
}
