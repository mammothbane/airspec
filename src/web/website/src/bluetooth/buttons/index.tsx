import { Box, Button, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useAirSpecInterface } from 'hooks/useAirSpecInterface';

import {
  AirSpecConfigPacket,
} from '../../../../../../proto/message.proto';
import { SubmitPackets } from '../../../../../../proto/svc.proto';

import { useAirspecsDispatch, useAirspecsSelector } from '../../store';
import { debug_led } from './debug';
import {
  get_status,
  request_dfu_device,
} from './dfu';
import { extractData, Sensor } from './sensor';
import { clear_queue, record_packets, record_sensor_data, selectQueuedPackets } from './slice';
import {
  ALL_SENSOR_TYPES,
  DEFAULT_ENABLED,
  SensorType,
  to_enable,
} from './types';

const SEEN_GLASSES_LOCALSTORAGE_KEY = 'SEEN_GLASSES';


const throttle_submit = _.throttle((
  data: Record<string, any>[],
  apiKey: string,
  shouldSubmit: boolean,
  clear: () => void,
) => {
  if (data.length === 0) return;

  clear();

  if (!shouldSubmit || apiKey === '') {
    console.debug({ data }, 'submit disabled or missing api key, skipping upload');
    return;
  }

  const submit = new SubmitPackets({
    sensorData: data,
    meta: {
      epoch: Date.now() / 1000,
    },
  });

  const body = SubmitPackets.encode(submit).finish();

  fetch('http://localhost:8080/', {
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
}, 5000);

export const ButtonsBluetooth = () => {
  const [seenGlassesStr, setSeenGlassesStr] = useState<string>('');
  const [ledEnabled, setLedEnabled] = useState(false);
  const [shouldStream, setShouldStream] = useState(false);

  const [apiKey, setApiKey] = useState('');

  const [systemEnablement, setSystemEnablement] = useState(new Set(DEFAULT_ENABLED));

  let seenGlasses: string[] = [];
  if (seenGlassesStr != '') seenGlasses = JSON.parse(seenGlassesStr);

  useEffect(() => {
    const seen = localStorage.getItem(SEEN_GLASSES_LOCALSTORAGE_KEY) ?? '';
    setSeenGlassesStr(seen);
  }, []);

  const queued_packets = useAirspecsSelector(selectQueuedPackets);

  const dispatch = useAirspecsDispatch();

  useEffect(() => {
    throttle_submit(queued_packets, apiKey, shouldStream, () => dispatch(clear_queue()));
  }, [queued_packets]);

  const {
    selectDevice,
    sendMessage,
    deselect,
    selectHistoricalDevice,
    gatt,
  } = useAirSpecInterface({
    onData: (pkt) => {
      if (pkt.payload == null) throw new Error('packet missing type');

      const payload = pkt[pkt.payload];
      if (payload == null) throw new Error('missing expected payload type');

      dispatch(record_sensor_data({
        sensor: pkt.payload,
        data: extractData(payload, pkt.payload),
      }));

      dispatch(record_packets([pkt.toJSON()]));
    },
    onDisconnect: () => {
    },
    idRecency: seenGlasses,
    onState: (state) => {
    },
  });

  const sendEnable = async (enableState: Set<SensorType>) => {
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

    console.debug({ enableMsg: msg });

    await sendMessage(msg);
  };

  useEffect(() => {
    selectHistoricalDevice().catch(err => console.error(err));

    return () => {
      deselect().catch(err => console.error(err));
    };
  }, [seenGlassesStr]);

  return <Box sx={{
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    my: 2,
  }}>
    <Box sx={{
      alignItems: 'baseline',
      display: 'flex',
    }}>
      {gatt?.connected ?
        <Box>
          <Typography variant={'body2'}>
            {gatt.device.name?.replace(/^AirSpec_/, '') ?? 'no name'}
          </Typography>
        </Box>
        : undefined}

      <Button
        onClick={
          async () => {
            if (gatt?.connected ?? false) await deselect();
            else {
              const id = await selectDevice();
              seenGlasses.unshift(id);
              localStorage.setItem(SEEN_GLASSES_LOCALSTORAGE_KEY, JSON.stringify(seenGlasses));
            }
          }
        }
        variant="contained"
        color="primary"
        sx={{
          mx: 1,
        }}
      >
        {(gatt?.connected ?? false) ? 'Disconnect' : 'Connect'}
      </Button>

      <Button
        onClick={
          async () => {
            await sendEnable(ALL_SENSOR_TYPES);
            setSystemEnablement(ALL_SENSOR_TYPES);
          }
        }
        variant="contained"
        color="primary"
        sx={{
          mx: 1,
        }}
      >
        Enable All
      </Button>

      <Button
        onClick={
          async () => {
            await sendEnable(new Set());
            setSystemEnablement(new Set());
          }
        }
        variant="contained"
        color="primary"
        sx={{
          mx: 1,
          color: 'white',
        }}
      >
        Disable All
      </Button>

      <Button
        onClick={
          async () => {
            await sendMessage(debug_led(ledEnabled));
            setLedEnabled(!ledEnabled);
          }
        }
        variant="contained"
        color="primary"
        sx={{
          mx: 1,
        }}
      >
        LED Test
      </Button>

      <Button
        onClick={
          async () => {
            if (gatt?.connected ?? false) {
              await sendMessage(new AirSpecConfigPacket({
                header: {
                  timestampUnix: Date.now(),
                },
                payload: 'dfuMode',
                dfuMode: {
                  enable: true,
                },
              }));
            }

            await new Promise(r => setTimeout(r, 1000));

            const device = await request_dfu_device();
            const status = await get_status(device);

            console.debug({status});
          }
        }
        variant="contained"
        color="primary"
        sx={{
          mx: 1,
        }}
      >
        DFU
      </Button>
    </Box>

    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      mt: 2,
    }}>
      <Typography variant={'subtitle1'}>
        Stream to server
      </Typography>

      <Switch checked={shouldStream} onChange={(_evt, value) => setShouldStream(value)}/>

      <TextField
        value={apiKey}
        placeholder={'api key'}
        type={'password'}
        onChange={(evt) => setApiKey(evt.currentTarget.value)}
      />
    </Box>

    {gatt?.connected ?
      <Box
        display={'flex'}
        gap={2}
        alignItems="center"
        justifyContent={'center'}
        sx={{
          m: 2,
          flexWrap: 'wrap',
          flexDirection: 'row',
        }}
      >
        {
          Array.from(ALL_SENSOR_TYPES).map(sensor => {
            return <Sensor
              type={sensor}
              key={sensor}
              enabled={systemEnablement.has(sensor)}
              setEnabled={async (enabled) => {
                const new_enablement = new Set(systemEnablement);

                if (enabled) new_enablement.add(sensor);
                else new_enablement.delete(sensor);

                await sendEnable(new_enablement);

                setSystemEnablement(new_enablement);
              }}
            />;
          })
        }
      </Box>
      : null
    }
  </Box>;
};


export default ButtonsBluetooth;
