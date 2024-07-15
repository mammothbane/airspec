import {SubmitPackets} from '../../../../../../proto/svc.proto';
import {BACKEND} from '../../util';
import {ALL_SENSOR_TYPES, SensorType, to_enable} from "./types";
import {AirSpecConfigPacket, SensorPacket} from "../../../../../../proto/message.proto";

export const submit_packets = (
  packet_data: number[][],
  apiKey: string,
  shouldSubmit: boolean,
  clear: () => void,
) => {
  if (packet_data.length === 0) return;

  clear();

  const parsed_packets = packet_data.map((data) => {
    const ary = new Uint8Array(data);

    return SensorPacket.decode(ary);
  });

  if (!shouldSubmit || apiKey === '') {
    console.debug({ data: packet_data }, 'submit disabled or missing api key, skipping upload');
    return;
  }

  const submit = new SubmitPackets({
    sensorData: parsed_packets,
    meta: {
      epoch: Date.now() / 1000,
    },
  });

  const body = SubmitPackets.encode(submit).finish();

  fetch(BACKEND, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/protobuf',
    },
    body,
  })
    .then(resp => {
      console.debug({ resp }, 'sent data to server');
      clear();
    })
    .catch(err => console.error({err}, 'api request failed'));
};
export const sendEnable = async (enableState: Set<SensorType>, sendMessage: (pkt: AirSpecConfigPacket) => Promise<void>) => {
    const payload: any = {
        synchronizeWindows: false,
    };

    ALL_SENSOR_TYPES.forEach(sensor_type => {
        payload[to_enable(sensor_type)] = enableState.has(sensor_type);
    });

    const msg = new AirSpecConfigPacket({
        header: {
            timestampUnix: Date.now(),
        },
        payload: 'sensorControl',
        sensorControl: payload,
    });

    console.debug({enableMsg: msg});

    await sendMessage(msg);
};
