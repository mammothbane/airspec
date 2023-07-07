import _ from 'lodash';
import { useEffect } from 'react';
import * as React from 'react';

import {
  SensorPacket,
  AirSpecConfigPacket,
  systemState,
} from '../../../../../../proto/message.proto';

export const SERVICE_ID = 0xfe80;

export const RX_CHARACTERISTIC_ID = 0xfe81;
export const TX_CHARACTERISTIC_ID = 0xfe82;

export const SENSOR_CONFIG_CHARACTERISTIC_ID = 0xfe83;

export interface AirSpec {
  selectDevice: () => Promise<string>,
  selectHistoricalDevice: () => Promise<boolean>,
  deselect: () => Promise<void>,
  sendMessage: (ctrl: AirSpecConfigPacket) => Promise<void>,
  gatt: BluetoothRemoteGATTServer | null | undefined,
}

export type BluetoothState = {
  tx: BluetoothRemoteGATTCharacteristic,
  rx: BluetoothRemoteGATTCharacteristic,
  sensor_config: BluetoothRemoteGATTCharacteristic,
};

export const useAirSpecInterface = ({
                                      onDisconnect = _.noop,
                                      idRecency = [],
                                      onData = _.noop,
                                      onState = _.noop,
                                    }: {
  onDisconnect?: () => void,
  idRecency?: string[],
  onData?: (pkt: SensorPacket) => void,
  onState?: (cfg: systemState) => void,
}): AirSpec => {
  const [gatt, setGatt] = React.useState<BluetoothRemoteGATTServer | null>();
  const [btState, setBtState] = React.useState<BluetoothState | null>(null);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (gatt == null) return;

      if (!gatt.connected) await gatt.connect();
      if (btState == null) await configGatt(gatt);
    }, 1000);

    return () => clearInterval(timer);
  }, [gatt?.device?.id, btState == null]); // eslint-disable-line react-hooks/exhaustive-deps

  const recencyLookup: Map<string, number> = new Map();
  idRecency.forEach((elt, i) => recencyLookup.set(elt, i));

  const configureDevice = async (device: BluetoothDevice) => {
    device.addEventListener('gattserverdisconnected', () => {
      console.info('bluetooth disconnected');
      setBtState(null);
      onDisconnect();
    });

    const gatt_service_ = device.gatt?.connect();
    if (gatt_service_ === undefined) {
      throw new Error('failed to connect to bluetooth device');
    }

    let gatt_service;

    try {
      gatt_service = await gatt_service_;
      console.debug('connected to gatt');
    } catch (e) {
      console.error('couldn\'t connect to known gatt');
      throw e;
    }

    setGatt(gatt_service);

    console.info({
      id: device.id,
      name: device.name,
    }, 'connected to bluetooth device');
  };

  const configGatt = async (gatt: BluetoothRemoteGATTServer) => {
    const service = await gatt.getPrimaryService(
      SERVICE_ID,
    );

    console.debug('got service');

    const rxChar = await service.getCharacteristic(RX_CHARACTERISTIC_ID);
    const txChar = await service.getCharacteristic(TX_CHARACTERISTIC_ID);
    const sensorConfigChar = await service.getCharacteristic(SENSOR_CONFIG_CHARACTERISTIC_ID);

    console.debug({ sensorConfigChar });

    const value = await sensorConfigChar.readValue();
    const state = systemState.decode(new Uint8Array(value.buffer))
    console.debug({ state }, 'init system state');

    onState(state);

    console.debug('got characteristics');

    rxChar.addEventListener('characteristicvaluechanged', ev => {
      const target = ev.target as BluetoothRemoteGATTCharacteristic;
      const bytes = new Uint8Array(target.value!.buffer);

      const packet = SensorPacket.decode(bytes);
      console.debug({packet, type: packet.payload?.replace(/Packet$/, '')}, 'decoded packet');

      onData(packet);
    });

    sensorConfigChar.addEventListener('characteristicvaluechanged', ev => {
      console.debug({event: ev}, 'sensor config changed');

      const target = ev.target as BluetoothRemoteGATTCharacteristic;
      const bytes = new Uint8Array(target.value!.buffer);

      const state = systemState.decode(bytes);
      console.debug({state}, 'decoded new system state');

      onState(state);
    });

    await rxChar.startNotifications();
    await sensorConfigChar.startNotifications();

    console.debug('notifications started');

    setBtState({
      rx: rxChar,
      tx: txChar,
      sensor_config: sensorConfigChar,
    } as BluetoothState);
  };

  const selectHistoricalDevice = async () => {
    console.debug('attempting connection to known devices');

    if (idRecency.length === 0) {
      console.debug('no connection history found');
      return false;
    }

    const devices = await navigator.bluetooth.getDevices();

    if (devices.length === 0) {
      return false;
    }

    devices.sort((a, b) => a.id.localeCompare(b.id));

    let best = devices[0];
    let best_score = idRecency.length + 1;

    for (const device of devices) {
      const score = recencyLookup.get(device.id);

      if (score != null && score < best_score) {
        best = device;
        best_score = score;
      }
    }

    console.debug({id: best.id, name: best.name}, 'historical device found');

    await configureDevice(best);

    return true;
  };

  const selectDevice = async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          namePrefix: 'AirSpec',
          services: [
            SERVICE_ID,
          ],
        },
      ],
    });

    if (!device) {
      throw new Error('could not connect over bluetooth');
    }

    await configureDevice(device);

    return device.id;
  };

  const deselect = async () => {
    if (btState == null) return;

    const {
      rx,
      sensor_config,
    } = btState;

    await rx.stopNotifications();
    await sensor_config.stopNotifications();
    gatt?.disconnect();

    setGatt(null);
    setBtState(null);
  };

  const sendMessage = async (message: AirSpecConfigPacket) => {
    if (btState?.tx === undefined) throw new Error('bluetooth not connected');

    const data = AirSpecConfigPacket.encode(message).finish();
    await btState.tx.writeValue(data);
  };

  return {
    selectDevice,
    selectHistoricalDevice,
    deselect,
    sendMessage,
    gatt,
  };
};
