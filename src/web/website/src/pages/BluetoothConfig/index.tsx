import { Box } from '@mui/material';

import ButtonsBluetooth from '../../bluetooth/buttons';
import DefaultNavbar from '../../examples/Navbars/DefaultNavbar';
import routes from '../../routes';

export const BluetoothConfig = () => {
  return <Box sx={{
    mt: 2,
  }}>
    <DefaultNavbar
      routes={routes}
      relative
    />

    <ButtonsBluetooth/>
  </Box>;
};
