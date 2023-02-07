import { ContentCopy } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent, DialogTitle, FormControlLabel, FormGroup,
  List,
  ListItem,
  TextField, ScopedCssBaseline,
  Typography,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import _ from 'lodash';

export const BACKEND = window.location.href.startsWith('https://')
  ? '/api'
  : 'http://localhost:8080';

enum Success {
  Yes,
  No,
  Pending,
}

type UserInfo = {
  name: string,
  id: number,
  active: boolean,
  issued_ns: number,
  issued_by_admin: number,
  expiration: number | null,
};

const commonHeaders = ({ adminKey }: {
  adminKey: string,
}) => ({
  Authorization: `Bearer ${adminKey}`
});

const doFetch = async (adminKey: string, setKeys: (keys: UserInfo[]) => void, setSuccess: (success: Success) => void) => {
  if (adminKey === "") return;

  try {
    const resp = await fetch(`${BACKEND}/admin/auth_token`, {
      headers: commonHeaders({ adminKey }),
    });

    if (resp.status < 200 || resp.status >= 300) {
      console.error({ status: resp.status, body: await resp.text() }, 'error retrieving auth keys');
      setSuccess(Success.No);
      return;
    }

    const body = await resp.json();

    if (body == null || !Array.isArray(body)) {
      console.warn({ body }, 'body of wrong type');
    } else {
      setKeys(body);
      console.debug({ keys: body }, 'set new auth keys');
      setSuccess(Success.Yes);
    }
  } catch (err) {
    setSuccess(Success.No);
    console.error({ err }, "updating auth tokens");
  }
};

const debouncedFetchKeys: _.DebouncedFunc<typeof doFetch> = _.debounce((...params: Parameters<typeof doFetch>) => {
  const _ = doFetch(...params);
}, 400) as any;

const createTokenThrottled = _.throttle((f: () => void) => f(), 2500);

export const Admin = () => {
  const [adminKey, setAdminKey] = useState("");
  const [keys, setKeys] = useState<UserInfo[]>([]);
  const [success, setSuccess] = useState(Success.Pending);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState<null | string>(null);
  const [newTokenActive, setNewTokenActive] = useState(true);
  const [newTokenExpires, setNewTokenExpires] = useState(false);
  const [newTokenExpiration, setNewTokenExpiration] = useState<Date>(new Date(Date.now() + 90 * 24 * 3600 * 1000));

  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    setSuccess(Success.Pending);
    debouncedFetchKeys(adminKey, setKeys, setSuccess)
  }, [adminKey]);
  useEffect(debouncedFetchKeys.cancel, []);

  return <>
    <Box sx={{
      alignItems: 'center',
      justifyContent: 'start',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      p: 8,
      maxWidth: '100%',
    }}>
      <Box sx={{
        maxWidth: '100%',
        alignItems: 'start',
        justifyContent: 'start',
        display: 'flex',
        flexDirection: 'column',
        background: '#e9e9e9',
        p: 4,
        borderRadius: 2,
        minWidth: 480,
      }}>
        <Typography variant={'h1'} sx={{mb: 4}}>
          Admin
        </Typography>

        <TextField
          label={"admin token"}
          variant={"outlined"}
          value={adminKey}
          onChange={(evt) => {
            const value = evt.target.value;
            if (value == null) return;

            setAdminKey(value);
          }}

          error={success === Success.No}

          sx={{
            borderColor: 'black',
            '& input:invalid + fieldset': {
              borderColor: 'red',
            }
          }}
        />

        {success === Success.Yes ? <>
          <Box sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            mt: 3,
          }}>
            <Typography variant={'h2'}>Tokens</Typography>

            <Box sx={{
              flexGrow: 1,
            }}/>

            <Button variant={'contained'} onClick={() => setDialogOpen(true)} sx={{
              height: 32,
            }}>
              <AddIcon sx={{
                fontSize: 'large',
                color: 'white !important',
              }}/>
            </Button>
          </Box>

          <List sx={{
            width: '100%',
          }}>
            {
              keys
                .sort((a, b) => a.id - b.id)
                .map(key => {
                  let expirationDate: Date | null = null;

                  if (key.expiration != null) {
                    expirationDate = new Date(key.expiration / 1000000);
                  }

                  const isExpired = expirationDate !== null && expirationDate.valueOf() < Date.now();

                  return <ListItem key={key.id} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    px: 3,
                    my: 2,
                    background: '#fffdfc',
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: '100%',
                  }}>
                    <Box sx={{
                      display: 'flex',
                      width: '100%',
                      maxWidth: '100%',
                      alignItems: 'baseline',
                    }}>
                      <Typography variant={'h3'} noWrap sx={{
                        maxWidth: '100%',
                        width: 0,
                        flexGrow: 1,
                      }}>
                        {key.name}
                      </Typography>
                    </Box>

                    <Stack direction={"row"} spacing={2} sx={{
                      width: '100%',
                      alignItems: 'baseline',
                    }}>
                      <Typography variant={"subtitle1"} color={'gray'}>
                        {key.id}
                      </Typography>

                      <Button sx={{
                        color: key.active ? 'green !important' : 'red !important'
                      }} onClick={async () => {
                        await fetch(
                          `${BACKEND}/admin/auth_token/${key.id}?enable=${!key.active}`,
                          {
                            method: 'POST',
                            headers: commonHeaders({adminKey}),
                          }
                        );
                        // lklk

                        await doFetch(adminKey, setKeys, setSuccess);
                      }}>
                        {key.active ? 'active' : 'inactive'}
                      </Button>

                      {(!isExpired && expirationDate != null) ?
                        <Typography variant={'subtitle2'} color={'gray'}>
                          expires {expirationDate.toLocaleString()}
                        </Typography>
                        : undefined
                      }

                      {isExpired ?
                        <Typography variant={'h5'} color={'red'}>
                          expired
                        </Typography>
                        : undefined
                      }

                    </Stack>
                  </ListItem>
                })
            }
          </List>
          </>
          : undefined
        }
      </Box>
    </Box>

    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>New Token</DialogTitle>

      <DialogContent>
        <FormGroup>
          <TextField error={newTokenName == null} label={'name'} variant={'outlined'} onChange={evt => setNewTokenName(evt.target.value === "" ? null : evt.target.value)}/>
          <FormControlLabel label="active" control={
            <Switch checked={newTokenActive} onChange={evt => setNewTokenActive(evt.target.checked)}/>
          }/>

          <FormControlLabel label="expires" control={
            <Switch checked={newTokenExpires} onChange={evt => setNewTokenExpires(evt.target.checked)}/>
          }/>

          { newTokenExpires ?
            <TextField
              label="expiration"
              type="date"
              value={newTokenExpiration.toISOString().slice(0, 10)} // "yyyy-mm-dd".length == 10
              onChange={(evt) => {
                setNewTokenExpiration(new Date(evt.target.value))
              }}
              sx={{ width: 250 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            : undefined
          }
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => {
          createTokenThrottled.cancel();

          createTokenThrottled(async () => {
            const result = await fetch(
              `${BACKEND}/admin/auth_token`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...commonHeaders({ adminKey })
                },
                body: JSON.stringify({
                  name: newTokenName,
                  active: newTokenActive,
                  expiration: newTokenExpires ? +(newTokenExpiration.valueOf() * 1000000) : null,
                })
              }
            );

            if (!result.ok) throw new Error('unable to create new token');

            const key = await result.text();

            await doFetch(adminKey, setKeys, setSuccess);
            setDialogOpen(false);

            setCurrentToken(key);
          });
        }}>
          Create
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={currentToken != null}>
      <DialogTitle>
        New Token
      </DialogTitle>

      <DialogContent>
        <Box sx={{
          fontFamily: 'Monospace',
          maxWidth: '100%',
          display: 'flex,'
        }}>
          <Typography noWrap sx={{

          }}>
            {currentToken}
          </Typography>

          <Button onClick={async () => {
            await navigator.clipboard.writeText(currentToken!);
          }}>
            <ContentCopy/>
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setCurrentToken(null)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>;
}
