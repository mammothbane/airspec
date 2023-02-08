use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        normalize_float,
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::ThermPacket,
};

impl<'a> ToDatapoints for WithHeader<'a, ThermPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        let ThermPacket {
            sample_period_ms,
            ref payload,
        } = *self.1;

        payload
            .iter()
            .map(|sample| {
                DataPoint::builder("thermopile")
                    .pipe(|b| self.0.common_fields(b))
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
