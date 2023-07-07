import { Box } from '@mui/material';
import DefaultNavbar from '../../components/DefaultNavbar';

import { BluetoothControl } from './BluetoothControl';
import routes from '../../routes';

export const BluetoothConfig = () => {
  return <Box sx={{
    mt: 2,
  }}>
    <DefaultNavbar
      routes={routes}
      relative
    />

    <BluetoothControl/>
  </Box>;
};
