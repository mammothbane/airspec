import { Box } from '@mui/material';
import Container from '@mui/material/Container';
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

    <Container sx={{
      pt: 4,
    }}>
      <ButtonsBluetooth/>
    </Container>
  </Box>;
}
