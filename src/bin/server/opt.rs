use std::net::SocketAddr;

#[derive(structopt::StructOpt)]
pub struct Opt {
    #[structopt(default_value = "0.0.0.0:8080")]
    pub bind: SocketAddr,

    #[structopt(flatten)]
    pub influx: airspec::opt::Influx,
}
