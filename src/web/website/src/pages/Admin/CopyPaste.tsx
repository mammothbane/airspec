import { ContentCopy } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { ReactElement } from 'react';

type Props = {
  show: string | null,
  title: string,
  preContent?: ReactElement<any, any>,
  onClose?: () => void,
};

export const CopyPaste = ({
  show,
  title,
  preContent,
  onClose = () => {},
}: Props) => {
  return <Dialog open={show != null}>
  <DialogTitle>
    {title}
  </DialogTitle>

  <DialogContent>
    {preContent}

    <Box sx={{
      fontFamily: 'Monospace',
      maxWidth: '100%',
      display: 'flex',
    }}>
      <Typography noWrap sx={{
      }}>
        {show}
      </Typography>

      <Button onClick={async () => {
        await navigator.clipboard.writeText(show!);
      }}>
        <ContentCopy/>
      </Button>
    </Box>
  </DialogContent>

  <DialogActions sx={{
    py: 1
  }}>
    <Button onClick={onClose}>
      Close
    </Button>
  </DialogActions>
</Dialog>
};
