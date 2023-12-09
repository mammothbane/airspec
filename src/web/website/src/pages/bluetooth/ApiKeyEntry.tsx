import {useAirspecsDispatch, useAirspecsSelector} from "../../store";
import {Box, Switch, TextField, Typography} from "@mui/material";
import {selectApiKey, selectStreaming, set_api_key, set_streaming} from "./slice";

export const ApiKeyEntry = () => {
  const streaming = useAirspecsSelector(selectStreaming);
  const apiKey = useAirspecsSelector(selectApiKey);

  const dispatch = useAirspecsDispatch();

  return <Box sx={{
    display: 'flex',
    flexDirection: 'row',
    mt: 2,
  }}>
    <Typography variant={'subtitle1'}>
      Stream to server
    </Typography>

    <Switch checked={streaming} onChange={(_evt, value) => dispatch(set_streaming(value))}/>

    <TextField
      value={apiKey}
      placeholder={'api key'}
      type={'password'}
      onChange={(evt) => dispatch(set_api_key(evt.currentTarget.value))}
    />
  </Box>;
};
