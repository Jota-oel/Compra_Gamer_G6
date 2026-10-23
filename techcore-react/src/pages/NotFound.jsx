import { Link as RouterLink } from 'react-router';
import { Button, Stack, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h4">404: page not found</Typography>
      <Button component={RouterLink} to="/" variant="outlined">Back to Home</Button>
    </Stack>
  );
}
