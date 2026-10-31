import { createBrowserRouter } from 'react-router-dom'
import { routes } from './routes'
export const router = createBrowserRouter(routes)
export { paths } from './paths'
export { RedirectIfAuthenticated, RequireAdmin, RequireAuth } from './guards'