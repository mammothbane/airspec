use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        normalize_float,
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::ThermPacket,
};

impl ToDatapoints for ThermPacket {
    fn to_data_points<T>(&self, t: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let ThermPacket {
            sample_period_ms,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(|sample| {
                DataPoint::builder("thermopile")
                    .pipe(|b| t.augment_data_point(b))
                    .tag("descriptor", sample.descriptor.to_string())
                    .field("sample_timestamp", sample.timestamp as u64)
                    .field("ambient_raw", normalize_float(sample.ambient_raw as f32))
                    .field("object_raw", normalize_float(sample.object_raw as f32))
                    .field("object", normalize_float(sample.object_temp))
                    .field("ambient", normalize_float(sample.ambient_temp))
                    .field("sample_period_ms", sample_period_ms as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
