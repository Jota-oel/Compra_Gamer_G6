import { useState } from 'react';
import { IconButton, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

/**
 * Quantity selector with limits. Controlled: the parent owns `value`.
 *   <QuantityInput value={quantity} min={1} max={computer.stock} onChange={setQuantity} />
 * - The buttons step by 1 and stop at min / max.
 * - Typing is free while the field has focus; the value is clamped to [min, max] on blur or Enter.
 * - If max < min (for example, no stock) the whole control is disabled.
 */
export function QuantityInput({ value, min = 1, max = Infinity, onChange, disabled = false, label = 'Quantity' }) {
  const [draft, setDraft] = useState(null); // text being typed; null = show `value`
  const blocked = disabled || max < min;
  const clamp = (number) => Math.min(Math.max(number, min), max);

  const change = (next) => {
    if (next !== value) onChange(next);
  };

  const step = (delta) => {
    setDraft(null);
    change(clamp(value + delta));
  };

  const commit = () => {
    if (draft === null) return;
    setDraft(null);
    if (draft !== '') change(clamp(Number(draft))); // empty text keeps the previous value
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <IconButton
        size="small"
        aria-label="Decrease quantity"
        onClick={() => step(-1)}
        disabled={blocked || value <= min}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <TextField
        size="small"
        value={draft ?? String(value)}
        disabled={blocked}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
        }}
        slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': label } }}
        sx={{ width: 72, '& input': { textAlign: 'center' } }}
      />
      <IconButton
        size="small"
        aria-label="Increase quantity"
        onClick={() => step(1)}
        disabled={blocked || value >= max}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

export default QuantityInput;
