import {useAirSpecInterface} from "./hooks";
import {useAirspecsDispatch, useAirspecsSelector} from "../../store";
import {useState} from "react";
import {Box, Button, FormControlLabel, Typography} from "@mui/material";
import {register_glasses_id, set_show_graphs} from "./slice";
import {ALL_SENSOR_TYPES} from "./types";
import {debug_led} from "./debug";
import {AirSpecConfigPacket} from "../../../../../../proto/message.proto";
import {sendEnable} from "./util";
import Switch from "@mui/material/Switch";

type ButtonBarProps = {
  bt: ReturnType<typeof useAirSpecInterface>,
};
export const ButtonBar = (
  {
    bt
  }: ButtonBarProps
) => {
  const {
    gatt,
    sendMessage,
    selectDevice,
    deselect,
  } = bt;
  const dispatch = useAirspecsDispatch();
  const show_graphs = useAirspecsSelector(state => state.bluetooth.show_graphs);

  const [ledEnabled, setLedEnabled] = useState(false);

  return <Box sx={{
    alignItems: 'baseline',
    display: 'flex',
  }}>
    {gatt?.connected ?
      <Box>
        <Typography variant={'body2'}>
          {gatt.device.name?.replace(/^AirSpec_/, '') ?? 'no name'}
        </Typography>
      </Box>
      : undefined}

    <Button
      onClick={
        async () => {
          if (gatt?.connected ?? false) await deselect();
          else {
            const id = await selectDevice();
            dispatch(register_glasses_id(id));
          }
        }
      }
      variant="contained"
      color="primary"
      sx={{
        mx: 1,
      }}
    >
      {(gatt?.connected ?? false) ? 'Disconnect' : 'Connect'}
    </Button>

    <Button
      onClick={
        async () => {
          await sendEnable(ALL_SENSOR_TYPES, sendMessage);
        }
      }
      variant="contained"
      color="primary"
      sx={{
        mx: 1,
      }}
    >
      Enable All
    </Button>

    <Button
      onClick={
        async () => {
          await sendEnable(new Set(), sendMessage);
        }
      }
      variant="contained"
      color="primary"
      sx={{
        mx: 1,
        color: 'white',
      }}
    >
      Disable All
    </Button>

    <Button
      onClick={
        async () => {
          await sendMessage(debug_led(ledEnabled));
          setLedEnabled(!ledEnabled);
        }
      }
      variant="contained"
      color="primary"
      sx={{
        mx: 1,
      }}
    >
      LED Test
    </Button>

    <Button
      onClick={
        async () => {
          if (gatt?.connected ?? false) {
            await sendMessage(new AirSpecConfigPacket({
              header: {
                timestampUnix: Date.now(),
              },
              payload: 'dfuMode',
              dfuMode: {
                enable: true,
              },
            }));
          }
        }
      }
      variant="contained"
      color="primary"
      sx={{
        mx: 1,
      }}
    >
      Enter DFU Mode
    </Button>

    <Typography variant={'body1'} noWrap sx={{
      fontSize: '1rem',
      ml: 2,
    }}>
      show live graphs (cpu-intensive)
    </Typography>

    <Switch onChange={(_evt, checked) => dispatch(set_show_graphs(checked))} checked={show_graphs}/>
  </Box>
};
