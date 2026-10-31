import { httpRequest } from '../http';

const account = {
  profile: () => httpRequest('/api/account/profile'),
  wallet: () => httpRequest('/api/account/wallet'),
  saved: () => httpRequest('/api/account/saved'),
};

export default account;
