use std::{
    io,
    time::Duration,
};

use async_std::net::ToSocketAddrs;
use rand::{
    thread_rng,
    Rng,
    RngCore,
};

use crate::pb::{
    lux_packet,
    LuxPacket,
    SensorPacket,
    SensorPacketHeader,
};

pub fn rand_string() -> String {
    thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(16)
        .map(char::from)
        .collect::<String>()
}

pub async fn wait_for_tcp(a: &impl ToSocketAddrs) -> eyre::Result<()> {
    loop {
        match async_std::net::TcpStream::connect(a).await {
            Ok(_) => break,
            Err(e) if e.kind() == io::ErrorKind::ConnectionRefused => {
                async_std::task::sleep(Duration::from_millis(50)).await;
            },
            Err(e) => return Err(e.into()),
        }
    }

    Ok(())
}

pub fn gen_packet(i: i32) -> SensorPacket {
    let mut rng = thread_rng();

    SensorPacket {
        header:  Some(SensorPacketHeader {
            system_uid:    0,
            ms_from_start: i as u32,
            epoch:         i as u64,
        }),
        payload: Some(crate::pb::sensor_packet::Payload::LuxPacket(LuxPacket {
            packet_index:  rng.next_u32(),
            sample_period: rng.next_u32(),

            gain:             rng.next_u32() as i32,
            integration_time: rng.next_u32() as i32,

            sensor_id: 0,

            payload: vec![lux_packet::Payload {
                lux:                     rng.next_u32(),
                timestamp_ms_from_start: rng.next_u32(),
                timestamp_unix:          rng.next_u64(),
            }],
        })),
    }
}
