import AddIcon from '@mui/icons-material/Add';

import { Box, Button, List, TextField, Typography } from '@mui/material';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import DefaultNavbar from '../../components/DefaultNavbar';
import routes from '../../routes';
import { ConfirmDelete } from './ConfirmDelete';

import { CopyPaste } from './CopyPaste';
import { NewToken } from './NewToken';
import { TokenRow } from './TokenRow';

export const BACKEND = window.location.href.startsWith('https://')
  ? 'https://api.airspecs.resenv.org'
  : 'http://localhost:8080';

enum Success {
  Yes,
  No,
  Pending,
}

export type UserData = {
  name: string,
  active: boolean,
  expiration: number | null,
}

export type UserInfo = UserData & {
  id: number,
  issued_ns: number,
  issued_by_admin: number,
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

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [currentDelete, setCurrentDelete] = useState<number | null>(null);

  useEffect(() => {
    setSuccess(Success.Pending);
    debouncedFetchKeys(adminKey, setKeys, setSuccess)
  }, [adminKey]);

  useEffect(() => {
    debouncedFetchKeys.flush();
  }, []);

  return <>
    <Box sx={{
      my: 2,
      mx: 1,
    }}>
      <DefaultNavbar
        routes={routes}
        relative
      />
    </Box>

    <Box sx={{
      alignItems: 'center',
      justifyContent: 'start',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      p: 3,
      maxWidth: '100%',
    }}>
      <Box sx={{
        maxWidth: '450px',
        alignItems: 'start',
        justifyContent: 'start',
        display: 'flex',
        flexDirection: 'column',
        background: '#e9e9e9',
        p: 2,
        width: '100%',
        borderRadius: 2,
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

          type={'password'}

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
                  .map(key => <TokenRow
                    key={key.id}
                    info={key}
                    deleteToken={async (id) => {
                      setCurrentDelete(id);
                    }}
                    toggleEnabled={async () => {
                      await fetch(
                        `${BACKEND}/admin/auth_token/${key.id}?enable=${!key.active}`,
                        {
                          method: 'POST',
                          headers: commonHeaders({adminKey}),
                        }
                      );
                    }}
                    refresh={async () => {
                      await doFetch(adminKey, setKeys, setSuccess);
                    }}
                  />)
              }
            </List>
          </>
          : undefined
        }
      </Box>
    </Box>

    { dialogOpen ?
      <NewToken
        onClose={() => setDialogOpen(false)}
        onCreate={(data ) => {
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
                body: JSON.stringify(data),
              }
            );

            if (!result.ok) throw new Error('unable to create new token');

            const key = await result.text();

            await doFetch(adminKey, setKeys, setSuccess);
            setDialogOpen(false);

            setCurrentToken(key);
          });
        }}
      />
      : undefined
    }

    { currentDelete != null
      ? <ConfirmDelete
        title={`deleting token ${currentDelete}`}
        onConfirm={async () => {
          await fetch(
            `${BACKEND}/admin/auth_token/${currentDelete}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                ...commonHeaders({ adminKey })
              },
            }
          );

          await doFetch(adminKey, setKeys, setSuccess);
          setCurrentDelete(null);
        }}
        onCancel={async () => {
          setCurrentDelete(null);
        }}
      />
      : undefined
    }

    <CopyPaste
      preContent={<>
        <Typography variant={'body2'} sx={{mb: 2}}>
          This is the only time you will have access to this token. Please copy it and store it
          somewhere before closing this dialog.
        </Typography>
      </>}
      show={currentToken}
      title={'New Token'}
      onClose={() => setCurrentToken(null)}
    />
  </>;
}

