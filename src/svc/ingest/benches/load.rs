#![feature(duration_constants)]

use std::{
    ffi::c_int,
    path::Path,
    time::Duration,
};

use async_compat::CompatExt;
use criterion::{
    profiler::Profiler,
    BatchSize,
    Criterion,
    Throughput,
};
use futures::StreamExt;
use influxdb2::models::PostBucketRequest;
use pprof::ProfilerGuard;
use prost::Message;
use rand::{
    distributions::Standard,
    thread_rng,
    Rng,
};
use tap::{
    Pipe,
    TryConv,
};

use airspecs_ingest::{
    db,
    db::{
        admin_token::AdminTokenData,
        user_token::UserAuthData,
    },
    opt::{
        ChunkConfig,
        Influx,
        Prometheus,
    },
    trace,
};

const URL: &str = "http://localhost:8086";
const SERVER_SOCKETADDR: &str = "127.0.0.1:8181";

pub struct FlamegraphProfiler<'a> {
    frequency:       usize,
    active_profiler: Option<ProfilerGuard<'a>>,
}

impl<'a> Profiler for FlamegraphProfiler<'a> {
    fn start_profiling(&mut self, _benchmark_id: &str, _benchmark_dir: &Path) {
        tracing::info!("profiling!");
        self.active_profiler = Some(ProfilerGuard::new(self.frequency as c_int).unwrap())
    }

    fn stop_profiling(&mut self, benchmark_id: &str, benchmark_dir: &Path) {
        std::fs::create_dir_all(benchmark_dir).unwrap();

        let benchmark_id = benchmark_id.replace('/', "_");
        let flamegraph_path = benchmark_dir.join(format!("flamegraph_{benchmark_id}.svg"));

        tracing::info!(?flamegraph_path, ?benchmark_dir, "stop profiling");

        let flamegraph_file = std::fs::File::create(flamegraph_path)
            .expect("File system error while creating flamegraph");
        if let Some(profiler) = self.active_profiler.take() {
            profiler
                .report()
                .build()
                .unwrap()
                .flamegraph(flamegraph_file)
                .expect("Error writing flamegraph");
        } else {
            tracing::warn!("no profiler was active");
        }
    }
}

fn bench(c: &mut Criterion) {
    trace::init(true);

    let mut group = c.benchmark_group("submit");

    let influx_token = std::env::var("AIRSPEC_INFLUX_TOKEN").unwrap();
    let org_name = std::env::var("AIRSPEC_ORG_ID").unwrap();

    let client = influxdb2::Client::new(URL.to_string(), influx_token.clone());
    let bkt_name = airspecs_ingest::test::rand_string();

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

    let (tx, rx) = async_std::channel::bounded(1);

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
                chunk_timeout_millis: 3,
            },
            prometheus:   Prometheus {
                prometheus_bind: "127.0.0.1:0".parse().unwrap(),
            },
        },
        Some(tx),
    ));

    let user_token = async_std::task::block_on({
        let base_url = base_url.clone();

        async move {
            airspecs_ingest::test::wait_for_tcp(&SERVER_SOCKETADDR).await?;

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

    for batch_size in [16, 128, 384, 512, 768, 1024, 4192] {
        for num_batches in [1, 2, 4, 8, 16, 32, 64, 128] {
            group.throughput(Throughput::Elements(batch_size * num_batches));

            group.bench_with_input(
                format!("{batch_size}x{num_batches}"),
                &(batch_size, num_batches),
                |b, &(size, num_batches)| {
                    b.to_async(criterion::async_executor::AsyncStdExecutor).iter_batched(
                        || {
                            let reqs = (0..num_batches)
                                .map(|n| {
                                    let proto = airspecs_ingest::pb::SubmitPackets {
                                        sensor_data: (0..size)
                                            .map(|i| {
                                                airspecs_ingest::test::gen_packet(
                                                    (1_000_000 * n + i) as i32,
                                                )
                                            })
                                            .collect(),
                                        meta:        Some(
                                            airspecs_ingest::pb::submit_packets::Meta {
                                                epoch:     thread_rng().sample::<f64, _>(Standard),
                                                phone_uid: None,
                                            },
                                        ),
                                    };

                                    client
                                        .post("/")
                                        .body_bytes(proto.encode_to_vec())
                                        .content_type("application/protobuf")
                                        .build()
                                })
                                .collect::<Vec<_>>();

                            let rx = &rx;
                            async_std::task::block_on(async move {
                                airspecs_ingest::test::wait_for_tcp(&SERVER_SOCKETADDR).await?;

                                while rx.try_recv().is_ok() {}

                                Ok(()) as eyre::Result<()>
                            })
                            .unwrap();

                            reqs
                        },
                        |reqs| {
                            let client = &client;
                            let rx = &rx;

                            async move {
                                reqs.into_iter()
                                    .pipe(async_std::stream::from_iter)
                                    .for_each(|req| {
                                        let client = &client;

                                        async move {
                                            client.send(req).await.unwrap();
                                        }
                                    })
                                    .await;

                                rx.recv().await.unwrap();
                            }
                        },
                        BatchSize::LargeInput,
                    );
                },
            );
        }
    }

    group.finish();
}

criterion::criterion_group! {
    name = benches;
    config = Criterion::default().with_profiler(FlamegraphProfiler { frequency: 512, active_profiler: None });
    targets = bench
}

criterion::criterion_main!(benches);
