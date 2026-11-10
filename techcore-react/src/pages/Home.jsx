import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import { useComputers } from '../hooks/useComputers.js';
import { useFilteredList } from '../hooks/useFilteredList.js';

/**
 * PLACEHOLDER (proves the data flow). Dev A builds the real Home:
 * Hero + <ShowcaseSection type="gaming" /> + <ShowcaseSection type="office" />.
 */
export default function Home() {
  const { computers, loading, error } = useComputers();
  const gaming = useFilteredList(computers, { type: 'gaming' });
  const office = useFilteredList(computers, { type: 'office' });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Stack spacing={1}>
      <Typography variant="h4">Home (placeholder)</Typography>
      <Typography>{gaming.length} gaming computers: {gaming.map((pc) => pc.name).join(', ')}</Typography>
      <Typography>{office.length} office computers: {office.map((pc) => pc.name).join(', ')}</Typography>
    </Stack>
  );
}
