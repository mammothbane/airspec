import { Box, Select, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { flatten } from 'flat';
import { BoolProp, NumberProp, StringProp } from '../property';
import {SensorType, to_config} from '../types';
import {CONFIG, ENUM_MAPPING} from './util';
import {useAirspecsSelector} from "../../../store";

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

  const kv = flatten(config);

  const props = Object.entries(kv as {}).map(([k, v]) => {
    const address: [SensorType, string] = [type, k];
    const enum_type = ENUM_MAPPING.get(address);

    if (enum_type !== undefined) {
      const [fwd] = enum_type;

      return <Box key={k}>
        <Typography>
          {k}
        </Typography>

        <Select>
          {
            Array.from(fwd.entries()).map(([k, v]) => {
              return <MenuItem value={v}>{k}</MenuItem>;
            })
          }
        </Select>
      </Box>;
    }

    switch (typeof (v)) {
      case 'number':
        return <NumberProp name={k} key={k} value={v as number} onChange={async (n) => {
          await onChange(k, n);
        }}/>;

      case 'string':
        return <StringProp name={k} key={k} value={v as string} onChange={async (s) => {
          await onChange(k, s);
        }}/>;

      case 'boolean':
        return <BoolProp name={k} key={k} value={v as boolean} onChange={async (b) => {
          await onChange(k, b);
        }}/>;

      default:
        console.warn({k, v}, 'unhandled prop type');
        return null;
    }
  });

  return <Box>
    {props}
  </Box>;
};
