import {AirSpecConfigPacket} from "../../../../../../proto/message.proto";
import {useAirspecsSelector} from "../../store";
import _ from "lodash";
import {Button} from "@mui/material";

export const WriteConfigButton = ({
                                    sendMessage
                                  }: {
  sendMessage: (pkt: AirSpecConfigPacket) => Promise<void>
}) => {
  const targetNewConfig = useAirspecsSelector(state =>
    _.merge({}, state.bluetooth.config ?? {}, state.bluetooth.requested_state_changes)
  );

  return <Button onClick={async () => {
    console.debug('sending new config', {targetNewConfig});

    await sendMessage(new AirSpecConfigPacket({
      header: {
        timestampUnix: Date.now(),
      },
      payload: 'sensorConfig',
      sensorConfig: targetNewConfig,
    }));
  }}>
    Write Config
  </Button>
};
