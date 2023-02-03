use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
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

impl<'a> ToDatapoints for WithHeader<'a, ImuPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        let bytes = self.1.payload.as_ref().map(|p| &p.sample).unwrap_or_else(|| &EMPTY);

        tracing::info!(payload = ?bytes, packet_id = self.0.packet_id, "imu packet");

        let b = parse_all(bytes.as_slice());

        b.into_iter()
            .map(|sample| {
                self.0
                    .common_fields(DataPoint::builder("imu"))
                    .field("accel_x", sample.accel_x as u64)
                    .field("accel_y", sample.accel_y as u64)
                    .field("accel_z", sample.accel_z as u64)
                    .field("gyro_x", sample.gyro_x as u64)
                    .field("gyro_y", sample.gyro_y as u64)
                    .field("gyro_z", sample.gyro_z as u64)
                    .field("sample_rate", self.1.sample_period_ms as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
