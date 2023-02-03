use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        normalize_float,
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::MicPacket,
};

static EMPTY: Vec<f32> = vec![];

impl<'a> ToDatapoints for WithHeader<'a, MicPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        tracing::info!(?self, "mic packet");

        let MicPacket {
            sample_freq,
            system_sample_period,
            samples_per_fft,
            start_frequency,
            frequency_spacing,
            ref payload,
        } = *self.1;

        payload
            .as_ref()
            .map(|p| &p.sample)
            .unwrap_or_else(|| &EMPTY)
            .iter()
            .map(|&sample| {
                self.0
                    .common_fields(DataPoint::builder("mic"))
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
