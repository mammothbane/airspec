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
mod sgp;
mod sht;
mod spec;
mod survey;
mod therm;

pub trait ToDatapoints {
    fn to_data_points<T>(
        &self,
        packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
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

    #[error("expected sample groups of size {modulus}, but got total len {len} (remainder: {})", modulus % len)]
    UnevenCount {
        modulus: usize,
        len:     usize,
    },
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
    epoch_millis as i64 * Duration::MILLISECOND.as_nanos() as i64
}
