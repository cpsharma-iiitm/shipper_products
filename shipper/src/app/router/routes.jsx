import { Navigate, Route, Routes } from 'react-router-dom';
import { paths } from './paths';
import StorefrontLayout from '../../layouts/StorefrontLayout/StorefrontLayout';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import HomePage from '../../pages/storefront/HomePage';
import ShopPage from '../../pages/storefront/ShopPage';
import ProductPage from '../../pages/storefront/ProductPage';
import CartPage from '../../pages/storefront/CartPage';
import CheckoutPage from '../../pages/storefront/CheckoutPage';
import LoginPage from '../../pages/storefront/LoginPage';
import SignupPage from '../../pages/storefront/SignupPage';
import OrdersPage from '../../pages/storefront/OrdersPage';
import OrderDetailPage from '../../pages/storefront/OrderDetailPage';
import ProfilePage from '../../pages/storefront/ProfilePage';
import SavedPage from '../../pages/storefront/SavedPage';
import TrackPage from '../../pages/storefront/TrackPage';
import WalletPage from '../../pages/storefront/WalletPage';
import PolicyPage from '../../pages/storefront/PolicyPage';
import DashboardPage from '../../pages/admin/DashboardPage';
import ProductsPage from '../../pages/admin/ProductsPage';
import AdminOrdersPage from '../../pages/admin/AdminOrdersPage';
import CustomersPage from '../../pages/admin/CustomersPage';
import ReportsPage from '../../pages/admin/ReportsPage';
import UsersPage from '../../pages/admin/UsersPage';
import ShippingPage from '../../pages/admin/ShippingPage';
import PurchasesPage from '../../pages/admin/PurchasesPage';
import AdminProfilePage from '../../pages/admin/AdminProfilePage';
import AdminLoginPage from '../../pages/admin/AdminLoginPage';
import NotFoundPage from '../../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.shop} element={<ShopPage />} />
        <Route path={paths.product} element={<ProductPage />} />
        <Route path={paths.cart} element={<CartPage />} />
        <Route path={paths.checkout} element={<CheckoutPage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.signup} element={<SignupPage />} />
        <Route path={paths.orders} element={<OrdersPage />} />
        <Route path={paths.orderDetail} element={<OrderDetailPage />} />
        <Route path={paths.profile} element={<ProfilePage />} />
        <Route path={paths.saved} element={<SavedPage />} />
        <Route path={paths.track} element={<TrackPage />} />
        <Route path={paths.wallet} element={<WalletPage />} />
        <Route path={paths.policy} element={<PolicyPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path={paths.adminLogin} element={<AdminLoginPage />} />
        <Route path={paths.adminDashboard} element={<DashboardPage />} />
        <Route path={paths.adminProducts} element={<ProductsPage />} />
        <Route path={paths.adminOrders} element={<AdminOrdersPage />} />
        <Route path={paths.adminCustomers} element={<CustomersPage />} />
        <Route path={paths.adminReports} element={<ReportsPage />} />
        <Route path={paths.adminUsers} element={<UsersPage />} />
        <Route path={paths.adminShipping} element={<ShippingPage />} />
        <Route path={paths.adminPurchases} element={<PurchasesPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
