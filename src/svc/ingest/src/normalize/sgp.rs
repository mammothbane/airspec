use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::{
        sgp_packet,
        SgpPacket,
    },
};

impl ToDatapoints for SgpPacket {
    fn to_data_points<T>(&self, t: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let SgpPacket {
            packet_index,
            sample_period,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(
                |&sgp_packet::Payload {
                     timestamp_unix,
                     timestamp_ms_from_start,
                     sraw_voc,
                     sraw_nox,
                     voc_index_value,
                     nox_index_value,
                 }| {
                    DataPoint::builder("sgp")
                        .pipe(|b| t.augment_data_point(b))
                        .field("sraw_nox", sraw_nox as u64)
                        .field("sraw_voc", sraw_voc as u64)
                        .field("timestamp_unix", timestamp_unix as u64)
                        .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
                        .field("nox_index", nox_index_value as i64)
                        .field("voc_index", voc_index_value as i64)
                        .field("packet_index", packet_index as u64)
                        .field("sample_period", sample_period as i64)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
