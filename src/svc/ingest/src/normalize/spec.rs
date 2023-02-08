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
    fn to_data_points<T>(&self, t: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let SpecPacket {
            sample_period,
            ref payload,
        } = *self;

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
                    DataPoint::builder("spectrometer")
                        .pipe(|b| t.augment_data_point(b))
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
