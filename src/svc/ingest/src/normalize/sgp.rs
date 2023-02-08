use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::SgpPacket,
};

impl ToDatapoints for SgpPacket {
    fn to_data_points<T>(&self, t: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let SgpPacket {
            ref payload,
        } = self;

        payload
            .iter()
            .map(|sample| {
                DataPoint::builder("sht")
                    .pipe(|b| t.augment_data_point(b))
                    .field("sraw_nox", sample.sraw_nox as u64)
                    .field("sraw_voc", sample.sraw_voc as u64)
                    .field("sample_timestamp", sample.timestamp as u64)
                    .field("nox_index", sample.nox_index_value as i64)
                    .field("voc_index", sample.voc_index_value as i64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
