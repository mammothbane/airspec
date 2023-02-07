import { Box, Button, ListItem, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { UserInfo } from './index';

export type Props = {
  info: UserInfo,
  toggleEnabled: () => Promise<void>,
  refresh?: () => Promise<void>,
};
export const TokenRow = ({
  info,
  toggleEnabled,
  refresh = async () => {},
}: Props) => {
  let expirationDate: Date | null = null;

  if (info.expiration != null) {
    expirationDate = new Date(info.expiration / 1000000);
  }

  const isExpired = expirationDate !== null && expirationDate.valueOf() < Date.now();

  return <ListItem sx={{
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
        {info.name}
      </Typography>
    </Box>

    <Stack direction={'row'} spacing={2} sx={{
      width: '100%',
      alignItems: 'baseline',
    }}>
      <Typography variant={'subtitle1'} color={'gray'}>
        {info.id}
      </Typography>

      <Button sx={{
        color: info.active ? 'green !important' : 'red !important',
      }} onClick={async () => {
        await toggleEnabled();
        await refresh();
      }}>
        {info.active ? 'active' : 'inactive'}
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
  </ListItem>;
};
