import { Box, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import { ScalarProps } from './index';

export const GenericProp = <T, >({
                                   name,
                                   children,
                                 }: PropsWithChildren<Pick<ScalarProps<T>, 'name'>>) => <Box sx={{
  my: 1,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
}}>
  <Typography variant={'body1'} sx={{
    fontSize: '0.8rem'
  }}>
    {name}
  </Typography>

  <Box sx={{flexGrow: 1}}/>

  {children}
</Box>;
