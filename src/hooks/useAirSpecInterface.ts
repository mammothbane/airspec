import * as React from "react";
export interface AirSpec {
  connect: () => void;
  isConnected: boolean;
  toggle: () => void;
  getSysInfo: () => void;
  setSpecialMode: () => void;
  setBlueGreenMode: (start_bit:number, blue_min_intensity:number, blue_max_intensity:number,
    green_max_intensity:number, step_size:number, step_duration:number) => void;
  setRedFlashMode: (start_bit:number, red_max_intensity:number, red_flash_period:number,
    red_flash_duration:number) => void;
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
  sum: (array: number[]) => array.reduce((sum, val) => sum + val, 0),
};
const offsetAndScale = (rgb: number[]) => {
  // Offset calculation would divide by zero if the values are equal
  if (rgb[0] === rgb[1] && rgb[1] === rgb[2]) {
    return [Math.floor(255 / 3), Math.floor(255 / 3), Math.floor(255 / 3)];
  }

  const min = utils.min(rgb);
  const max = utils.max(rgb);

  const offset = rgb.map((value) => (value - min) / (max - min));
  const sum = utils.sum(offset);
  const scaled = offset.map((value) => Math.floor((value / sum) * 255));
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

function getUnixTimestampArray() {
  //https://stackoverflow.com/questions/221294/how-do-i-get-a-timestamp-in-javascript
  var timestamp_seconds = Math.round(+new Date()/1000);
  var timestampArray = new Uint8Array([
      (timestamp_seconds) & 0xFF, 
      (timestamp_seconds>>8) & 0xFF, 
      (timestamp_seconds>>16) & 0xFF, 
      (timestamp_seconds>>24) & 0xFF]);
  return timestampArray;
}

function getPayloadSizeArray(value:number) {
  var payloadSizeArray = new Uint8Array([
    (value) & 0xFF, 
    (value>>8) & 0xFF]);
  return payloadSizeArray;
}

function getHeader(packet_type:number, payload_size:number) {
  var timestamp = getUnixTimestampArray();
  var payloadSize = getPayloadSizeArray(payload_size);
  var packetType = new Uint8Array([
    (packet_type) & 0xFF, 
    (packet_type>>8) & 0xFF]);
  var header = new Uint8Array(timestamp.length + payloadSize.length + packetType.length);
  header.set(packetType);
  header.set(payloadSize, packetType.length);
  header.set(timestamp, packetType.length + payloadSize.length);
  return header;
}

function blueGreenModePayload(start_bit:number, 
  blue_min_intensity:number, 
  blue_max_intensity:number,
  green_max_intensity:number,
  step_size:number,
  step_duration:number) {

    var payload = new Uint8Array([
      2,
      (start_bit) & 0xFF, 
      (blue_min_intensity) & 0xFF,
      (blue_max_intensity) & 0xFF,
      (green_max_intensity) & 0xFF,
      (step_size) & 0xFF,
      (step_duration) & 0xFF]);
    return payload;
  }


function redFlashModePayload(start_bit:number, 
  red_max_intensity:number, 
  red_flash_period:number,
  red_flash_duration:number) {

    var payload = new Uint8Array([
      3,
      (start_bit) & 0xFF, 
      (red_max_intensity) & 0xFF,
      (red_flash_period) & 0xFF,
      0x00,
      (red_flash_duration) & 0xFF,
      (red_flash_duration>>8) & 0xFF,
      (red_flash_duration>>16) & 0xFF,
      (red_flash_duration>>24) & 0xFF]);
    return payload;
  }


export const useAirSpecInterface = (): AirSpec => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [rxCharacteristic, setRxCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [txCharacteristic, setTxCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [sysInfoCharacteristic, setSysInfoCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);
    
  const connect = async () => {
    const device = await navigator.bluetooth.requestDevice({
      // acceptAllDevices: true
      filters: [
        {
          namePrefix: "AirSpec",
        },
      ],
      // Philips Hue Light Control Service
      optionalServices: [0xfe80],
    });
    if (!device) {
      console.error("Failed to connect to device.");
      return;
    }
    const server = await device.gatt?.connect();

    if (!server) {
      console.error("Failed to connect to server");
      return;
    }
    // Philips Hue Light Control Service
    const service = await server.getPrimaryService(
      // "0000fe80-8e22-4541-9d4c-21edae82ed19"
      0xfe80
    );

    if (!service) {
      console.error("Failed to connect to service.");
      return;
    }

    const rxChar = await service.getCharacteristic(
      0xfe82
      );

    if (!rxChar) {
      console.error("Failed to rx characteristic.");
      return;
    }
    setRxCharacteristic(rxChar);

    const txChar = await service.getCharacteristic(
      0xfe81
    );

    if (!txChar) {
      console.error("Failed to tx characteristic.");
      return;
    }
    setTxCharacteristic(txChar);

    const sysInfoChar = await service.getCharacteristic(
      0xfe83
    );

    if (!sysInfoChar) {
      console.error("Failed to get sys info characteristic.");
      return;
    }
    setSysInfoCharacteristic(sysInfoChar);

    setIsConnected(true);
  };

  const toggle = async () => {
    const currentValue = await rxCharacteristic?.readValue();
    const lightIsCurrentlyOn = currentValue?.getUint8(0) ? true : false;

    await rxCharacteristic?.writeValue(
      new Uint8Array([lightIsCurrentlyOn ? 0x0 : 0x1])
    );
  };

  const getSysInfo = () => {
    const sysInfoArray = sysInfoCharacteristic?.readValue();
  }

  const setSpecialMode = () => {
    // txCharacteristic?.writeValue(new Uint8Array([0x01, 0xfe, 0x01, 0x00]));
    // var header_timestamp = getUnixTimestampArray();
    
    var header = getHeader(5, 10);
    console.log(header);
  };

  const setBlueGreenMode = (start_bit:number, blue_min_intensity:number, blue_max_intensity:number,
    green_max_intensity:number, step_size:number, step_duration:number) => {
    // txCharacteristic?.writeValue(new Uint8Array([0x01, 0xfe, 0x01, 0x00]));
    // var header_timestamp = getUnixTimestampArray();
    // var start_bit = 1;
    // var blue_min_intensity = 10;
    // var blue_max_intensity = 255;
    // var green_max_intensity = 255;
    // var step_size = 1;
    // var step_duration = 10;
    var payload = blueGreenModePayload(start_bit, 
      blue_min_intensity, blue_max_intensity,
      green_max_intensity, step_size, step_duration);
    var header = getHeader(5, payload.length);
    var packet = new Uint8Array(header.length + payload.length);
    packet.set(header);
    packet.set(payload, header.length);
    txCharacteristic?.writeValue(packet);
  };

  const setRedFlashMode = (start_bit:number, red_max_intensity:number, red_flash_period:number,
    red_flash_duration:number) => {
    // txCharacteristic?.writeValue(new Uint8Array([0x01, 0xfe, 0x01, 0x00]));
    // var header_timestamp = getUnixTimestampArray();
    // var start_bit = 1;
    // var blue_min_intensity = 10;
    // var blue_max_intensity = 255;
    // var green_max_intensity = 255;
    // var step_size = 1;
    // var step_duration = 10;
    var payload = redFlashModePayload(start_bit, 
      red_max_intensity, red_flash_period,
      red_flash_duration);
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
    txCharacteristic?.writeValue(new Uint8Array([0x01, 0x00, 0xfe, 0x01]));
  };
  const setGreenLight = () => {
    txCharacteristic?.writeValue(new Uint8Array([0x01, 0x01, 0x00, 0xfe]));
  };

  const setColor = (color: string) => {
    const updatedColor = (color.replace(/[^0-9a-f]/, "") + "000000").slice(
      0,
      6
    );
    const r = updatedColor.slice(0, 2);
    const b = updatedColor.slice(2, 4);
    const g = updatedColor.slice(4, 6);
    const [normalizedR, normalizedG, normalizedB] = offsetAndScale([
      parseInt(r, 16),
      parseInt(b, 16),
      parseInt(g, 16),
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
    toggle,
    getSysInfo,
    setSpecialMode,
    setBlueGreenMode,
    setRedFlashMode,
    setDFUMode,
    setGreenLight,
    setBlueLight,
    setColor,
  };
};
