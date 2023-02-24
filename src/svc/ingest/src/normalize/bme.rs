use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        normalize_float,
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::BmePacket,
};

impl ToDatapoints for BmePacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        self.payload
            .iter()
            .map(|sample| {
                DataPoint::builder("bme")
                    .pipe(|b| augment.augment_data_point(b))
                    .timestamp(sample.timestamp_unix as i64 * 1_000_000_000)
                    .field("accuracy", sample.accuracy as u64)
                    .field("signal", normalize_float(sample.signal))
                    .field("sensor_id", sample.sensor_id as u64)
                    .field("signal_dimensions", sample.signal_dimensions as u64)
                    .field("sample_period", self.sample_period as u64)
                    .field("timestamp_sensor", sample.timestamp_sensor)
                    .field("timestamp_unix", sample.timestamp_unix as u64)
                    .field("timestamp_ms_from_start", sample.timestamp_ms_from_start as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
