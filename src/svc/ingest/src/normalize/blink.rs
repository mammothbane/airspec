use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::BlinkPacket,
};

impl ToDatapoints for BlinkPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let BlinkPacket {
            diode_saturation_flag,
            blink_sample_rate,
            subpacket_index,
            ref payload,
            ..
        } = *self;

        payload
            .iter()
            .flat_map(|payload| payload.sample.iter())
            .map(|&sample| {
                DataPoint::builder("blink")
                    .pipe(|b| augment.augment_data_point(b))
                    .field("value", sample as u64)
                    .field("sample_rate", blink_sample_rate as u64)
                    .field("diode_saturation", diode_saturation_flag != 0)
                    .field("subpacket", subpacket_index as u64)
                    .build()
                    .map_err(Error::from)
            })
            .collect()
    }
}
