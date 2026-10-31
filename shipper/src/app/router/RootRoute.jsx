import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function RootRoute() {
  const location = useLocation();

  if (location.pathname === '/') {
    return <Navigate to="/shop" replace />;
  }

  return <Outlet />;
}
