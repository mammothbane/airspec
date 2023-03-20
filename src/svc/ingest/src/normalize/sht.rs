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
        sht_packet,
        ShtPacket,
    },
};

impl ToDatapoints for ShtPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let ShtPacket {
            packet_index,
            sample_period,
            precision,
            heater,
            sensor_id,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(
                |&sht_packet::Payload {
                     timestamp_unix,
                     timestamp_ms_from_start,
                     temperature,
                     humidity,
                 }| {
                    DataPoint::builder("sht")
                        .pipe(|b| augment.augment_data_point(b))
                        .timestamp(crate::normalize::inspect_and_rescale("sht", timestamp_unix))
                        .tag("sensor_id", sensor_id.to_string())
                        .field("precision", precision as i64)
                        .field("heater", heater as i64)
                        .field("packet_index", packet_index as u64)
                        .field("sample_period", sample_period as u64)
                        .field("timestamp_unix", timestamp_unix)
                        .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
                        .field("humidity", normalize_float(humidity))
                        .field("temperature", normalize_float(temperature))
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
