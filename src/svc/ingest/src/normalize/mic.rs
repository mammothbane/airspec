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
    fn to_data_points<T>(
        &self,
        packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let MicPacket {
            packet_index,
            sample_period,
            mic_sample_freq,
            samples_per_fft,
            start_frequency,
            frequency_spacing,
            ref payload,
        } = *self;

        let elems = payload.as_ref().map(|p| &p.sample).unwrap_or_else(|| &EMPTY);

        if elems.len() % samples_per_fft as usize != 0 {
            return Err(Error::UnevenCount {
                modulus: samples_per_fft as usize,
                len:     elems.len(),
            });
        }

        let sample_period = chrono::Duration::milliseconds(sample_period as i64);

        elems
            .chunks_exact(samples_per_fft as usize)
            .enumerate()
            .map(|(chunk_idx, chunk)| {
                let builder = DataPoint::builder("mic")
                    .pipe(|b| augment.augment_data_point(b))
                    .field("sample_frequency", mic_sample_freq as u64)
                    .field("frequency_spacing", normalize_float(frequency_spacing))
                    .field("sample_period", sample_period.num_milliseconds() as u64)
                    .field("samples_per_fft", samples_per_fft as u64)
                    .field("start_frequency", normalize_float(start_frequency))
                    .field("packet_index", packet_index as u64)
                    .field("fft_chunk_idx", chunk_idx as u64)
                    .field("nfreq", chunk.len() as u64);

                let builder = if let Some(ref base_ts) = packet_epoch {
                    let packet_ts = *base_ts + sample_period * (chunk_idx as i32);
                    builder.timestamp(packet_ts.timestamp_nanos())
                } else {
                    builder
                };

                let builder = chunk
                    .iter()
                    .enumerate()
                    .filter(|(_, x)| !x.is_nan() && !x.is_infinite())
                    .fold(builder, move |builder, (i, &sample)| {
                        builder
                            .field(
                                format!("frequency_{i}"),
                                normalize_float(start_frequency + (i as f32) * frequency_spacing),
                            )
                            .field(format!("value_{i}"), normalize_float(sample))
                    });

                builder.build().map_err(Error::from)
            })
            .collect()
    }
}
