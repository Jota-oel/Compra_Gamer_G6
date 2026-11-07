import { Skeleton, Stack } from '@mui/material';

/** Placeholder rows while the first load is in progress. */
export default function ListSkeleton({ rows = 6 }) {
  return (
    <Stack spacing={1} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={48} />
      ))}
    </Stack>
  );
}
