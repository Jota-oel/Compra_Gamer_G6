import { Route, Routes } from 'react-router';
import { MainLayout } from './layout/MainLayout.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

/** Routes (owner: platform). /catalog is admin-only until decision 4 says otherwise. */
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route
          path="catalog"
          element={(
            <ProtectedRoute role="admin">
              <Catalog />
            </ProtectedRoute>
          )}
        />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
