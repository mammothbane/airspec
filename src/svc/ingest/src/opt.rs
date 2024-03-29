use std::{
    net::SocketAddr,
    path::PathBuf,
};

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub struct Influx {
    #[structopt(short, long, default_value = "http://localhost:8086")]
    pub url: String,

    #[structopt(short, long, help = "if missing, reads from TOKEN env var")]
    pub token: Option<String>,

    #[structopt(short, long, default_value = "testbkt")]
    pub bucket: String,

    #[structopt(short, long, default_value = "test")]
    pub org: String,
}

impl Influx {
    pub fn token_or_env(&self) -> Option<String> {
        self.token.clone().or_else(|| std::env::var("TOKEN").ok())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub struct ChunkConfig {
    #[structopt(long, default_value = "16384")]
    pub chunk_size: usize,

    #[structopt(long, default_value = "5000")]
    pub chunk_timeout_millis: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub struct Prometheus {
    #[structopt(long, default_value = "0.0.0.0:8081")]
    pub prometheus_bind: SocketAddr,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub struct Opt {
    #[structopt(long, default_value = "0.0.0.0:8080")]
    pub bind: SocketAddr,

    #[structopt(long)]
    pub db: Option<PathBuf>,

    #[structopt(flatten)]
    pub chunk_config: ChunkConfig,

    #[structopt(flatten)]
    pub influx: Influx,

    #[structopt(flatten)]
    pub prometheus: Prometheus,
}
