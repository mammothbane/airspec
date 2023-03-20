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
        bme_packet,
        BmePacket,
    },
};

impl ToDatapoints for BmePacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let &BmePacket {
            packet_index,
            sample_period,
            sensor_id: main_sensor_id,
            ref payload,
        } = self;

        payload
            .iter()
            .map(
                |&bme_packet::Payload {
                     timestamp_sensor,
                     timestamp_unix,
                     timestamp_ms_from_start,
                     signal,
                     signal_dimensions,
                     sensor_id,
                     accuracy,
                 }| {
                    DataPoint::builder("bme")
                        .pipe(|b| augment.augment_data_point(b))
                        .timestamp(crate::normalize::inspect_and_rescale("bme", timestamp_unix))
                        .tag("sensor_id", sensor_id.to_string())
                        .tag("main_sensor_id", main_sensor_id.to_string())
                        .field("accuracy", accuracy as u64)
                        .field("signal", normalize_float(signal))
                        .field("signal_dimensions", signal_dimensions as u64)
                        .field("sample_period", sample_period as u64)
                        .field("timestamp_sensor", timestamp_sensor)
                        .field("timestamp_unix", timestamp_unix)
                        .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
                        .field("packet_index", packet_index as u64)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
