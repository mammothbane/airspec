use std::net::SocketAddr;

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub struct Opt {
    #[structopt(long, default_value = "0.0.0.0:8080")]
    pub bind: SocketAddr,

    #[structopt(flatten)]
    pub influx: airspec::opt::Influx,
}
