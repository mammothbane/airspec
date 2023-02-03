use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::BlinkPacket,
};

#[derive(bincode::Decode)]
struct BlinkSample {
    // XXX(nathan)
    dummy: u8,
}

static _EMPTY: Vec<u8> = vec![];

impl<'a> ToDatapoints for WithHeader<'a, BlinkPacket> {
    fn to_data_points(&self) -> Result<Vec<DataPoint>, Error> {
        let BlinkPacket {
            diode_saturation_flag,
            blink_sample_rate,
            subpacket_index,
            ref payload,
            ..
        } = self.1;

        tracing::info!(payload = ?payload, blink_sample_rate, diode_saturation_flag, subpacket_index, "blink packet");

        // let bytes = payload.as_ref().map(|p| &p.sample).unwrap_or(&EMPTY);
        //
        // let (b, _) = bincode::decode_from_slice::<Vec<BlinkSample>, _>(&bytes[..], BIN_CONF)?;

        let b: Vec<BlinkSample> = vec![];

        b.into_iter()
            .map(|sample| {
                self.0
                    .common_fields(DataPoint::builder("blink"))
                    .field("dummy", sample.dummy as u64)
                    .field("sample_rate", *blink_sample_rate as u64)
                    .field("diode_saturation", *diode_saturation_flag != 0)
                    .field("subpacket", *subpacket_index as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
