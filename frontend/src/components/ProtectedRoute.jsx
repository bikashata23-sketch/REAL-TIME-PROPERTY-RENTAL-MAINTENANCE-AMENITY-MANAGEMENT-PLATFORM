import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../utils/roleRoutes';

/**
 * Wraps protected pages. Redirects to /login if unauthenticated,
 * or to the user's own dashboard if they lack the required role.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
