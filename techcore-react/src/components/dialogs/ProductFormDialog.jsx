import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { useComponents } from '../../hooks/useComponents.js';
import { useComputers } from '../../hooks/useComputers.js';
import { COMPONENT_TYPES } from '../../models/Component.js';
import { Computer, COMPUTER_TYPES } from '../../models/Computer.js';
import { format_price, type_label } from '../../utils/format.js';
import { ComponentPicker } from './ComponentPicker.jsx';

/** '' / 'abc' -> NaN, '12.5' -> 12.5. Never Number('') (that is 0). */
const to_number = (text) => (String(text).trim() === '' ? Number.NaN : Number(text));

function initial_fields(mode, item) {
  if (item) {
    return {
      name: item.name, description: item.description ?? '', type: item.type,
      price: String(item.price), stock: String(item.stock), url: item.url ?? '',
    };
  }
  return {
    name: '', description: '', type: mode === 'components' ? COMPONENT_TYPES[0] : COMPUTER_TYPES[0],
    price: '', stock: mode === 'computers' ? '1' : '0', url: '',
  };
}

/** Field-level validation (friendly messages). The models / api validate again on save. */
function validate(mode, is_edit, fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = 'Name is required';

  const stock = to_number(fields.stock);
  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number, 0 or more';
  if (mode === 'computers' && !is_edit && stock < 1) errors.stock = 'Build at least 1 unit';

  const price = to_number(fields.price);
  const price_optional = mode === 'computers' && !is_edit; // defaults to the sum of the parts
  if (!(price_optional && fields.price.trim() === '') && (Number.isNaN(price) || price < 0)) {
    errors.price = 'Price must be a number, 0 or more';
  }
  return errors;
}

/**
 * Create / edit a component or a computer.
 *   open     boolean
 *   mode     'components' | 'computers'
 *   item     the plain object to edit, or null to create
 *   onClose  () => void   (called after saving too)
 * The body is mounted only while the dialog is open, so every opening starts from a clean form.
 */
export function ProductFormDialog({ open, mode, item = null, onClose }) {
  // Keep the last mode / item so the content does not change while the dialog fades out
  // (the page may clear `item` right when it closes).
  const [last, setLast] = useState({ mode, item });
  if (open && (last.mode !== mode || last.item !== item)) setLast({ mode, item });
  const shown = open ? { mode, item } : last;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={shown.mode === 'computers' && !shown.item ? 'md' : 'sm'} scroll="paper">
      <ProductForm mode={shown.mode} item={shown.item} onClose={onClose} />
    </Dialog>
  );
}

function ProductForm({ mode, item, onClose }) {
  const is_edit = item !== null;
  const is_computer = mode === 'computers';

  const { components, create: create_component, update: update_component } = useComponents();
  const { build_computer, update: update_computer } = useComputers();

  const [fields, set_fields] = useState(() => initial_fields(mode, item));
  const [selected, set_selected] = useState({}); // { [component type]: component id }
  const [touched, set_touched] = useState(false);
  const [saving, set_saving] = useState(false);
  const [error, set_error] = useState(null);

  const set_field = (name) => (event) => set_fields((current) => ({ ...current, [name]: event.target.value }));
  const errors = touched ? validate(mode, is_edit, fields) : {};

  // --- computers / create: live view of the chosen parts ---
  const chosen = useMemo(
    () => Object.values(selected).map((id) => components.find((c) => c.id === id)).filter(Boolean),
    [selected, components],
  );
  const units = Number.isInteger(to_number(fields.stock)) ? to_number(fields.stock) : 0;
  const missing = is_computer && !is_edit ? Computer.check_components(chosen, fields.type) : [];
  const short = chosen.filter((c) => c.stock < units);
  const parts_total = chosen.reduce((sum, c) => sum + c.price, 0);
  const description = is_computer && !is_edit ? Computer.build_description(chosen) : fields.description;

  const blocked = is_computer && !is_edit && (missing.length > 0 || short.length > 0);

  async function submit(event) {
    event.preventDefault();
    set_touched(true);
    set_error(null);
    if (Object.keys(validate(mode, is_edit, fields)).length > 0 || blocked) return;

    set_saving(true);
    try {
      const common = { name: fields.name.trim(), url: fields.url.trim(), stock: to_number(fields.stock) };
      const price = to_number(fields.price);
      if (is_computer) {
        if (is_edit) {
          await update_computer(item.id, { ...common, price }); // type and parts stay as built
        } else {
          const data = { ...common, type: fields.type };
          if (!Number.isNaN(price)) data.price = price; // otherwise: sum of the parts
          await build_computer(data, chosen.map((c) => c.id));
        }
      } else {
        const data = { ...common, description: fields.description, price, type: fields.type };
        if (is_edit) await update_component(item.id, data);
        else await create_component(data);
      }
      onClose();
    } catch (caught) {
      set_error(caught.message || 'Could not save');
      set_saving(false);
    }
  }

  const title = `${is_edit ? 'Edit' : 'Create'} ${is_computer ? 'computer' : 'component'}`;
  const type_options = is_computer ? COMPUTER_TYPES : COMPONENT_TYPES;

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: 'contents' }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' } }}>
            <TextField
              label="Name" required autoFocus value={fields.name} onChange={set_field('name')}
              error={Boolean(errors.name)} helperText={errors.name} disabled={saving}
            />
            <TextField
              select label="Type" value={fields.type} onChange={set_field('type')}
              disabled={saving || (is_computer && is_edit)}
              helperText={is_computer && is_edit ? 'Locked: parts were chosen for this type' : undefined}
            >
              {type_options.map((type) => <MenuItem key={type} value={type}>{type_label(type)}</MenuItem>)}
            </TextField>
          </Box>

          {!is_computer && (
            <TextField
              label="Description" multiline minRows={2} value={fields.description}
              onChange={set_field('description')} disabled={saving}
            />
          )}

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              label={is_computer ? 'Price' : 'Cost'} type="number" value={fields.price} onChange={set_field('price')}
              required={!is_computer || is_edit}
              slotProps={{ htmlInput: { min: 0, step: '0.01' }, input: { startAdornment: <span>$&nbsp;</span> } }}
              error={Boolean(errors.price)} disabled={saving}
              helperText={errors.price ?? (is_computer && !is_edit
                ? `Leave empty to use the sum of the parts (${format_price(parts_total)})`
                : undefined)}
            />
            <TextField
              label={is_computer && !is_edit ? 'Units to build' : 'Stock'} type="number" required
              value={fields.stock} onChange={set_field('stock')}
              slotProps={{ htmlInput: { min: is_computer && !is_edit ? 1 : 0, step: 1 } }}
              error={Boolean(errors.stock)} disabled={saving}
              helperText={errors.stock ?? (is_computer && !is_edit ? 'Each unit uses one of every chosen part' : undefined)}
            />
          </Box>

          <TextField label="Image URL" value={fields.url} onChange={set_field('url')} disabled={saving} />

          {is_computer && !is_edit && (
            <>
              <Typography variant="subtitle2">Parts</Typography>
              <ComponentPicker
                components={components} computer_type={fields.type} selected={selected}
                onChange={set_selected} units={units} disabled={saving}
              />
              {missing.length > 0 && (
                <Alert severity="warning">Missing: {missing.join(', ')}</Alert>
              )}
            </>
          )}

          {is_computer && is_edit && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Parts (read-only)</Typography>
              <Stack direction="row" useFlexGap spacing={1} flexWrap="wrap">
                {item.components.map((part) => (
                  <Chip key={part.id} size="small" label={`${type_label(part.type)}: ${part.name}`} />
                ))}
              </Stack>
            </Box>
          )}

          {is_computer && (
            <TextField
              label="Description" value={description} multiline minRows={2}
              helperText="Generated from the parts" slotProps={{ input: { readOnly: true } }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving || blocked}>
          {saving ? 'Saving…' : is_edit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Box>
  );
}
