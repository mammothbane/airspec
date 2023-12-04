import { Parser } from 'binary-parser/dist/esm/binary_parser';
import _ from 'lodash';
import { Datum, PlotData } from 'plotly.js';

import {
  BlinkPacket,
  BME680_signal_id,
  BMEPacket,
  IMU_accel_cutoff,
  IMU_accel_range,
  IMU_gyro_cutoff,
  IMU_gyro_range,
  IMUPacket,
  LuxPacket,
  MicLevelPacket,
  SGPPacket,
  Sht45_heater,
  Sht45_precision,
  Spec_gain,
  SpecPacket,
  Thermopile_location,
  ThermPacket,
  Tsl2591Gain,
  Tsl2591IntegrationTime,
} from '../../../../../../../proto/message.proto';
import { SensorPacket_Payload, SensorType } from '../types';

type Enum = Record<string, any>;
export const enum_kv = (enum_: Enum) => Object.entries(enum_).filter(([k, _v]) => isNaN(Number(k)));
export const enum_mapping = (enum_: Enum) => new Map(enum_kv(enum_));
export const enum_revmapping = (enum_: Enum) => new Map(enum_kv(enum_).map(([k, v]) => [v, k]));
export const enum_entry = (enum_: Enum): [Map<string, number>, Map<number, string>] => [enum_mapping(enum_) as Map<string, number>, enum_revmapping(enum_) as Map<number, string>];

export const Vec3 = new Parser()
  .int16be('x')
  .int16be('y')
  .int16be('z')
;

export type Vec3_t = {
  x: number,
  y: number,
  z: number,
};

export const IMUBinaryPacket = new Parser()
  .nest('accel', {
    type: Vec3,
  })
  .nest('gyro', {
    type: Vec3,
  });

export type IMUBinaryPacket_t = {
  accel: Vec3_t,
  gyro: Vec3_t,
};

export const IMUPayload = new Parser()
  .array('samples', {
    readUntil: 'eof',
    type: IMUBinaryPacket,
  });

export const ENUM_MAPPING: Map<[SensorType, string], [Map<string, number>, Map<number, string>]> = new Map([
  [['imu', 'accelSettings.cutoff'], enum_entry(IMU_accel_cutoff)],
  [['imu', 'accelSettings.range'], enum_entry(IMU_accel_range)],
  [['imu', 'gyroSettings.cutoff'], enum_entry(IMU_gyro_cutoff)],
  [['imu', 'gyroSettings.range'], enum_entry(IMU_gyro_range)],
  [['sht', 'precisionLevel'], enum_entry(Sht45_precision)],
  [['sht', 'heaterSettings'], enum_entry(Sht45_heater)],
  [['spec', 'gain'], enum_entry(Spec_gain)],
  [['lux', 'gain'], enum_entry(Tsl2591Gain)],
  [['lux', 'integrationTime'], enum_entry(Tsl2591IntegrationTime)],
]);

export const SPEC_BANDS = [
  'Clear_1',
  'Clear_2',
  'Nir_1',
  'Nir_2',
  '_415',
  '_445',
  '_480',
  '_515',
  '_555',
  '_590',
  '_630',
  '_380',
];

export const extractData = (sample: Record<string, any>, type: SensorPacket_Payload): Partial<PlotData>[] => {
  switch (type.replace(/Packet$/, '')) {
    case 'spec':
      const spec_ts: number[] = sample.payload.map((spec: SpecPacket.Payload) => spec.timestampUnix);

      const bands: number[][] = SPEC_BANDS.map(band => {
        return sample.payload.map((spec: any) => spec[`band${band}` as string] as number);
      });

      return bands.map((band, i) => ({
        x: spec_ts,
        y: band,
        name: SPEC_BANDS[i].replace(/^_/, ''),
      }));


    case 'therm':
      const therm_sample = sample as ThermPacket;

      const vals: Record<string, Partial<PlotData>> = {};

      therm_sample.payload.forEach(therm => {
        const name = Thermopile_location[therm.descriptor!];

        if (!(name in vals)) vals[name] = {
          name,
          x: [],
          y: [],
        };

        (vals[name].x as Datum[]).push(therm.timestampUnix! as number);
        (vals[name].y as Datum[]).push(therm.objectTemp!);
      });

      return Object.values(vals);

    case 'sht':
      const sht_ts = sample.payload.map((payload: any) => payload.timestampUnix);
      const hum = sample.payload.map((payload: any) => payload.humidity);
      const temp = sample.payload.map((payload: any) => payload.temperature);

      return [
        {x: sht_ts, y: hum, name: 'humidity'},
        {x: sht_ts, y: temp, name: 'temperature'},
      ];

    case 'blink':
      const blink_sample = sample as BlinkPacket;
      const sample_period = (1.0 / blink_sample.sampleRate) * 1000;

      const samples: number[] = Array.from(blink_sample.payloadByte.sample);
      const blink_ts = samples.map((_x, i) => (blink_sample.timestampUnix as number) + sample_period * i);

      return [
        {x: blink_ts, y: samples},
      ];

    case 'imu':
      const imu_packet = sample as IMUPacket;

      const elems = IMUPayload.parse(imu_packet.payload!.sample!);

      const imu_samples = (elems.samples as IMUBinaryPacket_t[]).map((pkt, i) => ({
        ts: (imu_packet.timestampUnix as number) + imu_packet.samplingFrequency * i,
        ...pkt,
      }));

      const ts = _.map(imu_samples, 'ts') as number[];

      return ['gyro', 'accel'].flatMap(key => ['x', 'y', 'z'].map(dim => ({
        x: ts,
        y: _.map(imu_samples, `${key}.${dim}`) as number[],
        name: `${key}.${dim}`,
      })));

    case 'bme':
      const bme_packet = sample as BMEPacket;

      return bme_packet.payload.map(pkt => ({
        x: [pkt.timestampUnix! as number],
        y: [pkt.signal!],
        name: BME680_signal_id[pkt.sensorId!].toString(),
      })).sort((x, y) => x.name.localeCompare(y.name)).filter(({name}) => {
        return !/^RAW_/.test(name) && !/_STATUS$/.test(name);
      });


    case 'mic':
      // const micPacket = sample as MicPacket;

      // return [{
      //   x: [new Array(micPacket.samplesPerFft).map((_, i) => micPacket.startFrequency + i * micPacket.frequencySpacing)],
      //   y: [micPacket.timestampUnix],
      //   z: []
      // }];

      return [];

    case 'micLevel':
      const micLevelPacket = sample as MicLevelPacket;

      const mic_ts = micLevelPacket.payload.map(payload => payload.timestampUnix as number);
      const rms = micLevelPacket.payload.map(payload => payload.soundRms as number);
      const splDb = micLevelPacket.payload.map(payload => payload.soundSplDb as number);

      return [
        {
          name: 'rms',
          x: mic_ts,
          y: rms,
        },
        {
          name: 'spl',
          x: mic_ts,
          y: splDb,
        },
      ];

    case 'sgp':
      const sgp_packet = sample as SGPPacket;

      const sgp_ts = sgp_packet.payload.map(payload => payload.timestampUnix!) as number[];

      const to_extract = [
        'noxIndexValue',
        'vocIndexValue',
      ];

      return to_extract.map(extracted_val => {
        const values = sgp_packet.payload.map(sample => (sample as Record<string, number>)[extracted_val]);

        return {
          x: sgp_ts,
          y: values,
          name: extracted_val.replace(/IndexValue$/, ' index'),
        };
      });

    case 'lux':
      const lux_ts = sample.payload.map((payload: LuxPacket.Payload) => payload.timestampUnix as number);
      const lux = sample.payload.map((payload: LuxPacket.Payload) => payload.lux);

      return [
        {x: lux_ts, y: lux},
      ];
  }

  console.warn({type}, 'unknown packet type');
  return [];
};
