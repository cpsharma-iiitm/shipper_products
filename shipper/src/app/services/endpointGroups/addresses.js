import { httpRequest } from '../http';

const addresses = {
  list: () => httpRequest('/api/addresses'),
  create: (payload) => httpRequest('/api/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => httpRequest(`/api/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
};

export default addresses;
