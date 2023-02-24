#![feature(duration_constants)]

use std::{
    io,
    time::Duration,
};

use async_compat::CompatExt;
use async_std::net::ToSocketAddrs;
use criterion::{
    BatchSize,
    Criterion,
    Throughput,
};
use influxdb2::models::PostBucketRequest;
use prost::Message;
use rand::{
    distributions::Standard,
    thread_rng,
    Rng,
    RngCore,
};
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
    thread_rng()
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

fn gen_packet(i: i32) -> SensorPacket {
    let mut rng = thread_rng();

    SensorPacket {
        header:  Some(SensorPacketHeader {
            system_uid:    0,
            ms_from_start: i as u32,
            epoch:         i as u32,
        }),
        payload: Some(airspecs_ingest::pb::sensor_packet::Payload::LuxPacket(LuxPacket {
            packet_index:  rng.next_u32(),
            sample_period: rng.next_u32(),

            gain:             rng.next_u32() as i32,
            integration_time: rng.next_u32() as i32,

            payload: vec![lux_packet::Payload {
                lux:                     rng.next_u32(),
                timestamp_ms_from_start: rng.next_u32(),
                timestamp_unix:          rng.next_u32(),
            }],
        })),
    }
}

fn bench(c: &mut Criterion) {
    trace::init(true);

    let mut group = c.benchmark_group("submit");

    let influx_token = std::env::var("AIRSPEC_INFLUX_TOKEN").unwrap();
    let org_name = std::env::var("AIRSPEC_ORG_ID").unwrap();

    let client = influxdb2::Client::new(URL.to_string(), influx_token.clone());
    let bkt_name = rand_string();

    let tmp = tempdir::TempDir::new("airspec_test").unwrap();
    let auth_db = tmp.path().join("admin.db");

    let admin_token = {
        let store = db::default_store(&auth_db).unwrap();
        let (key, _) = db::admin_token::create(&store, AdminTokenData {
            active: true,
            name:   "test".to_string(),
        })
        .unwrap();

        key
    };

    let admin_token = hex::encode(admin_token);
    let base_url: tide::http::Url = format!("http://{SERVER_SOCKETADDR}").parse().unwrap();

    async_std::task::block_on({
        let org_name = org_name.clone();
        let bkt_name = bkt_name.clone();

        async move {
            client.create_bucket(Some(PostBucketRequest::new(org_name, bkt_name))).compat().await
        }
    })
    .unwrap();

    let (tx, rx) = async_std::channel::unbounded();

    async_std::task::spawn(airspecs_ingest::run::serve(
        airspecs_ingest::opt::Opt {
            bind:         SERVER_SOCKETADDR.parse().unwrap(),
            auth_db:      Some(auth_db),
            influx:       Influx {
                url:    URL.to_string(),
                token:  Some(influx_token),
                bucket: bkt_name,
                org:    org_name,
            },
            chunk_config: ChunkConfig {
                chunk_size:           16384,
                chunk_timeout_millis: 100,
            },
        },
        Some(tx),
    ));

    let user_token = async_std::task::block_on({
        let base_url = base_url.clone();

        async move {
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

            Ok(user_token.trim().to_string()) as eyre::Result<String>
        }
    })
    .unwrap();

    let client = surf::Config::new()
        .set_base_url(base_url)
        .set_timeout(Some(Duration::from_millis(1000)))
        .add_header("Authorization", format!("Bearer {user_token}"))
        .unwrap()
        .try_conv::<surf::Client>()
        .unwrap();

    for size in [16, 128, 384, 512, 768, 1024, 16384, 16384 * 4] {
        group.throughput(Throughput::Elements(size));

        group.bench_with_input(format!("{size}"), &size, |b, &size| {
            b.to_async(criterion::async_executor::AsyncStdExecutor).iter_batched(
                || {
                    let proto = airspecs_ingest::pb::SubmitPackets {
                        sensor_data: (0..size).map(|i| gen_packet(i as i32)).collect(),
                        meta:        Some(airspecs_ingest::pb::submit_packets::Meta {
                            epoch:     thread_rng().sample::<f64, _>(Standard),
                            phone_uid: None,
                        }),
                    };

                    let req = client
                        .post("/")
                        .body_bytes(proto.encode_to_vec())
                        .content_type("application/protobuf")
                        .build();

                    let rx = &rx;
                    async_std::task::block_on(async move {
                        wait_for_tcp(&SERVER_SOCKETADDR).await?;

                        while rx.try_recv().is_ok() {}

                        Ok(()) as eyre::Result<()>
                    })
                    .unwrap();

                    req
                },
                |req| {
                    let client = &client;
                    let rx = &rx;

                    async move {
                        client.send(req).await.unwrap();

                        println!("awaiting recv");
                        rx.recv().await.unwrap();
                        println!("recv");
                    }
                },
                BatchSize::LargeInput,
            );
        });
    }

    group.finish();
}

criterion::criterion_group!(benches, bench);
criterion::criterion_main!(benches);
