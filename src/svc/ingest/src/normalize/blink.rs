use influxdb2::models::DataPoint;
use std::iter;
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::{
        blink_packet,
        BlinkBytePayload,
        BlinkHighResPayload,
        BlinkPacket,
        BlinkSaturationSettings,
    },
};

impl ToDatapoints for BlinkPacket {
    fn to_data_points<T>(
        &self,
        packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let BlinkPacket {
            ref saturation_settings,
            sample_rate,
            packet_index,
            ref payload,
        } = *self;

        let sample_period = chrono::Duration::seconds(1) / sample_rate as i32;

        payload
            .iter()
            .flat_map(|payload| match payload {
                blink_packet::Payload::PayloadByte(BlinkBytePayload {
                    sample,
                }) => sample.iter().zip(iter::repeat("lo_res")),
                blink_packet::Payload::PayloadHighRes(BlinkHighResPayload {
                    sample,
                }) => sample.iter().zip(iter::repeat("high_res")),
            })
            .enumerate()
            .map(|(i, (&sample, name))| {
                let mut builder = DataPoint::builder("blink")
                    .pipe(|b| augment.augment_data_point(b))
                    .field(name, sample as u64)
                    .field("sample_rate", sample_rate as u64)
                    .field("packet_index", packet_index as u64)
                    .field("subpacket_seq", i as u64);

                if let Some(base_ts) = packet_epoch {
                    let packet_ts = base_ts + sample_period * (i as i32);
                    builder = builder.timestamp(packet_ts.timestamp_nanos());
                }

                if let Some(&BlinkSaturationSettings {
                    diode_turned_off,
                    diode_saturation_lower_thresh,
                    diode_saturation_upper_thresh,
                }) = saturation_settings.as_ref()
                {
                    builder = builder
                        .field("diode_off", diode_turned_off)
                        .field("saturation_lo", diode_saturation_lower_thresh as u64)
                        .field("saturation_hi", diode_saturation_upper_thresh as u64)
                }

                builder.build().map_err(Error::from)
            })
            .collect()
    }
}
