use influxdb2::models::{
    data_point::{
        DataPointBuilder,
        DataPointError,
    },
    DataPoint,
};

mod blink;
mod bme;
mod imu;
mod lux;
mod mic;
mod sgp;
mod sht;
mod spec;
mod therm;

pub trait ToDatapoints {
    fn to_data_points<T>(&self, additional: &T) -> Result<Vec<DataPoint>, Error>
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
            .field("epoch_ms", self.epoch as u64)
            .field("uptime_ms", self.ms_from_start as u64)
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
}

#[inline]
fn normalize_float(f: f32) -> f64 {
    if f.is_nan() || f.is_infinite() {
        return 0.0;
    }

    f as f64
}
