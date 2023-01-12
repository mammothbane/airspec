#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub struct Influx {
    #[structopt(short, long, default_value = "http://localhost:8086")]
    pub url: String,

    #[structopt(short, long)]
    pub token: String,

    #[structopt(short, long, default_value = "testbkt")]
    pub bucket: String,

    #[structopt(short, long, default_value = "test")]
    pub org: String,
}
