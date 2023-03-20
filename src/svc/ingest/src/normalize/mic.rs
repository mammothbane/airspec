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
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let MicPacket {
            packet_index,
            fft_index,
            timestamp_unix,
            timestamp_ms_from_start,
            sample_period,
            mic_sample_freq,
            packets_per_fft,
            samples_per_fft,
            start_frequency,
            frequency_spacing,
            ref payload,
        } = *self;

        let elems = payload.as_ref().map(|p| &p.sample).unwrap_or_else(|| &EMPTY);

        let sample_period = chrono::Duration::milliseconds(sample_period as i64);
        let ts = chrono::NaiveDateTime::from_timestamp_millis(timestamp_unix as i64)
            .ok_or(Error::NoTimestamp)?;

        let ts = ts.timestamp_nanos();
        let now = chrono::Utc::now();

        let builder = DataPoint::builder("mic")
            .pipe(|b| augment.augment_data_point(b))
            .timestamp(crate::normalize::inspect_ts_error(now, "mic", ts))
            .field("sample_frequency", mic_sample_freq as u64)
            .field("frequency_spacing", normalize_float(frequency_spacing))
            .field("sample_period", sample_period.num_milliseconds() as u64)
            .field("samples_per_fft", samples_per_fft as u64)
            .field("start_frequency", normalize_float(start_frequency))
            .field("packet_index", packet_index as u64)
            .field("timestamp_unix", timestamp_unix)
            .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
            .field("packets_per_fft", packets_per_fft as u64)
            .field("fft_index", fft_index as u64);

        let builder = elems
            .iter()
            .enumerate()
            .filter(|(_, x)| !x.is_nan() && !x.is_infinite())
            .fold(builder, |builder, (i, &sample)| {
                let index = fft_index as usize + i;

                builder
                    .field(
                        format!("frequency_{index}"),
                        normalize_float(start_frequency + (i as f32) * frequency_spacing),
                    )
                    .field(format!("value_{index}"), normalize_float(sample))
            });

        builder.build().map(|b| vec![b]).map_err(Error::from)
    }
}
