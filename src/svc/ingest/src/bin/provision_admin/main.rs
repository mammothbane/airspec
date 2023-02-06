use itertools::Itertools;
use structopt::StructOpt;

use airspecs_ingest::{
    db,
    db::admin_token::AdminTokenData,
};

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub enum Opt {
    #[structopt(help = "create a new admin token")]
    New {
        #[structopt(help = "the name to associate with this admin token (e.g. \"Nathan\")")]
        name: String,

        #[structopt(long, help = "initialize this token as inactive")]
        inactive: bool,
    },

    #[structopt(help = "list info for current admin tokens")]
    List,

    #[structopt(help = "enable the token with the specified id")]
    Enable {
        id: u64,
    },

    #[structopt(help = "disable the token with the specified id")]
    Disable {
        id: u64,
    },
}

fn main() -> eyre::Result<()> {
    let opt = Opt::from_args();

    let store = db::default_store(*db::DEFAULT_STORE_PATH)?;

    match opt {
        Opt::New {
            inactive,
            name,
        } => {
            let (key, id) = db::admin_token::create(&store, AdminTokenData {
                name,
                active: !inactive,
            })?;

            eprintln!("created admin with id {id}");
            println!("{}", hex::encode(key));
        },

        Opt::List => {
            let items = db::admin_token::list(&store)?;

            let out = items.into_iter().map(|item| format!("{item:#?}")).join("\n");

            println!("{out}");
        },

        Opt::Enable {
            id,
        } => {
            db::admin_token::set_enabled(&store, id, true).map_err(|e| eyre::eyre!(e))?;
            eprintln!("ok");
        },

        Opt::Disable {
            id,
        } => {
            db::admin_token::set_enabled(&store, id, false).map_err(|e| eyre::eyre!(e))?;
            eprintln!("ok");
        },
    }

    Ok(())
}
