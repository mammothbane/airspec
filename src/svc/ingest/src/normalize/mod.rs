use bincode::config::{
    Fixint,
    LittleEndian,
};
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
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error>;
}

const _BIN_CONF: bincode::config::Configuration<LittleEndian, Fixint> =
    bincode::config::standard().with_fixed_int_encoding().with_no_limit();

#[derive(Debug, Copy, Clone, PartialEq)]
pub struct WithHeader<'a, T>(pub &'a crate::pb::SensorPacketHeader, pub &'a T);

impl crate::pb::SensorPacketHeader {
    pub fn common_fields(&self, b: DataPointBuilder) -> DataPointBuilder {
        b.tag("system_uid", self.system_uid.to_string())
            .field("epoch_ms", self.epoch as u64)
            .field("uptime_ms", self.ms_from_start as u64)
            .field("packet_id", self.packet_id as u64)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    DataPoint(#[from] DataPointError),

    #[error(transparent)]
    Bincode(#[from] bincode::error::DecodeError),
}

#[inline]
fn normalize_float(f: f32) -> f64 {
    if f.is_nan() || f.is_infinite() {
        return 0.0;
    }

    f as f64
}
