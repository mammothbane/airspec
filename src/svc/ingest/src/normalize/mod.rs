use chrono::{
    TimeZone,
    Utc,
};
use influxdb2::models::{
    data_point::{
        DataPointBuilder,
        DataPointError,
    },
    DataPoint,
};
use std::time::Duration;

mod app_metadata;
mod blink;
mod bme;
mod imu;
mod lux;
mod mic;
mod mic_level;
mod sgp;
mod sht;
mod spec;
mod survey;
mod therm;

const MINUTE: Duration = Duration::from_secs(60);
const HOUR: Duration = Duration::from_secs(MINUTE.as_secs() * 60);
const DAY: Duration = Duration::from_secs(HOUR.as_secs() * 24);
const MONTH: Duration = Duration::from_secs(DAY.as_secs() * 30);
const YEAR: Duration = Duration::from_secs(MONTH.as_secs() * 365);

const TIME_BINS: &[Duration] = &[Duration::SECOND, MINUTE, HOUR, DAY, MONTH, YEAR];

fn make_time_bins() -> Vec<f64> {
    let as_f64 = TIME_BINS.iter().map(|x| x.as_secs_f64());

    as_f64.clone().rev().map(|x| -x).chain(std::iter::once(0.)).chain(as_f64).collect()
}

lazy_static::lazy_static! {
    static ref TIMESTAMP_ERROR: prometheus::HistogramVec
        = prometheus::register_histogram_vec!(
            "timestamp_error",
            "sensor reading timestamp error compared to current server time (seconds)",
            &["sensor"],
            make_time_bins(),
        ).unwrap();

    static ref TIMESTAMP_FUTURE: prometheus::IntCounterVec
        = prometheus::register_int_counter_vec!(
            "timestamp_in_future",
            "timestamps over 5m in the future",
            &["sensor"],
        ).unwrap();
}

#[inline]
pub fn inspect_ts_error(now: chrono::DateTime<Utc>, sensor: &str, ts: i64) -> i64 {
    let now = now.timestamp_nanos();

    let diff = now - ts;
    let secs_diff = Duration::from_nanos(diff.unsigned_abs()).as_secs_f64() * diff.signum() as f64;

    TIMESTAMP_ERROR
        .with(&prometheus::labels! {
            "sensor" => sensor,
        })
        .observe(secs_diff);

    if diff < -5 * MINUTE.as_nanos() as i64 {
        TIMESTAMP_FUTURE
            .with(&prometheus::labels! {
                "sensor" => sensor,
            })
            .inc();
    }

    ts
}

pub trait ToDatapoints {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint;
}

pub trait AugmentDatapoint {
    fn augment_data_point(&self, builder: DataPointBuilder) -> DataPointBuilder;
}

impl AugmentDatapoint for () {
    #[inline]
    fn augment_data_point(&self, builder: DataPointBuilder) -> DataPointBuilder {
        builder
    }
}

impl AugmentDatapoint for Vec<&dyn AugmentDatapoint> {
    fn augment_data_point(&self, builder: DataPointBuilder) -> DataPointBuilder {
        self.iter().fold(builder, |builder, x| x.augment_data_point(builder))
    }
}

impl AugmentDatapoint for crate::pb::SensorPacketHeader {
    fn augment_data_point(&self, builder: DataPointBuilder) -> DataPointBuilder {
        builder
            .tag("system_uid", self.system_uid.to_string())
            .timestamp(rescale_timestamp(self.epoch))
            .field("epoch_ms", self.epoch)
            .field("uptime_ms", self.ms_from_start as u64)
    }
}

impl AugmentDatapoint for crate::pb::submit_packets::Meta {
    fn augment_data_point(&self, mut builder: DataPointBuilder) -> DataPointBuilder {
        let epoch = Duration::from_secs_f64(self.epoch);
        let epoch_nanos =
            (epoch.as_secs() * Duration::SECOND.as_nanos() as u64) + epoch.subsec_nanos() as u64;

        builder = builder.timestamp(epoch_nanos as i64).field("submit_epoch_sec", self.epoch);

        if let Some(phone_id) = self.phone_uid {
            builder = builder.tag("phone_uid", phone_id.to_string());
        }

        builder
    }
}

impl AugmentDatapoint for crate::db::user_token::UserAuthInfo {
    fn augment_data_point(&self, builder: DataPointBuilder) -> DataPointBuilder {
        builder
            .field("submitter_token_id", self.id)
            .field("submitter_token_name", self.data.name.clone())
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    DataPoint(#[from] DataPointError),

    #[error(transparent)]
    ChronoOutOfRange(#[from] chrono::OutOfRangeError),

    #[error("high-precision data point had no intrinsic timestamp")]
    NoTimestamp,
}

#[inline]
fn normalize_float(f: f32) -> f64 {
    if f.is_nan() || f.is_infinite() {
        return 0.0;
    }

    f as f64
}

#[inline]
fn rescale_timestamp(epoch_millis: u64) -> i64 {
    lazy_static::lazy_static! {
        static ref START_2023: chrono::DateTime<Utc> = Utc.from_utc_datetime(&chrono::NaiveDate::from_ymd_opt(2023, 1, 1).unwrap().and_hms_opt(0, 0, 0).unwrap());
        static ref START_2030: chrono::DateTime<Utc> = Utc.from_utc_datetime(&chrono::NaiveDate::from_ymd_opt(2030, 1, 1).unwrap().and_hms_opt(0, 0, 0).unwrap());

        static ref START_2023_MS: u64 = START_2023.timestamp_millis() as u64;
        static ref START_2030_MS: u64 = START_2030.timestamp_millis() as u64;

        static ref TIMESTAMP_OUT_OF_SANITY_RANGE: prometheus::IntCounter
            = prometheus::register_int_counter!("timestamp_insane", "timestamps before 2023 or after 2030").unwrap();
    }

    if epoch_millis < *START_2023_MS || epoch_millis > *START_2030_MS {
        TIMESTAMP_OUT_OF_SANITY_RANGE.inc();
    }

    epoch_millis as i64 * Duration::MILLISECOND.as_nanos() as i64
}

#[inline]
pub fn inspect_and_rescale(sensor: &str, epoch_millis: u64) -> i64 {
    let now = Utc::now();

    inspect_ts_error(now, sensor, rescale_timestamp(epoch_millis))
}
