use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        normalize_float,
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::ShtPacket,
};

impl ToDatapoints for ShtPacket {
    fn to_data_points<T>(&self, t: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let ShtPacket {
            precision,
            heater,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(|sample| {
                DataPoint::builder("sht")
                    .pipe(|b| t.augment_data_point(b))
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
