use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        rescale_timestamp,
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::{
        spec_packet::Payload,
        SpecPacket,
    },
};

impl ToDatapoints for SpecPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let SpecPacket {
            packet_index,
            sample_period: sample_period_ms,
            integration_time,
            integration_step,
            gain,
            sensor_id,
            ref payload,
        } = *self;

        payload
            .iter()
            .enumerate()
            .map(
                |(
                    i,
                    &Payload {
                        band_415,
                        band_445,
                        band_480,
                        band_515,
                        band_clear_1,
                        band_nir_1,
                        band_555,
                        band_590,
                        band_630,
                        band_680,
                        band_clear_2,
                        band_nir_2,
                        flicker,
                        timestamp_unix,
                        timestamp_ms_from_start,
                    },
                )| {
                    DataPoint::builder("spectrometer")
                        .pipe(|b| augment.augment_data_point(b))
                        .timestamp(rescale_timestamp(timestamp_unix))
                        .tag("sensor_id", sensor_id.to_string())
                        .field("band_415", band_415 as u64)
                        .field("band_445", band_445 as u64)
                        .field("band_480", band_480 as u64)
                        .field("band_515", band_515 as u64)
                        .field("band_clear_1", band_clear_1 as u64)
                        .field("band_nir_1", band_nir_1 as u64)
                        .field("band_555", band_555 as u64)
                        .field("band_590", band_590 as u64)
                        .field("band_630", band_630 as u64)
                        .field("band_680", band_680 as u64)
                        .field("band_clear_2", band_clear_2 as u64)
                        .field("band_nir_2", band_nir_2 as u64)
                        .field("flicker", flicker as u64)
                        .field("sample_period_ms", sample_period_ms as u64)
                        .field("packet_index", packet_index as u64)
                        .field("integration_time", integration_time as u64)
                        .field("integration_step", integration_step as u64)
                        .field("gain", gain as i64)
                        .field("timestamp_unix", timestamp_unix)
                        .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
                        .field("subpacket_seq", i as u64)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
