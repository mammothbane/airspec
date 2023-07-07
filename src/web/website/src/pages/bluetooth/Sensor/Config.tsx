import { Box, Select, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { flatten } from 'flat';
import { BoolProp, NumberProp, StringProp } from '../property';
import { SensorType } from '../types';
import { ENUM_MAPPING } from './util';

export type Props = {
  config: Record<string, any>,
  type: SensorType,
}

export const Config = ({
                         config,
                         type,
                       }: Props) => {
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
        return <NumberProp name={k} key={k} value={v as number} onChange={() => {
        }}/>;

      case 'string':
        return <StringProp name={k} key={k} value={v as string} onChange={() => {
        }}/>;

      case 'boolean':
        return <BoolProp name={k} key={k} value={v as boolean} onChange={() => {
        }}/>;

      default:
        console.warn({k, v}, 'unhandled type');
        return null;
    }
  });

  return <Box>
    {props}
  </Box>;
};
