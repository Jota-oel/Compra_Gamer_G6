import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { useComponents } from '../hooks/useComponents.js';
import { useComputers } from '../hooks/useComputers.js';
import { value_total } from '../utils/filters.js';
import { format_price } from '../utils/format.js';

/** PLACEHOLDER (proves the data flow). Dev B builds the real Catalog (tabs, filters, tables). */
export default function Catalog() {
  const { components, loading: loading_components, error: components_error } = useComponents();
  const { computers, loading: loading_computers, error: computers_error } = useComputers();

  if (loading_components || loading_computers) return <CircularProgress />;
  const error = components_error ?? computers_error;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Stack spacing={1}>
      <Typography variant="h4">Catalog (placeholder)</Typography>
      <Typography>{components.length} components, total value {format_price(value_total(components), { decimals: 0 })}</Typography>
      <Typography>{computers.length} computers, total value {format_price(value_total(computers), { decimals: 0 })}</Typography>
    </Stack>
  );
}
