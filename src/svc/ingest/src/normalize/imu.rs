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
    accel_x: u16,
    accel_y: u16,
    accel_z: u16,
    gyro_x:  u16,
    gyro_y:  u16,
    gyro_z:  u16,
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
                accel_x: u16::from_be_bytes(accel_x),
                accel_y: u16::from_be_bytes(accel_y),
                accel_z: u16::from_be_bytes(accel_z),
                gyro_x:  u16::from_be_bytes(gyro_x),
                gyro_y:  u16::from_be_bytes(gyro_y),
                gyro_z:  u16::from_be_bytes(gyro_z),
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
    fn to_data_points<T>(
        &self,
        packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let ImuPacket {
            packet_index,
            ref accel_settings,
            ref gyro_settings,
            ref payload,
        } = *self;

        // TODO: sync about what this actually means
        let sample_period = chrono::Duration::seconds(1) / 1000;

        let bytes = payload.as_ref().map(|p| &p.sample).unwrap_or_else(|| &EMPTY);

        let b = parse_all(bytes.as_slice());

        b.into_iter()
            .enumerate()
            .map(|(i, sample)| {
                let mut builder = DataPoint::builder("imu")
                    .pipe(|b| augment.augment_data_point(b))
                    .field("accel_x", sample.accel_x as u64)
                    .field("accel_y", sample.accel_y as u64)
                    .field("accel_z", sample.accel_z as u64)
                    .field("gyro_x", sample.gyro_x as u64)
                    .field("gyro_y", sample.gyro_y as u64)
                    .field("gyro_z", sample.gyro_z as u64)
                    .field("packet_index", packet_index as u64)
                    .field("subpacket_seq", i as u64);

                if let Some(set) = accel_settings.as_ref() {
                    builder =
                        settings(builder, "accel", set.cutoff, set.range, set.sample_rate_divisor);
                }
                if let Some(set) = gyro_settings.as_ref() {
                    builder =
                        settings(builder, "gyro", set.cutoff, set.range, set.sample_rate_divisor);
                }

                if let Some(base_ts) = packet_epoch {
                    let packet_ts = base_ts + sample_period * (i as i32);
                    builder = builder.timestamp(packet_ts.timestamp_nanos());
                }

                builder.build().map_err(Error::from)
            })
            .collect()
    }
}
