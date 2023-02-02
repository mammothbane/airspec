use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::SgpPacket,
};

impl<'a> ToDatapoints for WithHeader<'a, SgpPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        let SgpPacket {
            ref payload,
        } = self.1;

        payload
            .iter()
            .map(|sample| {
                self.0
                    .common_fields(DataPoint::builder("blink"))
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
