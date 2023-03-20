use influxdb2::models::{
    data_point::DataPointBuilder,
    DataPoint,
};
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::ImuPacket,
};

const IMU_PKT_SIZE: usize = 12;

static EMPTY: Vec<u8> = vec![];

struct ImuSample {
    accel_x: i16,
    accel_y: i16,
    accel_z: i16,
    gyro_x:  i16,
    gyro_y:  i16,
    gyro_z:  i16,
}

fn parse_all(b: &[u8]) -> Vec<ImuSample> {
    let chunks = b.chunks_exact(IMU_PKT_SIZE);
    let remainder = chunks.remainder();

    if !remainder.is_empty() {
        tracing::warn!(len = remainder.len(), "imu packet had extra bytes");
    }

    chunks
        .map(|chunk| {
            let accel_x: [u8; 2] = chunk[0..2].try_into().unwrap();
            let accel_y: [u8; 2] = chunk[2..4].try_into().unwrap();
            let accel_z: [u8; 2] = chunk[4..6].try_into().unwrap();
            let gyro_x: [u8; 2] = chunk[6..8].try_into().unwrap();
            let gyro_y: [u8; 2] = chunk[8..10].try_into().unwrap();
            let gyro_z: [u8; 2] = chunk[10..12].try_into().unwrap();

            ImuSample {
                accel_x: i16::from_be_bytes(accel_x),
                accel_y: i16::from_be_bytes(accel_y),
                accel_z: i16::from_be_bytes(accel_z),
                gyro_x:  i16::from_be_bytes(gyro_x),
                gyro_y:  i16::from_be_bytes(gyro_y),
                gyro_z:  i16::from_be_bytes(gyro_z),
            }
        })
        .collect()
}

#[inline]
fn settings(
    mut builder: DataPointBuilder,
    name: &str,
    cutoff: Option<i32>,
    range: i32,
    sample_rate_divisor: u32,
) -> DataPointBuilder {
    builder = builder
        .field(format!("{name}_range"), range as i64)
        .field(format!("{name}_sample_rate_divisor"), sample_rate_divisor as u64);

    if let Some(cutoff) = cutoff {
        builder = builder.field(format!("{name}_cutoff"), cutoff as i64);
    }

    builder
}

impl ToDatapoints for ImuPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let ImuPacket {
            packet_index,
            timestamp_unix,
            timestamp_ms_from_start,
            sampling_frequency,
            ref accel_settings,
            ref gyro_settings,
            ref payload,
        } = *self;

        let sample_period = std::time::Duration::from_secs_f64(1.0f64 / sampling_frequency as f64);
        let sample_period = chrono::Duration::from_std(sample_period)?;

        let base_ts = chrono::NaiveDateTime::from_timestamp_millis(timestamp_unix as i64)
            .ok_or(Error::NoTimestamp)?;

        let bytes = payload.as_ref().map(|p| &p.sample).unwrap_or_else(|| &EMPTY);

        let b = parse_all(bytes.as_slice());
        let now = chrono::Utc::now();

        b.into_iter()
            .enumerate()
            .map(|(i, sample)| {
                let mut builder = DataPoint::builder("imu")
                    .pipe(|b| augment.augment_data_point(b))
                    .timestamp({
                        let packet_ts = base_ts + sample_period * (i as i32);
                        crate::normalize::inspect_ts_error(now, "imu", packet_ts.timestamp_nanos())
                    })
                    .field("accel_xs", sample.accel_x as i64)
                    .field("accel_ys", sample.accel_y as i64)
                    .field("accel_zs", sample.accel_z as i64)
                    .field("gyro_xs", sample.gyro_x as i64)
                    .field("gyro_ys", sample.gyro_y as i64)
                    .field("gyro_zs", sample.gyro_z as i64)
                    .field("packet_index", packet_index as u64)
                    .field("subpacket_seq", i as u64)
                    .field("timestamp_unix", timestamp_unix)
                    .field("timestamp_ms_from_start", timestamp_ms_from_start as u64);

                if let Some(set) = accel_settings.as_ref() {
                    builder =
                        settings(builder, "accel", set.cutoff, set.range, set.sample_rate_divisor);
                }

                if let Some(set) = gyro_settings.as_ref() {
                    builder =
                        settings(builder, "gyro", set.cutoff, set.range, set.sample_rate_divisor);
                }

                builder.build().map_err(Error::from)
            })
            .collect()
    }
}
