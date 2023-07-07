import { Parser } from 'binary-parser';
export const VID_STM = 0x483;
export const PID_STM_DFU = 0xdf11;


export const CLASS_APPLICATION_SPECIFIC = 0xfe;
export const SUBCLASS_DFU = 0x01;

export const PROTOCOL_DFU_2 = 0x02;

export enum STATUS {
  OK = 0,
  ERR_TARGET = 0x01,
  ERR_FILE = 0x02,
  ERR_WRITE = 0x03,
  ERR_ERASE = 0x04,
  ERR_CHECK_ERASED = 0x05,
  ERR_PROG = 0x06,
  ERR_VERIFY = 0x07,
  ERR_ADDRESS = 0x08,
  ERR_NOTDONE = 0x09,
  ERR_FIRMWARE = 0x0A,
  ERR_VENDOR = 0x0B,
  ERR_USBR = 0x0C,
  ERR_POR = 0x0D,
  ERR_UNKNOWN = 0x0E,
  ERR_STALLEDPKT = 0x0f,
}


export enum DESCRIPTOR_TYPE {
  DEVICE = 0x1,
  CONFIGURATION = 0x2,
  STRING = 0x3,
  INTERFACE = 0x4,
  ENDPOINT = 0x5,
  DFU_FUNCTIONAL = 0x21,
}

export enum REQUEST_TYPE {
  GET_DESCRIPTOR = 0x6,
}

export enum DFU_OP {
  DETACH = 0x0,
  DNLOAD = 0x1,
  UPLOAD = 0x2,
  GETSTATUS = 0x3,
  CLRSTATUS = 0x4,
  GETSTATE = 0x5,
  ABORT = 0x6,
}

export enum DFU_STATE {
  APP_IDLE = 0x0,
  APP_DETACH = 0x1,
  DFU_IDLE = 0x2,
  DFU_DNLOAD_SYNC = 0x3,
  DFU_DNBUSY = 0x4,
  DFU_DNLOAD_DLE = 0x5,
  DFU_MANIFEST_SYNC = 0x6,
  DFU_MANIFEST = 0x7,
  DFU_MANIFEST_WAIT_RESET = 0x8,
  DFU_UPLOAD_IDLE = 0x9,
  DFU_ERROR = 0x10,
}


export type DescriptorHeader = {
  bLength: number,
  bDescriptorType: number,
};

export type DFUDescriptor = DescriptorHeader & {
  bcdDFUVersion: number,
  bmAttributes: number,
  wDetachTimeOut: number,
  wTransferSize: number,
  bitCanDnload: number,
  bitCanUpload: number,
  bitManifestationTolerant: number,
  bitWillDetach: number,
};

export const DESCRIPTOR_HEADER = new Parser()
  .endianness('little')
  .uint8('bLength')
  .uint8('bDescriptorType');

export const DEVICE_DESCRIPTOR = new Parser()
  .endianness('little')
  .uint16le('bcdUSB')
  .uint8('bDeviceClass')
  .uint8('bDeviceSubClass')
  .uint8('bDeviceProtocol')
  .uint8('bMaxPacketSize')
  .uint16le('idVendor')
  .uint16le('idProduct')
  .uint16le('bcdDevice')
  .uint8('iManufacturer')
  .uint8('iProduct')
  .uint8('iSerialNumber')
  .uint8('iNumConfigurations');

export const INTERFACE_DESCRIPTOR = new Parser()
  .endianness('little')
  .uint8('bInterfaceNumber')
  .uint8('bAlternateSetting')
  .uint8('bNumEndpoints')
  .uint8('bInterfaceClass')
  .uint8('bInterfaceSubClass')
  .uint8('bInterfaceProtocol')
  .uint8('iInterface');


export const DFU_BITFLAGS = new Parser()
  .endianness('little')
  .bit1('bitCanDnload')
  .bit1('bitCanUpload')
  .bit1('bitManifestationTolerant')
  .bit1('bitWillDetach')
  .bit4('_reserved')
;

export const DFU_FUNCTIONAL_DESCRIPTOR = new Parser()
  .endianness('little')
  .uint8('bmAttributes')
  .seek(-1)
  .nest({
    type: DFU_BITFLAGS,
  })
  .uint16le('wDetachTimeOut')
  .uint16le('wTransferSize')
  .uint16le('bcdDFUVersion');

export const SUB_DESCRIPTOR = new Parser()
  .endianness('little')
  .nest({
    type: DESCRIPTOR_HEADER,
  })
  .choice({
    tag: 'bDescriptorType',
    choices: {
      [DESCRIPTOR_TYPE.DFU_FUNCTIONAL]: DFU_FUNCTIONAL_DESCRIPTOR,
      [DESCRIPTOR_TYPE.INTERFACE]: INTERFACE_DESCRIPTOR,
    },
    defaultChoice: new Parser().buffer('data', {
      length: function () {
        return (this as any)['bLength'] - DESCRIPTOR_HEADER.sizeOf();
      },
    }),
  });

export const CONFIG_DESCRIPTOR = new Parser()
  .endianness('little')
  .uint16le('wTotalLength')
  .uint8('bNumInterfaces')
  .uint8('bConfigurationValue')
  .uint8('iConfiguration')
  .uint8('bmAttributes')
  .uint8('bMaxPower');

export const CONFIG_AND_SUB_DESCRIPTORS = new Parser()
  .endianness('little')
  .nest({
    type: DESCRIPTOR_HEADER,
  })
  .nest({
    type: CONFIG_DESCRIPTOR,
  })
  .array('descriptors', {
    lengthInBytes: function () {
      return (this as any)['wTotalLength'] - CONFIG_DESCRIPTOR.sizeOf() - DESCRIPTOR_HEADER.sizeOf();
    },
    type: SUB_DESCRIPTOR,
  });

export const CONFIG_LENGTH = new Parser()
  .endianness('little')
  .nest({
    type: DESCRIPTOR_HEADER,
  })
  .uint16le('wTotalLength');


export type GetStatus = {
  status: number,
  pollTimeout: number,
  state: number,
};

export const GET_STATUS = new Parser()
  .endianness('little')
  .uint8('status')
  .buffer('pollTimeout', {
    length: 3,
  })
  .uint8('state')
  .uint8('iString');

export const request_dfu_device = async () => {
  const device = await navigator.usb.requestDevice({
    filters: [
      {
        vendorId: VID_STM,
        productId: PID_STM_DFU,

        classCode: CLASS_APPLICATION_SPECIFIC,
        subclassCode: SUBCLASS_DFU,
      },
    ],
  });

  await device.open();


  return device;
};

export const DFU_REQ_PARAMS = {
  requestType: 'class' as USBRequestType,
  recipient: 'interface' as USBRecipient,
};

export const ctrl_request = async (device: USBDevice, request: USBControlTransferParameters, length: number) => {
  await device.claimInterface(request.index);

  const result = await device.controlTransferIn(request, length);

  if (result.status !== 'ok') throw new Error(result.status ?? 'unknown usb error');
  if (result.data === undefined) throw new Error('missing usb result data');

  await device.releaseInterface(request.index);

  return result.data;
};

export const ctrl_write = async (device: USBDevice, request: USBControlTransferParameters, data: BufferSource) => {
  await device.claimInterface(request.index);

  const result = await device.controlTransferOut(request, data);

  if (result.status !== 'ok') throw new Error(result.status ?? 'unknown usb error');
  if (result.bytesWritten !== data.byteLength) throw new Error('didn\'t transfer all bytes');

  await device.releaseInterface(request.index);
};

export const read_dfu_descriptor = async (device: USBDevice): Promise<DFUDescriptor> => {
  const index = 0;
  const value = (DESCRIPTOR_TYPE.CONFIGURATION << 8) | index;

  const cfg_result = await ctrl_request(device, {
    requestType: 'standard',
    recipient: 'device',
    request: REQUEST_TYPE.GET_DESCRIPTOR,
    value,
    index: 0,
  }, 4);

  const descriptor = CONFIG_LENGTH.parse(new Uint8Array(cfg_result.buffer));

  const full_cfg_result = await ctrl_request(device, {
    requestType: 'standard',
    recipient: 'device',
    request: REQUEST_TYPE.GET_DESCRIPTOR,
    value,
    index: 0,
  }, descriptor['wTotalLength']);

  const fullDescriptor = CONFIG_AND_SUB_DESCRIPTORS.parse(new Uint8Array(full_cfg_result.buffer));

  const dfu_descriptors = fullDescriptor['descriptors'].filter((x: any) => x['bDescriptorType'] === DESCRIPTOR_TYPE.DFU_FUNCTIONAL);
  if (dfu_descriptors.length !== 1) throw new Error('could not find dfu config descriptor');

  return dfu_descriptors[0];
};

export const get_status = async (
  dev: USBDevice,
  if_index: number = 0,
) => {
  const descriptor = await read_dfu_descriptor(dev);
  console.debug({descriptor});

  const result = await ctrl_request(dev, {
    request: DFU_OP.GETSTATUS,
    value: 0,
    index: if_index,
    ...DFU_REQ_PARAMS,
  }, GET_STATUS.sizeOf());

  return GET_STATUS.parse(new Uint8Array(result.buffer)) as GetStatus;
};

export const get_state = async (
  dev: USBDevice,
  if_index: number = 0,
) => {
  const result = await ctrl_request(dev, {
    request: DFU_OP.GETSTATE,
    value: 0,
    index: if_index,
    ...DFU_REQ_PARAMS,
  }, 1);

  return new Uint8Array(result.buffer)[0];
};

export const ensure_clean_status = async (
  dev: USBDevice,
  if_index: number = 0,
) => {
  while (true) {
    const { status} =  await get_status(dev, if_index);
    if (status === STATUS.OK) break;

    console.error({ status: status as STATUS }, 'bad status, resetting');

    await ctrl_request(dev, {
      request: DFU_OP.CLRSTATUS,
      value: 0,
      index: if_index,
      ...DFU_REQ_PARAMS,
    }, 0);
  }
}


export const dfu_download_one = async (
  dev: USBDevice,
  if_index: number = 0,
  block_idx: number,
  data: BufferSource,
) => {
  await ctrl_write(dev, {
    request: DFU_OP.DNLOAD,
    value: block_idx,
    index: if_index,
    ...DFU_REQ_PARAMS,
  }, data);
};

export const dfu_download = async (
  dev: USBDevice,
  if_index: number = 0,
  data: ArrayBufferView,
) => {
  const {wTransferSize} = await read_dfu_descriptor(dev);
  const {state} = await get_status(dev);

  if (state !== DFU_STATE.DFU_IDLE) throw new Error('invalid DFU state for download');

  await ensure_clean_status(dev, if_index);

  const nChunks = Math.ceil(data.byteLength / wTransferSize);

  console.debug({nChunks}, 'starting dfu');

  for (let i = 0; i < nChunks; i++) {
    const chunk = data.buffer.slice(i * wTransferSize, (i + 1) * wTransferSize);

    console.debug({nChunks, i}, 'dfu: transferring chunk...');
    await dfu_download_one(dev, if_index, i, chunk);
  }

  console.info('dfu completed');
};

export const dfu_upload = async (
  dev: USBDevice,
  if_index: number = 0,
) => {
  const {wTransferSize} = await read_dfu_descriptor(dev);

  console.debug({wTransferSize}, 'starting dfu upload');

  const elts: ArrayBuffer[] = [];
  let block_idx = 0;

  while (true) {
    console.debug({block_idx, wTransferSize}, 'dfu: transferring chunk...');

    const data = await ctrl_request(dev, {
      request: DFU_OP.UPLOAD,
      value: block_idx++,
      index: if_index,
      ...DFU_REQ_PARAMS,
    }, wTransferSize);

    elts.push(data.buffer);

    if (data.byteLength < wTransferSize) break;
  }

  console.info('dfu upload completed');

  return elts;
};

export const dfu_detach = async (
  dev: USBDevice,
  if_index: number = 0,
) => {
  const { bitWillDetach } = await read_dfu_descriptor(dev);

  try {
    await ctrl_request(dev, {
      request: DFU_OP.DETACH,
      value: 0,
      index: if_index,
      ...DFU_REQ_PARAMS,
    }, 0);
  } catch (e) {
    if ((e as Error).message !== 'stall') throw e;
  }

  if (!Boolean(bitWillDetach)) await dev.reset();
  await dev.open();
};
