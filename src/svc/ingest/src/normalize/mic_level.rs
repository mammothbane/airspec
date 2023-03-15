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
    pb::MicLevelPacket,
};

impl ToDatapoints for MicLevelPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let MicLevelPacket {
            packet_index,
            sample_period,
            mic_sample_freq,
            sample_length,
            num_of_samples_used,
            weighting,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(
                |&crate::pb::mic_level_packet::Payload {
                     sound_spl_db,
                     sound_rms,
                     timestamp_unix,
                     timestamp_ms_from_start,
                 }| {
                    DataPoint::builder("mic_level")
                        .pipe(|b| augment.augment_data_point(b))
                        .timestamp(rescale_timestamp(timestamp_unix))
                        .field("sample_frequency", mic_sample_freq as u64)
                        .field("sample_period", sample_period as u64)
                        .field("packet_index", packet_index as u64)
                        .field("sound_spl_db", normalize_float(sound_spl_db))
                        .field("sound_rms", normalize_float(sound_rms))
                        .field("sample_length", sample_length as u64)
                        .field("num_of_samples_used", num_of_samples_used as u64)
                        .field("weighting", weighting as i64)
                        .field("timestamp_unix", timestamp_unix)
                        .field("timestamp_ms_from_start", timestamp_ms_from_start as u64)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
