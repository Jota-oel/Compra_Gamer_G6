import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format_price } from '../../utils/format.js';
import { QuantityInput } from '../ui/QuantityInput.jsx';

/**
 * One line of the cart. Presentational: CartDialog decides what to do with the events.
 * line: { id, name, price, url, quantity }   stock: current stock of that computer (undefined = unknown)
 */
export function CartLine({ line, stock, disabled = false, onQuantityChange, onRemove }) {
  return (
    <Paper component="li" variant="outlined" sx={{ p: 1.5, listStyle: 'none' }}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ width: 64, height: 64, flexShrink: 0, overflow: 'hidden', borderRadius: 1, bgcolor: 'action.hover' }}>
          {line.url && (
            <Box
              component="img"
              src={line.url}
              alt=""
              sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </Box>

        <Box sx={{ flex: '1 1 150px', minWidth: 0 }}>
          <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{line.name}</Typography>
          <Typography variant="body2" color="text.secondary">{format_price(line.price)} each</Typography>
        </Box>

        <QuantityInput
          value={line.quantity}
          min={1}
          max={stock ?? Infinity}
          disabled={disabled}
          label={`Quantity of ${line.name}`}
          onChange={(next) => onQuantityChange(line.id, next)}
        />

        <Typography fontWeight={700} sx={{ minWidth: 96, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {format_price(line.price * line.quantity)}
        </Typography>

        <IconButton
          aria-label={`Remove ${line.name} from cart`}
          onClick={() => onRemove(line.id)}
          disabled={disabled}
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default CartLine;
