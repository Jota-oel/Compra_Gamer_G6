import { MenuItem, Stack, TextField } from '@mui/material';
import { type_label } from '../../utils/format.js';

/**
 * Controlled filters: the page owns the state.
 * value: { type: 'all' | <type>, text: string }   onChange(next_value)
 * types: ['processor', 'gpu', ...]   label: 'component' | 'computer'
 */
export default function CatalogFilters({ value, onChange, types, label = 'component' }) {
  return (
    <Stack spacing={2}>
      <TextField
        label={`Search ${label}s`}
        type="search"
        size="small"
        value={value.text}
        onChange={(event) => onChange({ ...value, text: event.target.value })}
        placeholder={`Search ${label}s...`}
        fullWidth
      />
      <TextField
        select
        size="small"
        label={`${label[0].toUpperCase()}${label.slice(1)} type`}
        value={value.type}
        onChange={(event) => onChange({ ...value, type: event.target.value })}
        fullWidth
      >
        <MenuItem value="all">All {label}s</MenuItem>
        {types.map((type) => (
          <MenuItem key={type} value={type}>{type_label(type)}</MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
