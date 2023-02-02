use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::{
        spec_packet::Payload,
        SpecPacket,
    },
};

impl<'a> ToDatapoints for WithHeader<'a, SpecPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        let SpecPacket {
            sample_period,
            ref payload,
        } = *self.1;

        payload
            .iter()
            .map(
                |&Payload {
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
                 }| {
                    self.0
                        .common_fields(DataPoint::builder("blink"))
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
                        .field("sample_period_ms", sample_period as u64)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
