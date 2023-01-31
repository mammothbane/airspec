use std::net::SocketAddr;

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
pub struct Opt {
    #[structopt(long, default_value = "0.0.0.0:8080")]
    pub bind: SocketAddr,

    #[structopt(flatten)]
    pub influx: Influx,
}
