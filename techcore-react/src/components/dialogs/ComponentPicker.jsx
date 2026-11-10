import { useMemo } from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { COMPONENT_TYPES } from '../../models/Component.js';
import { Computer } from '../../models/Computer.js';
import { format_price, type_label } from '../../utils/format.js';

const NONE = '';

/**
 * Parts picker for a NEW computer: one select per component type (a computer has one part of each type).
 * Controlled: `selected` is a { [type]: componentId } map; `onChange` receives the next map.
 *
 * components: catalog components (plain objects)   computer_type: 'gaming' | 'office'
 * units: how many computers will be built (a part needs `units` of stock)
 */
export function ComponentPicker({ components, computer_type, selected, onChange, units = 1, disabled = false }) {
  const by_type = useMemo(
    () => Object.fromEntries(COMPONENT_TYPES.map((type) => [type, components.filter((c) => c.type === type)])),
    [components],
  );

  // Types that are part of a required group for this computer type (ssd / hdd are alternatives).
  const required = useMemo(
    () => new Set(Computer.check_components([], computer_type).flatMap((group) => group.split('/'))),
    [computer_type],
  );

  const choose = (type, id) => onChange({ ...selected, [type]: id });

  return (
    <Box
      sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}
      role="group"
      aria-label="Components of the computer"
    >
      {COMPONENT_TYPES.map((type) => {
        const options = by_type[type];
        const chosen = options.find((c) => c.id === selected[type]);
        const short = chosen && chosen.stock < units;
        const is_required = required.has(type);
        const alternative = type === 'ssd' || type === 'hdd';
        return (
          <TextField
            key={type}
            select
            size="small"
            label={`${type_label(type)}${is_required ? (alternative ? ' (SSD or HDD)' : '') : ' (optional)'}`}
            required={is_required && !alternative}
            value={chosen ? chosen.id : NONE}
            onChange={(event) => choose(type, event.target.value)}
            disabled={disabled || options.length === 0}
            error={Boolean(short)}
            helperText={
              options.length === 0
                ? 'No components of this type in the catalog'
                : short
                  ? `Only ${chosen.stock} in stock, ${units} needed`
                  : undefined
            }
          >
            <MenuItem value={NONE}><em>None</em></MenuItem>
            {options.map((c) => (
              <MenuItem key={c.id} value={c.id} disabled={c.stock === 0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%' }}>
                  <span>{c.name}</span>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {format_price(c.price, { decimals: 0 })} · {c.stock} u.
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        );
      })}
    </Box>
  );
}
