import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute — guards all child routes.
 *
 * Usage A (wrapping a layout as children — current App.jsx pattern):
 *   <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 * The component detects which mode it's in:
 *  - If children are passed, it renders them (the layout already has <Outlet/>).
 *  - If no children, it renders <Outlet/> directly.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If children provided (e.g. <MainLayout/>) render them — they contain <Outlet/>.
  // Otherwise render <Outlet/> directly so nested routes work without a wrapper.
  return children ?? <Outlet />;
}
