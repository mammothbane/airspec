use std::time::Duration;

use async_compat::CompatExt;
use influxdb2::models::PostBucketRequest;
use rand::Rng;
use tap::TryConv;

use airspecs_ingest::{
    opt::Influx,
    trace,
};

const URL: &str = "http://localhost:8086";

fn rand_string() -> String {
    rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(16)
        .map(char::from)
        .collect::<String>()
}

#[async_std::test]
pub async fn test_basic_serve() -> eyre::Result<()> {
    trace::init(true);

    let token = std::env::var("AIRSPEC_INFLUX_TOKEN")?;
    let org_name = std::env::var("AIRSPEC_ORG_ID")?;

    let client = influxdb2::Client::new(URL.to_string(), token.clone());

    let bkt_name = rand_string();

    client
        .create_bucket(Some(PostBucketRequest::new(org_name.clone(), bkt_name.clone())))
        .compat()
        .await?;

    let server = async_std::task::spawn(airspecs_ingest::run::serve("127.0.0.1:8181", Influx {
        url:    URL.to_string(),
        token:  Some(token),
        bucket: org_name,
        org:    bkt_name,
    }));

    async_std::task::sleep(Duration::from_secs(1)).await;

    let client = surf::Config::new()
        .set_base_url("http://127.0.0.1:8181".parse()?)
        .set_timeout(Some(Duration::from_millis(1000)))
        .add_header("Authorization", "")
        .unwrap()
        .try_conv::<surf::Client>()?;

    #[derive(serde::Serialize)]
    struct DumpReq {
        id: &'static str,
    }

    let mut resp = client.get("/dump?id=lskjddf").await.map_err(|e| eyre::eyre!("elp: {e}"))?;

    if !resp.status().is_success() {
        eyre::bail!("resp status: {}", resp.status());
    }

    let body = resp.body_string().await.map_err(|e| eyre::eyre!("dumping data: {}", e))?;

    println!("result: {body}");

    server.cancel().await;

    Ok(())
}
