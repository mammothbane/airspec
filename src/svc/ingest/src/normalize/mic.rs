use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        normalize_float,
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::MicPacket,
};

static EMPTY: Vec<f32> = vec![];

impl ToDatapoints for MicPacket {
    fn to_data_points<T>(&self, t: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let MicPacket {
            sample_freq,
            system_sample_period,
            samples_per_fft,
            start_frequency,
            frequency_spacing,
            ref payload,
        } = *self;

        payload
            .as_ref()
            .map(|p| &p.sample)
            .unwrap_or_else(|| &EMPTY)
            .iter()
            .map(|&sample| {
                DataPoint::builder("mic")
                    .pipe(|b| t.augment_data_point(b))
                    .field("value", normalize_float(sample))
                    .field("sample_frequency", sample_freq as u64)
                    .field("frequency_spacing", normalize_float(frequency_spacing))
                    .field("sample_period", system_sample_period as u64)
                    .field("samples_per_fft", samples_per_fft as u64)
                    .field("start_frequency", normalize_float(start_frequency))
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
