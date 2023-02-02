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
    opt::{
        ChunkConfig,
        Influx,
    },
    pb::{
        lux_packet,
        sgp_packet,
        LuxPacket,
        SensorPacket,
        SensorPacketHeader,
        SgpPacket,
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

    let mut resp =
        client.get(format!("/dump?id={id}")).await.map_err(|e| eyre::eyre!("elp: {e}"))?;
    if !resp.status().is_success() {
        eyre::bail!("resp status: {}", resp.status());
    }

    let body = resp.body_string().await.map_err(|e| eyre::eyre!("dumping data: {}", e))?;
    Ok(body)
}

#[async_std::test]
pub async fn test_basic_serve() -> eyre::Result<()> {
    trace::init(true);

    let token = std::env::var("AIRSPEC_INFLUX_TOKEN")?;
    let org_name = std::env::var("AIRSPEC_ORG_ID")?;

    let client = influxdb2::Client::new(URL.to_string(), token.clone());

    let bkt_name = rand_string();
    tracing::info!(bkt_name);

    client
        .create_bucket(Some(PostBucketRequest::new(org_name.clone(), bkt_name.clone())))
        .compat()
        .await?;

    let server = async_std::task::spawn(airspecs_ingest::run::serve(
        SERVER_SOCKETADDR,
        Influx {
            url:    URL.to_string(),
            token:  Some(token),
            bucket: bkt_name,
            org:    org_name,
        },
        ChunkConfig {
            chunk_size:           1,
            chunk_timeout_millis: 10,
        },
    ));

    let client = surf::Config::new()
        .set_base_url(format!("http://{SERVER_SOCKETADDR}").parse()?)
        .set_timeout(Some(Duration::from_millis(1000)))
        .add_header("Authorization", "")
        .unwrap()
        .try_conv::<surf::Client>()?;

    wait_for_tcp(&SERVER_SOCKETADDR).await?;
    request_dump(&client, 12).await?;

    let proto = airspecs_ingest::pb::SubmitPackets {
        sensor_data: vec![SensorPacket {
            header:       Some(SensorPacketHeader {
                packet_type:    37,
                system_uid:     37,
                packet_id:      37,
                ms_from_start:  37,
                epoch:          37,
                payload_length: 37,
            }),
            lux_packet:   Some(LuxPacket {
                gain:             1,
                integration_time: 2,
                payload:          vec![lux_packet::Payload {
                    lux:       20,
                    timestamp: 193,
                }],
            }),
            sgp_packet:   Some(SgpPacket {
                payload: vec![sgp_packet::Payload {
                    sraw_voc:        10923,
                    sraw_nox:        19029,
                    voc_index_value: 12375,
                    nox_index_value: 1203,
                    timestamp:       1238,
                }],
            }),
            bme_packet:   None,
            blink_packet: None,
            sht_packet:   None,
            spec_packet:  None,
            therm_packet: None,
            imu_packet:   None,
            mic_packet:   None,
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
