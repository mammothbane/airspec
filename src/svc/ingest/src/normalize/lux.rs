use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::{
        lux_packet,
        LuxPacket,
    },
};

impl ToDatapoints for LuxPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let LuxPacket {
            packet_index,
            sample_period,
            gain,
            integration_time,
            sensor_id,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(
                |&lux_packet::Payload {
                     lux,
                     timestamp_unix,
                     timestamp_ms_from_start,
                 }| {
                    DataPoint::builder("lux")
                        .pipe(|b| augment.augment_data_point(b))
                        .timestamp(crate::normalize::inspect_and_rescale("lux", timestamp_unix))
                        .tag("sensor_id", sensor_id.to_string())
                        .field("lux", lux as u64)
                        .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
                        .field("timestamp_unix", timestamp_unix)
                        .field("gain", gain as i64)
                        .field("integration_time", integration_time as i64)
                        .field("packet_index", packet_index as u64)
                        .field("sample_period", sample_period as u64)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
