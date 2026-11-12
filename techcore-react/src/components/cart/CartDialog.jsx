import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, LinearProgress, Stack, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { useComputers } from '../../hooks/useComputers.js';
import { useNotify } from '../../hooks/useNotify.js';
import { format_price } from '../../utils/format.js';
import { CartLine } from './CartLine.jsx';

/**
 * Contract (do not change): { open, onClose }.
 * Cart changes are synchronous and THROW on invalid input (see useCart): every action goes through
 * guard() so the message shows inside the dialog. Checkout is async and disables the buttons while it runs.
 */
export function CartDialog({ open, onClose }) {
  const theme = useTheme();
  const full_screen = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();
  const { lines, count, total, loading, set_quantity, remove, clear, checkout } = useCart();
  const { computers } = useComputers();
  const { notify } = useNotify();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const stock_of = (id) => computers.find((computer) => computer.id === id)?.stock;
  const locked = busy || loading;

  const guard = (action) => {
    try {
      action();
      setError('');
    } catch (failure) {
      setError(failure.message);
    }
  };

  const handle_close = () => {
    if (busy) return; // do not close in the middle of a checkout
    setError('');
    onClose();
  };

  const handle_checkout = async () => {
    setBusy(true);
    setError('');
    try {
      const order = await checkout();
      notify(`Order ${order.id} placed. Thank you!`, 'success');
      onClose();
    } catch (failure) {
      setError(failure.message); // e.g. "Not enough stock. TechCore Titan: only 2 available"
    } finally {
      setBusy(false);
    }
  };

  const is_empty = lines.length === 0;

  return (
    <Dialog
      open={open}
      onClose={handle_close}
      fullWidth
      maxWidth="md"
      fullScreen={full_screen}
      scroll="paper"
      aria-labelledby="cart-dialog-title"
    >
      <DialogTitle id="cart-dialog-title" sx={{ pr: 7 }}>
        Your cart{count > 0 ? ` (${count})` : ''}
        <IconButton
          aria-label="Close"
          onClick={handle_close}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {loading && <LinearProgress />}

      <DialogContent dividers>
        {is_empty ? (
          <Stack spacing={2} sx={{ alignItems: 'center', py: 6, textAlign: 'center' }}>
            <Typography variant="h6" component="p">Your cart is empty</Typography>
            <Typography color="text.secondary">
              Pick a computer from Gaming or Office and it will show up here.
            </Typography>
            <Button variant="outlined" onClick={handle_close}>Keep browsing</Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {!isAuthenticated && (
              <Alert
                severity="info"
                action={(
                  <Button color="inherit" size="small" component={RouterLink} to="/login" onClick={handle_close}>
                    Log in
                  </Button>
                )}
              >
                Log in to keep this cart for your next visit.
              </Alert>
            )}

            <Stack component="ul" spacing={1.5} sx={{ m: 0, p: 0 }}>
              {lines.map((line) => (
                <CartLine
                  key={line.id}
                  line={line}
                  stock={stock_of(line.id)}
                  disabled={locked}
                  onQuantityChange={(id, quantity) => guard(() => set_quantity(id, quantity))}
                  onRemove={(id) => guard(() => remove(id))}
                />
              ))}
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}
      </DialogContent>

      {!is_empty && (
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button color="inherit" onClick={() => guard(clear)} disabled={locked}>Clear cart</Button>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography>
              Total <strong>{format_price(total)}</strong>
            </Typography>
            <Button
              variant="contained"
              onClick={handle_checkout}
              disabled={locked}
              startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {busy ? 'Placing order…' : 'Checkout'}
            </Button>
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default CartDialog;
