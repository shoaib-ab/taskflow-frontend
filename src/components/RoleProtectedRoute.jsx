import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * RoleProtectedRoute
 *
 * Wraps ProtectedRoute with an additional role check.
 * Usage:
 *   <RoleProtectedRoute roles={['admin']}>
 *     <AdminUsers />
 *   </RoleProtectedRoute>
 *
 * - Not logged in → redirect to /login
 * - Logged in but wrong role → redirect to /dashboard (or a 403 page)
 * - Correct role → render children
 */
const RoleProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Spinner />
      </div>
    );

  if (!user) return <Navigate to='/login' replace />;

  if (roles.length > 0 && !roles.includes(user.role))
    return <Navigate to='/dashboard' replace />;

  return children;
};

export default RoleProtectedRoute;
