use async_compat::CompatExt;
use influxdb2::models::DataPoint;
use structopt::StructOpt;

#[async_std::main]
async fn main() -> eyre::Result<()> {
    airspec::trace::init(true);

    let opt: airspec::opt::Influx = airspec::opt::Influx::from_args();

    let token = opt.token_or_env().ok_or(eyre::eyre!("influx token missing"))?;
    let client = influxdb2::Client::new("http://localhost:8086", &token);

    let count = 3_000_000;

    let items = {
        let _span = tracing::info_span!("generating items", count).entered();

        let now = chrono::Utc::now();
        tracing::info!(now = now.timestamp(), "starting");
        let now = now.timestamp_nanos();

        (0i64..count)
            .enumerate()
            .map(|(i, elem)| {
                DataPoint::builder("testmsmt")
                    .timestamp(now + i as i64 * 10000)
                    .field("x", elem)
                    .build()
                    .unwrap()
            })
            .collect::<Vec<_>>()
    };

    let items = async_std::stream::from_iter(items);

    let _span = tracing::info_span!("sending items").entered();

    let start = std::time::Instant::now();

    client.write(&opt.org, &opt.bucket, items).compat().await?;

    let diff = std::time::Instant::now() - start;
    let frac_seconds = diff.as_secs_f64();
    let rate = count as f64 / frac_seconds;

    tracing::info!(duration = ?diff, %rate);

    Ok(())
}
