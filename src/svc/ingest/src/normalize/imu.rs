use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::ImuPacket,
};

#[derive(bincode::Decode)]
struct ImuSample {
    // XXX(nathan)
    dummy: u8,
}

static EMPTY: Vec<u8> = vec![];

impl<'a> ToDatapoints for WithHeader<'a, ImuPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        let bytes = self.1.payload.as_ref().map(|p| &p.sample).unwrap_or_else(|| &EMPTY);

        tracing::info!(payload = ?bytes, packet_id = self.0.packet_id, "imu packet");

        // let (b, _) = bincode::decode_from_slice::<Vec<ImuSample>, _>(&bytes[..], BIN_CONF)?;

        let b: Vec<ImuSample> = vec![];

        b.into_iter()
            .map(|sample| {
                self.0
                    .common_fields(DataPoint::builder("imu"))
                    .field("dummy", sample.dummy as u64)
                    .field("sample_rate", self.1.sample_period_ms as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
