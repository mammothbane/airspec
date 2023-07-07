import { SensorConfig, SensorPacket } from '../../../../../../proto/message.proto';

export type SensorType
  = 'blink'
  | 'bme'
  | 'imu'
  | 'lux'
  | 'mic'
  | 'sgp'
  | 'sht'
  | 'spec'
  | 'therm'
  ;
export const ALL_SENSOR_TYPES: Set<SensorType> = new Set<SensorType>([
  'blink',
  'bme',
  'imu',
  'lux',
  'mic',
  'sgp',
  'sht',
  'spec',
  'therm',
]);

export type SensorPacket_Payload = Exclude<SensorPacket['payload'], undefined>;
export type SensorConfig_Type = Exclude<keyof SensorConfig, undefined | 'toJSON'>;

export const from_packet_type = (packet_type: SensorPacket_Payload): SensorType | null => {
  const type = packet_type.replace(/Packet$/, '');

  if (type === 'micLevel') return 'mic';

  if (!ALL_SENSOR_TYPES.has(type as SensorType)) return null;
  return type as SensorType;
}

export const to_packet_type = (sensor_type: SensorType): SensorPacket_Payload[] => {
  if (sensor_type === 'mic') return ['micPacket', 'micLevelPacket'];

  return [`${sensor_type}Packet` as SensorPacket_Payload];
};

export const CONFIG_MAPPING: Map<SensorType, SensorConfig_Type> = new Map([
  ['sht', 'humidity'],
  ['spec', 'color'],
  ['therm', 'thermopile'],
]);

export const ENABLE_MAPPING: Map<SensorType, string> = new Map([
  ['bme', 'bme688'],
  ['spec', 'spectrometer'],
  ['therm', 'thermopiles'],
]);


export const forward_map = <K, V>(m: Map<K, V>) => (k: K): V => m.get(k) ?? k as unknown as V;
export const reverse_map = <K, V>(m: Map<K, V>): ((v: V) => K) => {
  const rev: Map<V, K> = new Map(Array.from(m.entries()).map(([k, v]) => [v, k]));

  return forward_map(rev);
};


export const to_enable = forward_map(ENABLE_MAPPING);
export const from_enable = reverse_map(ENABLE_MAPPING);


export const to_config = forward_map(CONFIG_MAPPING);
export const from_config = reverse_map(CONFIG_MAPPING);


export const DEFAULT_ENABLED: Set<SensorType> = new Set<SensorType>([
  'blink',
  'bme',
  'spec',
  'therm',
  'sgp',
  'sht',
  'lux',
]);
