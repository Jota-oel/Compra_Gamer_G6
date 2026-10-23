import { Navigate, useLocation } from 'react-router';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * <ProtectedRoute role="admin"><Catalog /></ProtectedRoute>
 * - session still being read -> spinner (without this, a page reload would bounce to /login)
 * - not logged in            -> /login (remembers where the user wanted to go in location.state.from)
 * - wrong role               -> /
 * Owner: Agustin may extend it.
 */
export function ProtectedRoute({ role, children }) {
  const { ready, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
