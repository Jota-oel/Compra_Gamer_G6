import { Stack, Typography } from '@mui/material';

/** Shown when a list has no rows (e.g. filters without results). */
export default function EmptyState({ message = 'No products found.' }) {
  return (
    <Stack sx={{ alignItems: 'center', py: 6 }}>
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  );
}
