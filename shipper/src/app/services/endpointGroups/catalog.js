import { httpRequest } from '../http';

const catalog = {
  list: () => httpRequest('/api/catalog'),
  detail: (id) => httpRequest(`/api/catalog/${id}`),
  offers: () => httpRequest('/api/catalog/offers'),
};

export default catalog;
