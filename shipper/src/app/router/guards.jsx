import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectCurrentUser, selectIsAuthenticated } from '@/app/store'
import { paths } from './paths'
// These guards only decide which screens the UI shows. They are NOT security: every API call is
// authorised by the backend, which must reject requests the signed-in user may not make.
// ASSUMPTION — confirm with backend team: user.role is 'customer' | 'admin'.
/** Customer areas (account, checkout). Sends anonymous visitors to the login page and back again. */
export function RequireAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to={paths.login} replace state={{ from: location }} />
  return <Outlet />
}
/** Admin dashboard. Anonymous visitors go to the admin login; customers are sent to the storefront. */
export function RequireAdmin() {
  const user = useSelector(selectCurrentUser)
  const location = useLocation()
  if (!user) return <Navigate to={paths.admin.login} replace state={{ from: location }} />
  if (user.role !== 'admin') return <Navigate to={paths.home} replace />
  return <Outlet />
}
/** Login and signup pages: signed-in users have nothing to do there. */
export function RedirectIfAuthenticated() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname ?? paths.profile} replace />
  return <Outlet />
}