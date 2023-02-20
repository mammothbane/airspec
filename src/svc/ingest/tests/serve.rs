//! Hacky integration test for the server.
//!
//! Ensures that we can submit data to the bucket and the csv download isn't empty after we do so.
//!
//! Assumes influxd is running on port 8086 locally and your port 8181 is free to run the server.
//!
//! You must set environment variables AIRSPEC_INFLUX_TOKEN and AIRSPEC_ORG_ID (which is _not_ the
//! org name -- in the web ui, org square in the top left -> about -> organization id).
//!
//! Creates test buckets without expiry. If you care about not trashing your local instance with a
//! new bucket every time you run this test, maybe create another org to test in and then delete it
//! when you want to clean it out.

use std::{
    io,
    time::Duration,
};

use async_std::net::ToSocketAddrs;

use async_compat::CompatExt;
use influxdb2::models::PostBucketRequest;
use prost::Message;
use rand::Rng;
use tap::TryConv;

use airspecs_ingest::{
    db,
    db::{
        admin_token::AdminTokenData,
        user_token::UserAuthData,
    },
    opt::{
        ChunkConfig,
        Influx,
    },
    pb::{
        lux_packet,
        LuxPacket,
        SensorPacket,
        SensorPacketHeader,
    },
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

async fn request_dump(client: &surf::Client, id: u32) -> eyre::Result<String> {
    #[derive(serde::Serialize)]
    struct DumpReq {
        id: &'static str,
    }

    let mut resp = client
        .get(format!("/dump?id={id}&start=-10m&end=-0m"))
        .await
        .map_err(|e| eyre::eyre!("elp: {e}"))?;
    if !resp.status().is_success() {
        eyre::bail!("resp status: {}", resp.status());
    }

    let body = resp.body_string().await.map_err(|e| eyre::eyre!("dumping data: {}", e))?;
    Ok(body)
}

#[async_std::test]
pub async fn test_basic_serve() -> eyre::Result<()> {
    trace::init(true);

    let influx_token = std::env::var("AIRSPEC_INFLUX_TOKEN")?;
    let org_name = std::env::var("AIRSPEC_ORG_ID")?;

    let client = influxdb2::Client::new(URL.to_string(), influx_token.clone());

    let bkt_name = rand_string();
    tracing::info!(bkt_name);

    client
        .create_bucket(Some(PostBucketRequest::new(org_name.clone(), bkt_name.clone())))
        .compat()
        .await?;

    let tmp = tempdir::TempDir::new("airspec_test")?;
    let auth_db = tmp.path().join("admin.db");

    let admin_token = {
        let store = db::default_store(&auth_db)?;
        let (key, _) = db::admin_token::create(&store, AdminTokenData {
            active: true,
            name:   "test".to_string(),
        })?;

        key
    };

    let admin_token = hex::encode(admin_token);

    let server = async_std::task::spawn(airspecs_ingest::run::serve(
        airspecs_ingest::opt::Opt {
            bind:         SERVER_SOCKETADDR.parse()?,
            auth_db:      Some(auth_db),
            influx:       Influx {
                url:    URL.to_string(),
                token:  Some(influx_token),
                bucket: bkt_name,
                org:    org_name,
            },
            chunk_config: ChunkConfig {
                chunk_size:           1,
                chunk_timeout_millis: 10,
            },
        },
        None,
    ));

    let base_url: tide::http::Url = format!("http://{SERVER_SOCKETADDR}").parse()?;

    wait_for_tcp(&SERVER_SOCKETADDR).await?;

    let user_token = surf::post(base_url.join("/admin/auth_token")?)
        .body_json(&UserAuthData {
            active:     true,
            name:       "test".to_string(),
            expiration: None,
        })
        .map_err(|e| eyre::eyre!(e))?
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {admin_token}"))
        .await
        .map_err(|e| eyre::eyre!(e))?
        .body_string()
        .await
        .map_err(|e| eyre::eyre!(e))?;

    let user_token = user_token.trim();
    tracing::info!(%user_token);

    let client = surf::Config::new()
        .set_base_url(base_url)
        .set_timeout(Some(Duration::from_millis(1000)))
        .add_header("Authorization", format!("Bearer {user_token}"))
        .unwrap()
        .try_conv::<surf::Client>()?;

    request_dump(&client, 12).await?;

    let proto = airspecs_ingest::pb::SubmitPackets {
        sensor_data: vec![SensorPacket {
            header:  Some(SensorPacketHeader {
                system_uid:    37,
                ms_from_start: 37,
                epoch:         37,
            }),
            payload: Some(airspecs_ingest::pb::sensor_packet::Payload::LuxPacket(LuxPacket {
                packet_index:  0,
                sample_period: 0,

                gain:             1,
                integration_time: 2,

                payload: vec![lux_packet::Payload {
                    lux:                     20,
                    timestamp_ms_from_start: 1238,
                    timestamp_unix:          193,
                }],
            })),
        }],
        epoch:       129354.,
    };

    let proto_body = proto.encode_to_vec();

    let resp = client
        .post("")
        .body(proto_body)
        .content_type("application/protobuf")
        .await
        .map_err(|e| eyre::eyre!("err: {e}"))?;

    if !resp.status().is_success() {
        eyre::bail!("resp status: {}", resp.status());
    }

    async_std::task::sleep(Duration::from_millis(250)).await;

    let contents = request_dump(
        &client,
        proto.sensor_data.first().unwrap().header.as_ref().unwrap().system_uid,
    )
    .await?;
    let contents = contents.trim();
    assert!(!contents.is_empty());

    server.cancel().await;

    Ok(())
}
