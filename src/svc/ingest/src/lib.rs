#![feature(option_result_contains)]
#![feature(exclusive_range_pattern)]
#![feature(try_blocks)]
#![feature(let_chains)]
#![feature(duration_constants)]
#![feature(int_roundings)]

pub mod auth;
pub mod db;
pub mod endpoints;
pub mod forward;
pub mod opt;
pub mod prometheus;
pub mod run;
pub mod trace;
pub mod util;

#[cfg(any(test, feature = "bench"))]
pub mod test;

mod normalize;

#[rustfmt::skip]
#[path = "pb/_.rs"]
pub mod pb;

mod batch;

pub use batch::*;
