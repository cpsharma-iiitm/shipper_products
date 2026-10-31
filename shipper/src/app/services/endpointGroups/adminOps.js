import { httpRequest } from '../http';

const adminOps = {
  users: () => httpRequest('/api/admin/users'),
  roles: () => httpRequest('/api/admin/roles'),
  shipping: () => httpRequest('/api/admin/shipping'),
};

export default adminOps;
