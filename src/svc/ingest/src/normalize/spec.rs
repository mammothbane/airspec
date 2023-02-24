use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
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
    fn to_data_points<T>(
        &self,
        packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let SpecPacket {
            packet_index,
            sample_period: sample_period_ms,
            integration_time,
            integration_step,
            gain,
            ref payload,
        } = *self;

        let sample_period = chrono::Duration::milliseconds(sample_period_ms as i64);

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
                    },
                )| {
                    let mut builder = DataPoint::builder("spectrometer")
                        .pipe(|b| augment.augment_data_point(b))
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
                        .field("subpacket_seq", i as u64);

                    if let Some(base_ts) = packet_epoch {
                        let packet_ts = base_ts + sample_period * (i as i32);
                        builder = builder.timestamp(packet_ts.timestamp_nanos());
                    }

                    builder.build().map_err(Error::from)
                },
            )
            .collect()
    }
}
