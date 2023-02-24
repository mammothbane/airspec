use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        normalize_float,
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::{
        therm_packet,
        ThermPacket,
    },
};

impl ToDatapoints for ThermPacket {
    fn to_data_points<T>(
        &self,
        _packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let ThermPacket {
            packet_index,
            sample_period,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(
                |&therm_packet::Payload {
                     descriptor,
                     timestamp_unix,
                     timestamp_ms_from_start,
                     ambient_raw,
                     object_raw,
                     ambient_temp,
                     object_temp,
                 }| {
                    DataPoint::builder("thermopile")
                        .pipe(|b| augment.augment_data_point(b))
                        .timestamp(timestamp_unix as i64 * 1_000_000_000)
                        .tag("descriptor", descriptor.to_string())
                        .field("timestamp_unix", timestamp_unix as u64)
                        .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
                        .field("packet_index", packet_index as u64)
                        .field("ambient_raw", normalize_float(ambient_raw as f32))
                        .field("object_raw", normalize_float(object_raw as f32))
                        .field("object", normalize_float(object_temp))
                        .field("ambient", normalize_float(ambient_temp))
                        .field("sample_period", sample_period as u64)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
