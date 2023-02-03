use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        normalize_float,
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::ShtPacket,
};

impl<'a> ToDatapoints for WithHeader<'a, ShtPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        let ShtPacket {
            precision,
            heater,
            ref payload,
        } = *self.1;

        payload
            .iter()
            .map(|sample| {
                self.0
                    .common_fields(DataPoint::builder("sht"))
                    .field("precision", precision as i64)
                    .field("heater", heater as i64)
                    .field("sample_timestamp", sample.timestamp as u64)
                    .field("humidity", normalize_float(sample.humidity))
                    .field("temperature", normalize_float(sample.temperature))
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
