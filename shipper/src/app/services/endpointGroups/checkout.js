import { httpRequest } from '../http';

const checkout = {
  create: (payload) => httpRequest('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  confirm: (orderId) => httpRequest(`/api/checkout/${orderId}/confirm`, {
    method: 'POST',
  }),
};

export default checkout;
