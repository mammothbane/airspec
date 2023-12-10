import { Box, Select, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { flatten } from 'flat';
import { BoolProp, NumberProp, StringProp } from '../property';
import {SensorType, to_config} from '../types';
import {CONFIG, ENUM_MAPPING} from './util';
import {useAirspecsSelector} from "../../../store";
import {GenericProp} from "../property/GenericProp";

export type Props = {
  type: SensorType,
  onChange: (path: string, value: any) => Promise<void>,
}

export const Config = ({
                         type,
                         onChange,
                       }: Props) => {
  const config = useAirspecsSelector(state => {
    if (state.bluetooth.config == null) return null;

    return state.bluetooth.config[to_config(type)];
  }) ?? {};

  const additional = CONFIG[type];

  const vals = flatten(config);
  const kv = flatten(additional);

  const props = Object.entries(kv as {}).map(([k, v]) => {
    k = k.replace(/\.children/g, '');

    const enum_type = ENUM_MAPPING.get(`${type}|${k}`);
    const val = (vals as unknown as any)[k];

    if (enum_type !== undefined) {
      const [fwd] = enum_type;

      return <GenericProp name={k}>
        <Select value={val == null ? '' : fwd.get(val)} onChange={(evt) => evt.target.value as string}>
          {
            Array.from(fwd.entries()).map(([k, v]) => {
              return <MenuItem key={`${v}-${k}`} value={v}>{k}</MenuItem>;
            })
          }
        </Select>
      </GenericProp>;
    }

    switch (v) {
      case 'number':
        return <NumberProp name={k} key={k} value={(val as number | undefined) ?? 0} onChange={async (n) => {
          await onChange(k, n);
        }}/>;

      case 'string':
        return <StringProp name={k} key={k} value={(val as string | undefined) ?? ''} onChange={async (s) => {
          await onChange(k, s);
        }}/>;

      case 'boolean':
        return <BoolProp name={k} key={k} value={(val as boolean | undefined) ?? false} onChange={async (b) => {
          await onChange(k, b);
        }}/>;

      default:
        console.warn({k, v, val}, 'unhandled prop type');
        return null;
    }
  });

  return <Box sx={{
    backgroundColor: '#e8e8e8',
    p: 2,
  }}>
    {props}
  </Box>;
};
