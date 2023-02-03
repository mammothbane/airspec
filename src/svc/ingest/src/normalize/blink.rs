use influxdb2::models::DataPoint;

use crate::{
    normalize::{
        Error,
        ToDatapoints,
        WithHeader,
    },
    pb::BlinkPacket,
};

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

        payload
            .iter()
            .flat_map(|payload| payload.sample.iter())
            .map(|&sample| {
                self.0
                    .common_fields(DataPoint::builder("blink"))
                    .field("value", sample as u64)
                    .field("sample_rate", *blink_sample_rate as u64)
                    .field("diode_saturation", *diode_saturation_flag != 0)
                    .field("subpacket", *subpacket_index as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
