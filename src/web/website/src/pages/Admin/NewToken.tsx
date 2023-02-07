import { useState } from 'react';

import {
  Button, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
} from '@mui/material';
import Switch from '@mui/material/Switch';

import { UserData } from './index';

export type Props = {
  onCreate: (data: UserData) => void,
  onClose?: () => void,
};

export const NewToken = ({
  onCreate,
  onClose = () => {},
}: Props) => {
  const [name, setName] = useState<null | string>(null);
  const [active, setActive] = useState(true);
  const [doesExpire, setDoesExpire] = useState(false);
  const [expiration, setExpiration] = useState<Date>(new Date(Date.now() + 90 * 24 * 3600 * 1000));

  return <Dialog open={true} onClose={onClose}>
    <DialogTitle>New Token</DialogTitle>

    <DialogContent>
      <FormGroup>
        <TextField
          error={name == null}
          label={'name'}
          variant={'outlined'}
          onChange={evt => setName(evt.target.value === "" ? null : evt.target.value)}
          onKeyDown={evt => {
            if (evt.key !== 'Enter') return;

          }}
          inputRef={input => input?.focus()}
          sx={{
            mt: 1
          }}
        />

        <FormControlLabel label="active" control={
          <Switch checked={active} onChange={evt => setActive(evt.target.checked)}/>
        }/>

        <FormControlLabel label="expires" control={
          <Switch checked={doesExpire} onChange={evt => setDoesExpire(evt.target.checked)}/>
        }/>

        { doesExpire ?
          <TextField
            label="expiration"
            type="date"
            value={expiration.toISOString().slice(0, "yyyy-mm-dd".length)}
            onChange={(evt) => {
              setExpiration(new Date(evt.target.value))
            }}
            sx={{
              width: 250,
              mt: 1,
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          : undefined
        }
      </FormGroup>
    </DialogContent>

    <DialogActions>
      <Button
        disabled={name === null || name === ''}
        onClick={() => {
          const info: UserData = {
            name: name!,
            active: active,
            expiration: doesExpire ? +(expiration.valueOf() * 1000000) : null
          };

          onCreate(info);
      }}>
        Create
      </Button>
    </DialogActions>
  </Dialog>

}
