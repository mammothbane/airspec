use std::{
    io,
    io::Write,
};

use itertools::Itertools;
use structopt::StructOpt;

use airspecs_ingest::{
    db,
    db::admin_token::AdminTokenData,
    trace,
};

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub enum Opt {
    #[structopt(about = "create a new admin token")]
    New {
        #[structopt(help = "the name to associate with this admin token (e.g. \"Nathan\")")]
        name: String,

        #[structopt(long, help = "initialize this token as inactive")]
        inactive: bool,
    },

    #[structopt(about = "list info for current admin tokens")]
    List,

    #[structopt(about = "enable the token with the specified id")]
    Enable {
        id: u64,
    },

    #[structopt(about = "disable the token with the specified id")]
    Disable {
        id: u64,
    },

    #[structopt(about = "subcommand: bad message records")]
    Message(Message),
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, structopt::StructOpt)]
pub enum Message {
    #[structopt(about = "list bad messages")]
    List,

    #[structopt(about = "dump the contents of a specific message")]
    Dump {
        id: u64,
    },

    #[structopt(about = "delete a specific message from the db")]
    Delete {
        id: u64,
    },

    #[structopt(about = "clean up bad message records from the db")]
    Clean {
        #[structopt(
            long,
            short = "r",
            help = "number of messages to retain (default: delete all)"
        )]
        retain: Option<usize>,
    },

    #[cfg(debug_assertions)]
    Dummy {
        #[structopt(
            long,
            short = "n",
            help = "number of dummy messages to create",
            default_value = "1"
        )]
        count: usize,
    },
}

fn handle_message(store: &kv::Store, msg: Message) -> eyre::Result<()> {
    use db::bad_packet;
    use Message::*;

    match msg {
        List => {
            let items = bad_packet::list(store)?;
            let out = items.into_iter().map(|item| item.to_string()).join("\n");

            eprintln!("{out}");
        },

        Dump {
            id,
        } => {
            let data = bad_packet::get(store, id)?;
            io::stdout().write_all(&data)?;
        },

        Delete {
            id,
        } => {
            let data = bad_packet::delete(store, id)?;
            let Some(_data) = data else {
                eprintln!("warn: no such message");
                return Ok(());
            };

            eprintln!("ok");
        },

        Clean {
            retain,
        } => {
            let packets_cleaned = bad_packet::clean(store, retain)?;
            let out = packets_cleaned.into_iter().map(|item| item.to_string()).join("\n");

            eprintln!("deleted packet ids:");
            println!("{out}");
        },

        #[cfg(debug_assertions)]
        Dummy {
            count,
        } => {
            (0..count).try_for_each(|_| {
                let id = bad_packet::save(store, &[0xf0, 0x0d])?;
                println!("{id}");

                Ok(()) as eyre::Result<()>
            })?;

            eprintln!("ok");
        },
    }

    Ok(())
}

fn main() -> eyre::Result<()> {
    let opt = Opt::from_args();
    trace::init(true);

    async_std::task::block_on(db::try_migrate(*db::DEFAULT_STORE_PATH))?;
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

        Opt::Message(msg) => handle_message(&store, msg)?,
    }

    Ok(())
}
