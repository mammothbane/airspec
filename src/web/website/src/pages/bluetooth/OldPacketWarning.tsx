import {useAirspecsSelector} from "../../store";

import {selectOldPacketAgeMillis} from "./slice";
import {Alert, Snackbar} from "@mui/material";


export type Props = {
  display_period: number
};

export const OldPacketWarning = ({ display_period = 50 }: Partial<Props>) => {
  const oldPacketAge = useAirspecsSelector(selectOldPacketAgeMillis);
  const shouldShowWarning = oldPacketAge != null && oldPacketAge < display_period;

  return <Snackbar open={shouldShowWarning}>
    <Alert severity={"warning"}>
      Glasses time is desynced
    </Alert>
  </Snackbar>;
};
