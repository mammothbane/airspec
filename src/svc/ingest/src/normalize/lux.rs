use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::LuxPacket,
};

impl<'a> ToDatapoints for WithHeader<'a, LuxPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        self.1
            .payload
            .iter()
            .map(|sample| {
                self.0
                    .common_fields(DataPoint::builder("lux"))
                    .field("lux", sample.lux as u64)
                    .field("sample_timestamp", sample.timestamp as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
