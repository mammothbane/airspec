import { Box, Button, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import _ from 'lodash';

export const BACKEND = window.location.href.startsWith('https://')
  ? '/api'
  : 'http://localhost:8080';

const commonHeaders = ({ adminKey }: {
  adminKey: string,
}) => ({
  Authorization: `Bearer ${adminKey}`
});

const debouncedFetchKeys = _.debounce((adminKey: string, setKeys: (keys: string[]) => void) => {
  const doFetch = async () => {
    try {
      const resp = await fetch(`${BACKEND}/admin/auth_token`, {
        headers: commonHeaders({ adminKey }),
      });

      if (resp.status < 200 || resp.status >= 300) {
        console.error({ status: resp.status, body: await resp.text() }, 'error retrieving auth keys');
        return
      }

      const body = await resp.json();

      if (body == null || !Array.isArray(body)) {
        console.warn({ body }, 'body of wrong type');
      } else {
        setKeys(body);
        console.debug({ keys: body }, 'set new auth keys');
      }
    } catch (err) {
      console.error({ err }, "updating auth tokens");
    }
  };

  const _ = doFetch();
}, 1000)

export const Admin = () => {
  const [adminKey, setAdminKey] = useState("");
  const [keys, setKeys] = useState<any[]>([]);

  useEffect(() => debouncedFetchKeys(adminKey, setKeys), [adminKey]);
  useEffect(debouncedFetchKeys.cancel, []);

  return <>
    <Box sx={{
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{
        alignItems: 'start',
        justifyContent: 'start',
        display: 'flex',
        flexDirection: 'column',
        background: '#e9e9e9',
        p: 4,
        borderRadius: 2,
        minWidth: 640,
      }}>
        <Typography variant={'h1'} sx={{mb: 4}}>
          Admin
        </Typography>

        <TextField
          label={"your admin key"}
          variant={"outlined"}
          value={adminKey}
          onChange={(evt) => {
            const value = evt.target.value;
            if (value == null) return;

            setAdminKey(value);
          }}
        />

        {
          keys.map(key => {
            return <Box>
              <Typography>
                {key.owner_name}
              </Typography>

              <Button onClick={async () => {
                await fetch(
                  `${BACKEND}/auth_token/${key.id}`,
                  {
                    method: 'DELETE',
                    headers: commonHeaders({ adminKey }),
                  }
                );
              }}/>
            </Box>
          })
        }
      </Box>
    </Box>
  </>;
}
