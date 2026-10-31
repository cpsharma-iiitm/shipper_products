import { httpRequest } from '../http';

const adminModules = {
  products: () => httpRequest('/api/admin/products'),
  customers: () => httpRequest('/api/admin/customers'),
  reports: () => httpRequest('/api/admin/reports'),
};

export default adminModules;
