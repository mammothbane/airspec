use std::borrow::Borrow;

use async_std::{
    prelude::Stream,
    stream::StreamExt,
};
use futures_batch::ChunksTimeoutStreamExt;
use influxdb2::models::DataPoint;

use crate::Measurement;

pub async fn forward_to_influx(
    client: impl Borrow<influxdb2::Client>,
    influxcfg: airspec::opt::Influx,
    msrs: impl Stream<Item = Measurement> + Unpin,
) {
    let mut msrs = msrs
        .filter(|msr: &Measurement| !msr.values.is_empty())
        .map(|msr: Measurement| {
            let builder = DataPoint::builder(msr.sensor)
                .timestamp(msr.timestamp.timestamp_nanos())
                .tag("user", msr.user.0)
                .tag("specs", msr.specs.0);

            msr.values
                .into_iter()
                .fold(builder, |builder, (k, v)| builder.field(k, v))
                .build()
                .unwrap() // safe given filter on empty above -- only errors if no fields added
        })
        .chunks_timeout(1024 * 32, std::time::Duration::from_millis(5_000));

    while let Some(chunk) = msrs.next().await {
        if chunk.is_empty() {
            tracing::trace!("skipping empty chunk");
            continue;
        }

        if let Err(e) = client
            .borrow()
            .write(&influxcfg.org, &influxcfg.bucket, async_std::stream::from_iter(chunk))
            .await
        {
            tracing::error!(%e, "submitting batch to influx");
        }
    }
}
