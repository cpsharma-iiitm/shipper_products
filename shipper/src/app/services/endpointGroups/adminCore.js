import { httpRequest } from '../http';

const adminCore = {
  dashboard: () => httpRequest('/api/admin/dashboard'),
  stats: () => httpRequest('/api/admin/stats'),
};

export default adminCore;
