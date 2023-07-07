import { SubmitPackets } from '../../../../../../proto/svc.proto';
import { BACKEND } from '../../util';

export const submit_packets = (
  packet_data: Record<string, any>[],
  apiKey: string,
  shouldSubmit: boolean,
  clear: () => void,
) => {
  if (packet_data.length === 0) return;

  clear();

  if (!shouldSubmit || apiKey === '') {
    console.debug({ data: packet_data }, 'submit disabled or missing api key, skipping upload');
    return;
  }

  const submit = new SubmitPackets({
    sensorData: packet_data,
    meta: {
      epoch: Date.now() / 1000,
    },
  });

  const body = SubmitPackets.encode(submit).finish();

  fetch(`${BACKEND}`, {
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
