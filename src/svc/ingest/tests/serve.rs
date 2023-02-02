use std::{
    io,
    time::Duration,
};

use async_std::net::ToSocketAddrs;

use async_compat::CompatExt;
use influxdb2::models::PostBucketRequest;
use rand::Rng;
use tap::TryConv;

use airspecs_ingest::{
    opt::Influx,
    trace,
};

const URL: &str = "http://localhost:8086";
const SERVER_SOCKETADDR: &str = "127.0.0.1:8181";

fn rand_string() -> String {
    rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(16)
        .map(char::from)
        .collect::<String>()
}

async fn wait_for_tcp(a: &impl ToSocketAddrs) -> eyre::Result<()> {
    loop {
        match async_std::net::TcpStream::connect(a).await {
            Ok(_) => break,
            Err(e) if e.kind() == io::ErrorKind::ConnectionRefused => {
                async_std::task::sleep(Duration::from_millis(50)).await;
            },
            Err(e) => return Err(e.into()),
        }
    }

    Ok(())
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

    let server = async_std::task::spawn(airspecs_ingest::run::serve(SERVER_SOCKETADDR, Influx {
        url:    URL.to_string(),
        token:  Some(token),
        bucket: bkt_name,
        org:    org_name,
    }));

    let client = surf::Config::new()
        .set_base_url(format!("http://{SERVER_SOCKETADDR}").parse()?)
        .set_timeout(Some(Duration::from_millis(1000)))
        .add_header("Authorization", "")
        .unwrap()
        .try_conv::<surf::Client>()?;

    #[derive(serde::Serialize)]
    struct DumpReq {
        id: &'static str,
    }

    wait_for_tcp(&SERVER_SOCKETADDR).await?;

    let mut resp = client.get("/dump?id=lskjddf").await.map_err(|e| eyre::eyre!("elp: {e}"))?;

    if !resp.status().is_success() {
        eyre::bail!("resp status: {}", resp.status());
    }

    let body = resp.body_string().await.map_err(|e| eyre::eyre!("dumping data: {}", e))?;

    println!("result: {body}");

    server.cancel().await;

    Ok(())
}
