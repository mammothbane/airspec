import { Box, Switch, TextField, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

export type ScalarProps<T> = {
  name: string,
  value: T,
  onChange: (n: T) => void,
};

const FIELD_WIDTH = 128;

export const GenericProp = <T, >({
                                   name,
                                   children,
                                 }: PropsWithChildren<Pick<ScalarProps<T>, 'name'>>) => <Box sx={{
  my: 1,
  display: 'flex',
  flexDirection: 'row',
}}>
  <Typography variant={'subtitle1'}>
    {name}
  </Typography>

  <Box sx={{flexGrow: 1}}/>

  {children}
</Box>;

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
