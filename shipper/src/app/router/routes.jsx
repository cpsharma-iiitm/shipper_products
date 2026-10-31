import { Navigate } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import StorefrontLayout from '@/layouts/StorefrontLayout'
import NotFoundPage from '@/pages/NotFoundPage'
import RouteErrorPage from '@/pages/RouteErrorPage'
import { RedirectIfAuthenticated, RequireAdmin, RequireAuth } from './guards'
import { paths } from './paths'
import RootRoute from './RootRoute'
// Pages are code-split: each loader runs only when its route is visited.
const page = (loader) => ({
  lazy: async () => ({ Component: (await loader()).default }),
})
const storefrontRoutes = [
  { index: true, handle: { title: 'Everyday essentials' }, ...page(() => import('@/pages/storefront/HomePage')) },
  { path: 'shop', handle: { title: 'All products' }, ...page(() => import('@/pages/storefront/ShopPage')) },
  { path: 'category/:slug', handle: { title: 'Shop' }, ...page(() => import('@/pages/storefront/ShopPage')) },
  { path: 'products/:slug', handle: { title: 'Product' }, ...page(() => import('@/pages/storefront/ProductPage')) },
  { path: 'cart', handle: { title: 'Your cart' }, ...page(() => import('@/pages/storefront/CartPage')) },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: 'login', handle: { title: 'Log in' }, ...page(() => import('@/pages/storefront/LoginPage')) },
      { path: 'signup', handle: { title: 'Sign up' }, ...page(() => import('@/pages/storefront/SignupPage')) },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: 'checkout', handle: { title: 'Checkout' }, ...page(() => import('@/pages/storefront/CheckoutPage')) },
      {
        path: 'checkout/confirmation/:orderNumber',
        handle: { title: 'Order confirmed' },
        ...page(() => import('@/pages/storefront/OrderConfirmationPage')),
      },
      {
        path: 'account',
        children: [
          { index: true, element: <Navigate to={paths.profile} replace /> },
          { path: 'profile', handle: { title: 'Profile & addresses' }, ...page(() => import('@/pages/storefront/ProfilePage')) },
          { path: 'orders', handle: { title: 'My orders' }, ...page(() => import('@/pages/storefront/OrdersPage')) },
          { path: 'orders/:orderNumber', handle: { title: 'Order details' }, ...page(() => import('@/pages/storefront/OrderDetailPage')) },
          { path: 'wallet', handle: { title: 'Wallet & rewards' }, ...page(() => import('@/pages/storefront/WalletPage')) },
          { path: 'saved', handle: { title: 'Saved products' }, ...page(() => import('@/pages/storefront/SavedPage')) },
        ],
      },
    ],
  },
  { path: 'track', handle: { title: 'Track shipment' }, ...page(() => import('@/pages/storefront/TrackPage')) },
  { path: 'offers', handle: { title: 'Today’s offers' }, ...page(() => import('@/pages/storefront/OffersPage')) },
  { path: 'policies/:slug', handle: { title: 'Policies' }, ...page(() => import('@/pages/storefront/PolicyPage')) },
  { path: '*', handle: { title: 'Page not found' }, element: <NotFoundPage /> },
]
const adminRoutes = [
  { index: true, element: <Navigate to={paths.admin.dashboard} replace /> },
  { path: 'dashboard', handle: { title: 'Dashboard', crumb: 'Dashboard' }, ...page(() => import('@/pages/admin/DashboardPage')) },
  {
    path: 'purchases',
    handle: { crumb: 'Purchase' },
    children: [
      { index: true, handle: { title: 'Purchases' }, ...page(() => import('@/pages/admin/PurchasesPage')) },
      { path: 'new', handle: { title: 'Create purchase', crumb: 'Create purchase' }, ...page(() => import('@/pages/admin/CreatePurchasePage')) },
    ],
  },
  {
    path: 'orders',
    handle: { crumb: 'Orders' },
    children: [
      { index: true, handle: { title: 'Orders' }, ...page(() => import('@/pages/admin/AdminOrdersPage')) },
      { path: ':orderNumber', handle: { title: 'Order', crumb: 'Order details' }, ...page(() => import('@/pages/admin/AdminOrderDetailPage')) },
    ],
  },
  { path: 'products', handle: { title: 'Products', crumb: 'Products' }, ...page(() => import('@/pages/admin/ProductsPage')) },
  {
    path: 'reports',
    handle: { crumb: 'Reports' },
    children: [
      { index: true, handle: { title: 'Reports' }, ...page(() => import('@/pages/admin/ReportsPage')) },
      { path: 'financial', handle: { title: 'Financial report', crumb: 'Financial report' }, ...page(() => import('@/pages/admin/FinancialReportPage')) },
    ],
  },
  {
    path: 'customers',
    handle: { crumb: 'Customers' },
    children: [
      { index: true, handle: { title: 'Customers' }, ...page(() => import('@/pages/admin/CustomersPage')) },
      { path: ':code', handle: { title: 'Customer', crumb: 'Customer details' }, ...page(() => import('@/pages/admin/CustomerDetailPage')) },
    ],
  },
  { path: 'users', handle: { title: 'Users', crumb: 'Users' }, ...page(() => import('@/pages/admin/UsersPage')) },
  { path: 'roles', handle: { title: 'User roles', crumb: 'User Roles' }, ...page(() => import('@/pages/admin/RolesPage')) },
  {
    path: 'store-operation',
    handle: { crumb: 'Store Operation' },
    children: [
      { index: true, element: <Navigate to={paths.admin.storeTab('new-orders')} replace /> },
      { path: ':tab', handle: { title: 'Store Operation' }, ...page(() => import('@/pages/admin/StoreOperationPage')) },
    ],
  },
  { path: 'shipping', handle: { title: 'Shipping', crumb: 'Shipping' }, ...page(() => import('@/pages/admin/ShippingPage')) },
  { path: 'restock', handle: { title: 'Order restock', crumb: 'Order Restock' }, ...page(() => import('@/pages/admin/RestockPage')) },
  { path: 'profile', handle: { title: 'Profile', crumb: 'Profile' }, ...page(() => import('@/pages/admin/AdminProfilePage')) },
  {
    path: '*',
    handle: { title: 'Page not found', crumb: 'Not found' },
    element: <NotFoundPage homeTo={paths.admin.dashboard} homeLabel="Back to dashboard" />,
  },
]
export const routes = [
  {
    element: <RootRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      { element: <StorefrontLayout />, children: storefrontRoutes },
      { path: 'admin/login', handle: { title: 'Admin login' }, ...page(() => import('@/pages/admin/AdminLoginPage')) },
      {
        path: 'admin',
        element: <RequireAdmin />,
        children: [{ element: <AdminLayout />, children: adminRoutes }],
      },
      // Development reference for the shared components. Never part of a production build.
      ...(import.meta.env.DEV
        ? [{ path: 'dev/components', handle: { title: 'Component gallery' }, ...page(() => import('@/dev/ComponentGallery')) }]
        : []),
    ],
  },
]