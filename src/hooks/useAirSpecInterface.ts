import { ConstructionOutlined } from '@mui/icons-material'
import * as React from 'react';
// const Struct = require('@binary-files/structjs');
import { Struct } from '@binary-files/structjs';

export interface AirSpec {
  connect: () => void;
  isConnected: boolean;
  sysInfo: any;
  setSysInfo: (entry: any) => void;
  toggle: () => void;
  requestSysInfo: () => void;
  updateSysInfo: () => void;
  setSpecialMode: () => void;
  setBlueGreenMode: (
    start_bit: number,
    blue_min_intensity: number,
    blue_max_intensity: number,
    green_max_intensity: number,
    step_size: number,
    step_duration: number
  ) => void;
  setRedFlashMode: (
    start_bit: number,
    red_max_intensity: number,
    red_flash_period: number,
    red_flash_duration: number
  ) => void;
  setDFUMode: () => void;
  setGreenLight: () => void;
  setBlueLight: () => void;
  setColor: (color: string) => string;
}
const utils = {
  min: (array: number[]) =>
    array.reduce(
      (currentMin, value) => (value < currentMin ? value : currentMin),
      array[0]
    ),
  max: (array: number[]) =>
    array.reduce(
      (currentMax, value) => (value > currentMax ? value : currentMax),
      array[0]
    ),
  sum: (array: number[]) => array.reduce((sum, val) => sum + val, 0)
};
const offsetAndScale = (rgb: number[]) => {
  // Offset calculation would divide by zero if the values are equal
  if (rgb[0] === rgb[1] && rgb[1] === rgb[2]) {
    return [Math.floor(255 / 3), Math.floor(255 / 3), Math.floor(255 / 3)];
  }

  const min = utils.min(rgb);
  const max = utils.max(rgb);

  const offset = rgb.map(value => (value - min) / (max - min));
  const sum = utils.sum(offset);
  const scaled = offset.map(value => Math.floor((value / sum) * 255));
  if (scaled[0] === 255) {
    return [254, 0, 1];
  }
  if (scaled[1] === 255) {
    return [1, 254, 0];
  }
  if (scaled[2] === 255) {
    return [0, 1, 254];
  }
  return scaled;
};

function getUnixTimestampArray () {
  //https://stackoverflow.com/questions/221294/how-do-i-get-a-timestamp-in-javascript
  var timestamp_seconds = Math.round(+new Date() / 1000);
  var timestampArray = new Uint8Array([
    timestamp_seconds & 0xff,
    (timestamp_seconds >> 8) & 0xff,
    (timestamp_seconds >> 16) & 0xff,
    (timestamp_seconds >> 24) & 0xff
  ]);
  return timestampArray;
}

function getPayloadSizeArray (value: number) {
  var payloadSizeArray = new Uint8Array([value & 0xff, (value >> 8) & 0xff]);
  return payloadSizeArray;
}

function getHeader (packet_type: number, payload_size: number) {
  var timestamp = getUnixTimestampArray();
  var payloadSize = getPayloadSizeArray(payload_size);
  var packetType = new Uint8Array([
    packet_type & 0xff,
    (packet_type >> 8) & 0xff
  ]);
  var header = new Uint8Array(
    timestamp.length + payloadSize.length + packetType.length
  );
  header.set(packetType);
  header.set(payloadSize, packetType.length);
  header.set(timestamp, packetType.length + payloadSize.length);
  return header;
}

function blueGreenModePayload (
  start_bit: number,
  blue_min_intensity: number,
  blue_max_intensity: number,
  green_max_intensity: number,
  step_size: number,
  step_duration: number
) {
  var payload = new Uint8Array([
    2,
    start_bit & 0xff,
    blue_min_intensity & 0xff,
    blue_max_intensity & 0xff,
    green_max_intensity & 0xff,
    step_size & 0xff,
    step_duration & 0xff
  ]);
  return payload;
}

function redFlashModePayload (
  start_bit: number,
  red_max_intensity: number,
  red_flash_period: number,
  red_flash_duration: number
) {
  var payload = new Uint8Array([
    3,
    start_bit & 0xff,
    red_max_intensity & 0xff,
    red_flash_period & 0xff,
    0x00,
    red_flash_duration & 0xff,
    (red_flash_duration >> 8) & 0xff,
    (red_flash_duration >> 16) & 0xff,
    (red_flash_duration >> 24) & 0xff
  ])
  return payload;
}

export const useAirSpecInterface = (): AirSpec => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [sysInfo, setSysInfo] = React.useState<any>();
  const [
    rxCharacteristic,
    setRxCharacteristic
  ] = React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [
    txCharacteristic,
    setTxCharacteristic
  ] = React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [
    sysInfoCharacteristic,
    setSysInfoCharacteristic
  ] = React.useState<BluetoothRemoteGATTCharacteristic | null>(null);



  // https://www.npmjs.com/package/@binary-files/structjs#installation
  const airspecSensorConfigHeaderStruct = new Struct(
    Struct.Uint8('systemRunState'),
    Struct.Skip(3),
    Struct.Uint32('uuid'),
    Struct.Uint32('firmware_version'),
    Struct.Uint32('epoch'),


      Struct.Uint8('thermopileSensorEn'),
      Struct.Skip(1),
      Struct.Uint16('thermopileSensorPeriod'),
      

      Struct.Uint8('blinkSensorEn'),
      Struct.Skip(1),
      Struct.Uint16('blinkSampleRate'),
      
  
      Struct.Uint8('inertialSensorEn'),
      Struct.Skip(1),
      Struct.Uint16('inertialSampleRate'),
  
      Struct.Uint8('gasSensorEn'),
      Struct.Skip(1),
      Struct.Uint16('gasSamplePeriod'),
  
      Struct.Uint8('humiditySensorEn'),
      Struct.Skip(1),
      Struct.Uint16('humiditySamplePeriod'),
  
      Struct.Uint8('luxSensorEn'),
      Struct.Skip(1),
      Struct.Uint16('luxSamplePeriod'),
  
      Struct.Uint8('colorSensorEn'),
      Struct.Skip(1),
      Struct.Uint16('colorSamplePeriod'),
  
      Struct.Uint8('micSensorEn'),
      Struct.Skip(1),
      Struct.Uint16('micSampleRate')
  );
  
  const connect = async () => {
    const device = await navigator.bluetooth.requestDevice({
      // acceptAllDevices: true
      filters: [
        {
          namePrefix: 'AirSpec'
        }
      ],
      // Philips Hue Light Control Service
      optionalServices: [0xfe80]
    });
    if (!device) {
      console.error('Failed to connect to device.');
      return;
    }
    const server = await device.gatt?.connect();

    if (!server) {
      console.error('Failed to connect to server');
      return;
    }
    // Philips Hue Light Control Service
    const service = await server.getPrimaryService(
      // "0000fe80-8e22-4541-9d4c-21edae82ed19"
      0xfe80
    );

    if (!service) {
      console.error('Failed to connect to service.');
      return;
    }

    const rxChar = await service.getCharacteristic(0xfe81);

    if (!rxChar) {
      console.error('Failed to rx characteristic.');
      return;
    }
    setRxCharacteristic(rxChar);

    const txChar = await service.getCharacteristic(0xfe82);

    if (!txChar) {
      console.error('Failed to tx characteristic.');
      return;
    }
    setTxCharacteristic(txChar);

    const sysInfoChar = await service.getCharacteristic(0xfe83);

    if (!sysInfoChar) {
      console.error('Failed to get sys info characteristic.');
      return;
    }
    setSysInfoCharacteristic(sysInfoChar);
    
    const sysInfoArray = await sysInfoChar.readValue();
    setSysInfo(airspecSensorConfigHeaderStruct.createObject(sysInfoArray.buffer, 0, true));

    setIsConnected(true);
  }

  const toggle = async () => {
    const currentValue = await rxCharacteristic?.readValue();
    const lightIsCurrentlyOn = currentValue?.getUint8(0) ? true : false;

    await rxCharacteristic?.writeValue(
      new Uint8Array([lightIsCurrentlyOn ? 0x0 : 0x1])
    );
  };
  
  const requestSysInfo = async () => {
    console.log('getting sys info');
    const sysInfoArray = await sysInfoCharacteristic?.readValue();

    if(!sysInfoCharacteristic) {
      console.log("null sysInfoCharacteristic");
      return;
    }
    if (!sysInfoArray) {
      console.log("sys no exist");
      return;
    }
    // sysInfoArray?.then(value => {
      // setSysInfo(new Uint8Array(value.buffer));
    setSysInfo(airspecSensorConfigHeaderStruct.createObject(sysInfoArray.buffer, 0, true));
    const infoHeader = airspecSensorConfigHeaderStruct.createObject(sysInfoArray.buffer, 0, true);

    // console.log("sysInfo");
    console.log("requestSysInfo called");
    console.log(infoHeader);
    // console.log(infoHeader.systemRunState);
    // console.log(infoHeader.uuid);
    // console.log(infoHeader.firmware_version);
    // console.log(infoHeader.epoch);
    // console.log(infoHeader.thermopileSensorEn);
    // console.log(infoHeader.thermopileSensorPeriod);
    // console.log(infoHeader.blinkSensorEn);
    // console.log(infoHeader.blinkSampleRate);

    // })
    console.log(airspecSensorConfigHeaderStruct); // This is your struct definition)
  };

  const updateSysInfo = () => {
    // console.log("update sys info");
    // console.log(sysInfo);
    var data = new Uint8Array(sysInfo.dataView.buffer);
    // console.log(data);
    sysInfoCharacteristic?.writeValue(data);
    // if (sysInfo.length < 1) {
    //   return 0;
    // }
    // var faceTemperatureEn, blinkEn, gasEn, lightLevelEn, lightColorEn, humidityEn, micEn;

    // sysInfo;
  };

  const setSpecialMode = () => {
    // txCharacteristic?.writeValue(new Uint8Array([0x01, 0xfe, 0x01, 0x00]));
    // var header_timestamp = getUnixTimestampArray();

    var header = getHeader(5, 10);
    console.log(header);
  };

  const setBlueGreenMode = (
    start_bit: number,
    blue_min_intensity: number,
    blue_max_intensity: number,
    green_max_intensity: number,
    step_size: number,
    step_duration: number
  ) => {
    // txCharacteristic?.writeValue(new Uint8Array([0x01, 0xfe, 0x01, 0x00]));
    // var header_timestamp = getUnixTimestampArray();
    // var start_bit = 1;
    // var blue_min_intensity = 10;
    // var blue_max_intensity = 255;
    // var green_max_intensity = 255;
    // var step_size = 1;
    // var step_duration = 10;
    console.log("setBlueGreenMode");
    var payload = blueGreenModePayload(
      start_bit,
      blue_min_intensity,
      blue_max_intensity,
      green_max_intensity,
      step_size,
      step_duration
    );
    var header = getHeader(5, payload.length);
    var packet = new Uint8Array(header.length + payload.length);
    packet.set(header);
    packet.set(payload, header.length);
    console.log(packet);
    txCharacteristic?.writeValue(packet);
  };

  const setRedFlashMode = (
    start_bit: number,
    red_max_intensity: number,
    red_flash_period: number,
    red_flash_duration: number
  ) => {
    // txCharacteristic?.writeValue(new Uint8Array([0x01, 0xfe, 0x01, 0x00]));
    // var header_timestamp = getUnixTimestampArray();
    // var start_bit = 1;
    // var blue_min_intensity = 10;
    // var blue_max_intensity = 255;
    // var green_max_intensity = 255;
    // var step_size = 1;
    // var step_duration = 10;
    var payload = redFlashModePayload(
      start_bit,
      red_max_intensity,
      red_flash_period,
      red_flash_duration
    );
    var header = getHeader(5, payload.length);
    var packet = new Uint8Array(header.length + payload.length);
    packet.set(header);
    packet.set(payload, header.length);
    txCharacteristic?.writeValue(packet);
  };

  const setDFUMode = () => {
    // txCharacteristic?.writeValue(new Uint8Array([0x01, 0xfe, 0x01, 0x00]));
    // var header_timestamp = getUnixTimestampArray();
    // var start_bit = 1;
    // var blue_min_intensity = 10;
    // var blue_max_intensity = 255;
    // var green_max_intensity = 255;
    // var step_size = 1;
    // var step_duration = 10;
    var payload = new Uint8Array([0x02]);
    var header = getHeader(5, payload.length);
    var packet = new Uint8Array(header.length + payload.length);
    packet.set(header);
    packet.set(payload, header.length);
    console.log(packet);
    txCharacteristic?.writeValue(packet);
  };

  const setBlueLight = () => {
    txCharacteristic?.writeValue(new Uint8Array([0x01, 0x00, 0xfe, 0x01]))
  };
  const setGreenLight = () => {
    txCharacteristic?.writeValue(new Uint8Array([0x01, 0x01, 0x00, 0xfe]))
  };

  const setColor = (color: string) => {
    const updatedColor = (color.replace(/[^0-9a-f]/, '') + '000000').slice(0, 6);
    const r = updatedColor.slice(0, 2);
    const b = updatedColor.slice(2, 4);
    const g = updatedColor.slice(4, 6);
    const [normalizedR, normalizedG, normalizedB] = offsetAndScale([
      parseInt(r, 16),
      parseInt(b, 16),
      parseInt(g, 16)
    ]);

    // Set light color to the normalized values
    txCharacteristic?.writeValue(
      new Uint8Array([0x01, normalizedR, normalizedB, normalizedG])
    );
    return updatedColor;
  };

  return {
    connect,
    isConnected,
    sysInfo,
    setSysInfo,
    toggle,
    requestSysInfo,
    updateSysInfo,
    setSpecialMode,
    setBlueGreenMode,
    setRedFlashMode,
    setDFUMode,
    setGreenLight,
    setBlueLight,
    setColor
  };
};
