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
  MicLevelPacket, MicPacket,
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

export const ENUM_MAPPING: Map<string, [Map<string, number>, Map<number, string>]> = new Map([
  ['imu|accelSettings.cutoff', enum_entry(IMU_accel_cutoff)],
  ['imu|accelSettings.range', enum_entry(IMU_accel_range)],
  ['imu|gyroSettings.cutoff', enum_entry(IMU_gyro_cutoff)],
  ['imu|gyroSettings.range', enum_entry(IMU_gyro_range)],
  ['sht|precisionLevel', enum_entry(Sht45_precision)],
  ['sht|heaterSettings', enum_entry(Sht45_heater)],
  ['spec|gain', enum_entry(Spec_gain)],
  ['lux|gain', enum_entry(Tsl2591Gain)],
  ['lux|integrationTime', enum_entry(Tsl2591IntegrationTime)],
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


export type FieldType = 'number' | 'string' | 'boolean' | { children: Record<string, FieldType> };
export type Config = Record<string, FieldType>;

export const CONFIG: Record<SensorType, Config> = {
  imu: {
    samplePeriodMs: 'number',
    enableWindowing: 'number',
    enableWindowingSync: 'number',
    windowSizeMs: 'number',
    windowPeriodMs: 'number',

    accelSettings: {
      children: {
        cutoff: 'number',
        range: 'number',
        sampleRateDivisor: 'number',
      }
    },
    gyroSettings: {
      children: {
        cutoff: 'number',
        range: 'number',
        sampleRateDivisor: 'number',
      }
    }
  },

  sht: {
    samplePeriodMs: 'number',
    precisionLevel: 'number',
    heaterSettings: 'number',
  },

  mic: {
    samplePeriodMs: 'number',
    micSampleFreq: 'number',
  },

  blink: {
    sampleFrequency: 'number',
    enableDaylightCompensation: 'boolean',
    daylightCompensationUpperThresh: 'number',
    daylightCompensationLowerThresh: 'number',
    enableWindowing: 'number',
    enableWindowingSync: 'number',
    windowSizeMs: 'number',
    windowPeriodMs: 'number',
  },

  therm: {
    samplePeriodMs: 'number',
    enableTopOfNose: 'boolean',
    enableNoseBridge: 'boolean',
    enableFrontTemple: 'boolean',
    enableMidTemple: 'boolean',
    enableRearTemple: 'boolean',
  },

  bme: {
    samplePeriodMs: 'number',
  },

  sgp: {
    samplePeriodMs: 'number',
  },

  lux: {
    samplePeriodMs: 'number',
    gain: 'number',
    integrationTime: 'number',
  },

  spec: {
    samplePeriodMs: 'number',
    integrationTime: 'number',
    integrationStep: 'number',
    gain: 'number',
  }
};

const IMU_DOWNSAMPLE = 4;
const BLINK_DOWNSAMPLE = 8;

const IMU_KEYS = _.chain(['gyro', 'accel'])
  .flatMap(key => _.map(['x', 'y', 'z'], dim => `${key}.${dim}`))
  .value();

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
        mode: 'markers',
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
          mode: 'markers',
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
      const chunk_sample_period = sample_period * BLINK_DOWNSAMPLE;

      const samples = _.chain(blink_sample.payloadByte.sample).chunk(BLINK_DOWNSAMPLE).map(samples => _.mean(samples)).value();
      const blink_ts = _.chain(0).range(samples.length).map(i => (blink_sample.timestampUnix as number) +  chunk_sample_period * i).value();

      return [
        {x: blink_ts, y: samples, mode: 'markers'},
      ];

    case 'imu':
      const imu_packet = sample as IMUPacket;

      const elems = IMUPayload.parse(imu_packet.payload!.sample!);
      const pkt_step = 1 / imu_packet.samplingFrequency * IMU_DOWNSAMPLE;
      const pkt_step_millis = pkt_step * 1000;

      const imu_samples = _.chain(elems.samples as IMUBinaryPacket_t[])
        .chunk(IMU_DOWNSAMPLE)
        .map((pkts, i) => {
          const meanObj = _.chain(IMU_KEYS)
            .map(k => [k, _.chain(pkts).flatMap(k).mean().value()])
            .reduce((acc, [k, v]) => {
              _.set(acc, k, v);
              return acc;
            }, {})
            .value();

          return {
            ts: (imu_packet.timestampUnix as number) + pkt_step_millis * i,
            ...meanObj
          };
        })
        .value();

      const ts = _.chain(imu_samples)
        .map('ts')
        .value();

      return _.chain(IMU_KEYS).map(key => ({
        x: ts,
        y: _.map(imu_samples, key) as number[],
        name: key,
        mode: 'markers' as 'markers'
      })).value();

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
      const micPacket = sample as MicPacket;

      return _.chain(micPacket.payload?.sample ?? [])
        .map((sample, i) => {
          const freq = micPacket.startFrequency + i * micPacket.frequencySpacing;

          return {
            name: freq.toFixed(0).toString(),
            x: [micPacket.timestampUnix as number],
            y: [sample],
            mode: 'markers' as 'markers'
          }
        })
        .value();

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
        {x: lux_ts, y: lux, mode: 'markers'},
      ];
  }

  console.warn({type}, 'unknown packet type');
  return [];
};
