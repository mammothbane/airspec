use std::str::FromStr;

use tracing_subscriber::{
    fmt::format::FmtSpan,
    prelude::*,
    EnvFilter,
};

pub fn init(pretty: bool) {
    color_eyre::install().unwrap();

    let stderr_layer =
        tracing_subscriber::fmt::layer().with_writer(std::io::stderr).with_target(false);

    let level_filter = mk_level_filter();
    eprintln!("enabling tracing with filter directive: {level_filter}");

    let s = tracing_subscriber::registry().with(level_filter);

    let span_events = FmtSpan::NONE;

    if pretty {
        s.with(stderr_layer.pretty().with_span_events(span_events)).init();
    } else {
        s.with(stderr_layer.with_line_number(false).with_timer(()).with_span_events(span_events))
            .init();
    }
}

fn mk_level_filter() -> EnvFilter {
    EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        let default_str = {
            cfg_if::cfg_if! {
                if #[cfg(not(debug_assertions))] {
                    "warn,airspec=info,influx_benchmark=info,server=info"
                } else {
                    "info,airspec=debug,influx_benchmark=debug,server=debug"
                }
            }
        };

        EnvFilter::from_str(default_str).expect("parsing envfilter default string")
    })
}
