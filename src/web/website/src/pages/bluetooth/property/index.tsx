import { Switch, TextField } from '@mui/material';
import { GenericProp } from './GenericProp';
import {useEffect, useState} from "react";

export type ScalarProps<T> = {
  name: string,
  value: T | undefined,
  onChange: (n: T) => Promise<void>,
};

const FIELD_WIDTH = 128;

export const NumberProp = ({name, value, onChange}: ScalarProps<number>) => {
  const [val, setVal] = useState(value?.toString() ?? (-1).toString());
  useEffect(() => setVal(value?.toString() ?? (-2).toString()), [value]);

  return <GenericProp
    name={name}
  >
    <TextField
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*',
      }}

      value={val}
      onChange={async (evt) => {
        setVal(evt.target.value);
        await onChange(Number(evt.target.value));
      }}

      sx={{
        width: FIELD_WIDTH,
      }}
    />
  </GenericProp>
};

export const StringProp = ({name, value, onChange}: ScalarProps<string>) => {
  const [val, setVal] = useState(value ?? '[no value]');
  useEffect(() => setVal(value ?? '[no value]'), [value]);

  return <GenericProp
    name={name}
  >
    <TextField
      value={val}
      onChange={async (evt) => {
        setVal(evt.target.value);
        await onChange(evt.target.value);
      }}

      sx={{
        width: FIELD_WIDTH,
      }}
    />
  </GenericProp>
};

export const BoolProp = ({name, value, onChange}: ScalarProps<boolean>) => {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value ?? false), [value]);

  return <GenericProp
    name={name}
  >
    <Switch
      checked={val}
      onChange={async (_evt, value) => {
        setVal(value);
        await onChange(value);
      }}
    />
  </GenericProp>;
}
