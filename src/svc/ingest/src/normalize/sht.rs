use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        normalize_float,
        rescale_timestamp,
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
    fn to_data_points<T>(
        &self,
        _packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let ShtPacket {
            packet_index,
            sample_period,
            precision,
            heater,
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
                        .timestamp(rescale_timestamp(timestamp_unix))
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
