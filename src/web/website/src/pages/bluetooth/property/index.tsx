import { Switch, TextField } from '@mui/material';
import { GenericProp } from './GenericProp';

export type ScalarProps<T> = {
  name: string,
  value: T,
  onChange: (n: T) => void,
};

const FIELD_WIDTH = 128;

export const NumberProp = ({name, value, onChange}: ScalarProps<number>) => <GenericProp
  name={name}
>
  <TextField
    inputProps={{
      inputMode: 'numeric',
      pattern: '[0-9]*',
    }}
    onChange={(evt) => onChange(Number(evt.target.value))}
    value={value}
    sx={{
      width: FIELD_WIDTH,
    }}
  />
</GenericProp>;

export const StringProp = ({name, value, onChange}: ScalarProps<string>) => <GenericProp
  name={name}
>
  <TextField
    onChange={(evt) => onChange(evt.target.value)}
    value={value}
    sx={{
      width: FIELD_WIDTH,
    }}
  />
</GenericProp>;

export const BoolProp = ({name, value, onChange}: ScalarProps<boolean>) => <GenericProp
  name={name}
>
  <Switch
    checked={value}
    onChange={(_evt, value) => onChange(value)}
  />
</GenericProp>;
