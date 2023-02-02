use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::BmePacket,
};

impl<'a> ToDatapoints for WithHeader<'a, BmePacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        self.1
            .payload
            .iter()
            .map(|sample| {
                self.0
                    .common_fields(DataPoint::builder("blink"))
                    .field("accuracy", sample.accuracy as u64)
                    .field("signal", sample.signal as f64)
                    .field("sensor_id", sample.sensor_id as u64)
                    .field("sample_timestamp", sample.time_stamp)
                    .field("signal_dimensions", sample.signal_dimensions as u64)
                    .field("sample_period_ms", self.1.sample_period_ms as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
