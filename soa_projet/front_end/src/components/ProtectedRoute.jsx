import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="screen-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length > 0 && !roles.some((role) => user.roles?.includes(role))) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
