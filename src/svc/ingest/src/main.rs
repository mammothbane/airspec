use structopt::StructOpt;

use airspecs_ingest::*;

#[async_std::main]
async fn main() -> eyre::Result<()> {
    let opt: opt::Opt = opt::Opt::from_args();
    trace::init(true);

    run::serve(opt, None).await
}
