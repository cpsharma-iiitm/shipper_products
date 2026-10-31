import { httpRequest } from '../http';

const saved = {
  list: () => httpRequest('/api/saved'),
  add: (productId) => httpRequest('/api/saved', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
};

export default saved;
