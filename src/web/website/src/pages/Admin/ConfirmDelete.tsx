import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { ReactElement } from 'react';

type Props = {
  title: string,
  content?: ReactElement<any, any>,
  onConfirm: () => Promise<void>,
  onCancel: () => Promise<void>,
};

export const ConfirmDelete = ({
  title,
  content = <Typography>Are you sure?</Typography>,
  onConfirm,
  onCancel,
}: Props) => {
  return <Dialog open={true} onClose={onCancel}>
    <DialogTitle>
      {title}
    </DialogTitle>

    <DialogContent>
      {content}
    </DialogContent>

    <DialogActions sx={{
      py: 1
    }}>
      <Button onClick={onCancel}>
        Cancel
      </Button>

      <Button onClick={onConfirm}>
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
};
