import {AirSpecConfigPacket} from "../../../../../../proto/message.proto";
import {RootState, useAirspecsSelector} from "../../store";
import _ from "lodash";
import {Button} from "@mui/material";
import {createSelector} from "@reduxjs/toolkit";


const selectBtConfig = (state: RootState) => state.bluetooth.config;
const selectReqState = (state: RootState) => state.bluetooth.requested_state_changes;

const selectTargetNewConfig = createSelector(
  [selectBtConfig, selectReqState],
  (bt, req) => _.merge({}, bt, req)

);

export const WriteConfigButton = ({
                                    sendMessage
                                  }: {
  sendMessage: (pkt: AirSpecConfigPacket) => Promise<void>
}) => {
  const targetNewConfig = useAirspecsSelector(selectTargetNewConfig);

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
