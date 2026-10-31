import { httpRequest } from '../http';

const documents = {
  invoice: (orderId) => httpRequest(`/api/orders/${orderId}/invoice`),
  shippingLabel: (orderId) => httpRequest(`/api/orders/${orderId}/shipping-label`),
};

export default documents;
