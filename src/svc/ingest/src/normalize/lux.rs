use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::LuxPacket,
};

impl ToDatapoints for LuxPacket {
    fn to_data_points<T>(&self, t: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        self.payload
            .iter()
            .map(|sample| {
                DataPoint::builder("lux")
                    .pipe(|b| t.augment_data_point(b))
                    .field("lux", sample.lux as u64)
                    .field("sample_timestamp", sample.timestamp as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
