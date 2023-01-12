use std::sync::Arc;
use structopt::StructOpt;

mod opt;

use opt::*;

pub struct Connections {
    influx: influxdb2::Client,
}

async fn submit(mut req: tide::Request<Arc<Connections>>) -> tide::Result {
    let body = req.body_bytes().await?;
    let req: rmpv::ValueRef = rmp_serde::from_slice(&body)?;

    Ok("".into())
}

#[async_std::main]
async fn main() -> eyre::Result<()> {
    airspec::trace::init(true);

    let opt: Opt = Opt::from_args();

    let client = influxdb2::Client::new("http://localhost:8086", &opt.influx.org, opt.influx.token);
    let connections = Connections {
        influx: client,
    };

    let server = {
        let mut server = tide::with_state(Arc::new(connections));
        server.at("/submit").post(submit);
        server
    };

    server.listen(opt.bind).await?;

    Ok(())
}
