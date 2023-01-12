#[derive(structopt::StructOpt)]
pub struct Influx {
    #[structopt(short, long)]
    pub token: String,

    #[structopt(short, long, default_value = "testbkt")]
    pub bucket: String,

    #[structopt(short, long, default_value = "test")]
    pub org: String,
}
