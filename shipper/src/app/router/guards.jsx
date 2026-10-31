import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children, redirectTo = '/login' }) {
  const isLoggedIn = false;
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}

export function RequireAdmin({ children, redirectTo = '/admin/login' }) {
  const isAdmin = false;
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}
