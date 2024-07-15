import {Alert, Box} from '@mui/material';
import {useEffect} from 'react';
import _ from 'lodash';

import {useAirSpecInterface} from './hooks';

import {useAirspecsDispatch, useAirspecsSelector} from '../../store';

import {Sensor} from './Sensor';
import {extractData} from './Sensor/util';
import {
  push_requested_state_changes,
  record_packets,
  record_sensor_data,
  set_complete_system_enablement,
  set_config
} from './slice';
import {ALL_SENSOR_TYPES, to_config, to_enable,} from './types';
import {sendEnable} from './util';
import {ButtonBar} from "./ButtonBar";
import {OldPacketWarning} from "./OldPacketWarning";
import {WriteConfigButton} from "./WriteConfigButton";
import {ApiKeyEntry} from "./ApiKeyEntry";
import {WrapUpdatePackets} from "./WrapUpdatePackets";


type DevSelProps = {
  bt: ReturnType<typeof useAirSpecInterface>
};

/**
 * BluetoothControl is pathological -- may cause expensive rerenders of plot data if any deps
 * change, so trying to separate all hooks. This functionality is just for the side-effect, so
 * we can pull it out past the render boundary.
 */
const DeviceSelector = ({ bt }: DevSelProps) => {
  const seenGlasses = useAirspecsSelector(state => state.bluetooth.seen_glasses);
  const { selectHistoricalDevice, deselect } = bt;

  useEffect(() => {
    selectHistoricalDevice().catch(err => console.error(err));

    return () => {
      deselect().catch(err => console.error(err));
    };
  }, [seenGlasses]); // eslint-disable-line react-hooks/exhaustive-deps

  return <></>;
};

export const BluetoothControl = () => {
  const dispatch = useAirspecsDispatch();
  const seenGlasses = useAirspecsSelector(state => state.bluetooth.seen_glasses);

  const bt = useAirSpecInterface({
    onData: ([pkt, bytes]) => {
      if (pkt.payload == null) throw new Error('packet missing type');
      dispatch(record_packets([bytes]));

      const payload = pkt[pkt.payload];
      if (payload == null) throw new Error('missing expected payload type');

      const data = extractData(payload, pkt.payload);

      dispatch(record_sensor_data({
        data,
        sensor: pkt.payload,
      }));
    },
    onDisconnect: () => {
    },
    idRecency: seenGlasses,
    onState: (state) => {
      const st = _.chain(Array.from(ALL_SENSOR_TYPES)).filter(t => state?.control[to_enable(t)] as boolean).value();

      dispatch(set_complete_system_enablement(st));
      if (state.config != null) dispatch(set_config(state.config!.toJSON()));
    },
  });

  const {
    sendMessage,
    gatt,
  } = bt;

  return <Box sx={{
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    my: 2,
  }}>
    <WrapUpdatePackets/>
    <DeviceSelector bt={bt}/>

    <OldPacketWarning/>
    <ButtonBar bt={bt}/>
    <ApiKeyEntry/>


    {gatt?.connected ?
      <>
        <Alert severity={"warning"} sx={{
          mt: 1,
        }}>Configuration and sensor enablement state are reset on device reboot.</Alert>

        <WriteConfigButton sendMessage={sendMessage}/>

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
                onEnable={async (typ, enable, enablement) => {
                  let new_enablement;

                  if (enable) new_enablement = _.union(enablement, [typ]);
                  else new_enablement = _.difference(enablement, [typ]);

                  await sendEnable(new Set(new_enablement), sendMessage);
                }}

                onPropChange={async (st, k, v) => {
                  const config_k = to_config(st);

                  dispatch(push_requested_state_changes({
                    [config_k]: {
                      [k]: v,
                    }
                  }));
                }}
              />;
            })
          }
        </Box>
      </>
      : null
    }
  </Box>;
};
