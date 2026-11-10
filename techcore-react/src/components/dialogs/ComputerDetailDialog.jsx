import { useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, List, ListItem, ListItemText, Stack, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useCart } from '../../hooks/useCart.js';
import { useComputers } from '../../hooks/useComputers.js';
import { useNotify } from '../../hooks/useNotify.js';
import { format_price, type_label } from '../../utils/format.js';
import { QuantityInput } from '../ui/QuantityInput.jsx';

/**
 * Contract (do not change): { open, computer, onClose }.
 * `computer` is the plain object picked in Home (selected_computer). Stock is re-read from
 * useComputers() so the limits stay right after a checkout or an edit in the catalog.
 */
function DetailContent({ computer: selected, onClose }) {
  const { computers } = useComputers();
  const { lines, add } = useCart();
  const { notify } = useNotify();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const computer = computers.find((item) => item.id === selected.id) ?? selected;
  const in_cart = lines.find((line) => line.id === computer.id)?.quantity ?? 0;
  const remaining = Math.max(computer.stock - in_cart, 0); // what can still be added
  const can_add = remaining > 0;
  const safe_quantity = Math.min(quantity, Math.max(remaining, 1));

  const handle_add = () => {
    try {
      add(computer, safe_quantity); // throws if the quantity is invalid or above the stock
    } catch (failure) {
      setError(failure.message);
      return;
    }
    notify(`${computer.name} added to cart`, 'success');
    onClose();
  };

  return (
    <>
      <DialogTitle id="computer-detail-title" sx={{ pr: 7 }}>
        {computer.name}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ aspectRatio: '21 / 10', overflow: 'hidden', borderRadius: 1, bgcolor: 'action.hover' }}>
            {computer.url && (
              <Box
                component="img"
                src={computer.url}
                alt={computer.name}
                sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </Box>

          <Box>
            <Chip label={type_label(computer.type)} size="small" color="primary" variant="outlined" />
          </Box>

          <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {computer.description}
          </Typography>

          <Box>
            <Typography variant="subtitle2" component="h3">Included components</Typography>
            <List dense disablePadding>
              {(computer.components ?? []).map((component) => (
                <ListItem key={component.id} disableGutters divider>
                  <ListItemText primary={component.name} secondary={type_label(component.type)} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
            <Box>
              <Typography variant="caption" color="text.secondary">Price</Typography>
              <Typography variant="h5" component="p">{format_price(computer.price)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">Stock</Typography>
              <Typography color={computer.stock > 0 ? 'text.primary' : 'error'}>
                {computer.stock > 0 ? `${computer.stock} available` : 'Out of stock'}
              </Typography>
            </Box>
          </Stack>

          {computer.stock > 0 && !can_add && (
            <Alert severity="info">You already have all {computer.stock} available units in your cart.</Alert>
          )}
          {computer.stock > 0 && can_add && in_cart > 0 && (
            <Typography variant="body2" color="text.secondary">
              {in_cart} already in your cart. You can add up to {remaining} more.
            </Typography>
          )}

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">Quantity</Typography>
              <QuantityInput
                value={safe_quantity}
                min={1}
                max={remaining}
                disabled={!can_add}
                onChange={(next) => { setQuantity(next); setError(''); }}
              />
            </Stack>
            {can_add && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                <Typography variant="h6" component="p">{format_price(computer.price * safe_quantity)}</Typography>
              </Box>
            )}
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handle_add} disabled={!can_add}>
          {computer.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </Button>
      </DialogActions>
    </>
  );
}

export function ComputerDetailDialog({ open, computer, onClose }) {
  // Keep the last computer so the content does not vanish during the closing animation.
  const [last, setLast] = useState(computer);
  if (computer && computer !== last) setLast(computer);
  const shown = computer ?? last;

  return (
    <Dialog
      open={Boolean(open && shown)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      aria-labelledby="computer-detail-title"
    >
      {/* key: a new computer starts with quantity 1 and no error (content also remounts on every open) */}
      {shown && <DetailContent key={shown.id} computer={shown} onClose={onClose} />}
    </Dialog>
  );
}

export default ComputerDetailDialog;
