export class CatalogService extends BaseService {
  list() {
    return this.request('/api/catalog');
  }

  getById(id) {
    return this.request(`/api/catalog/${id}`);
  }
}

export class OrderService extends BaseService {
  list() {
    return this.request('/api/orders');
  }

  getById(id) {
    return this.request(`/api/orders/${id}`);
  }
}

export class DashboardService extends BaseService {
  overview() {
    return this.request('/api/dashboard');
  }
}

export class AuthService extends BaseService {
  login(payload) {
    return this.request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  }

  signup(payload) {
    return this.request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
  }
}
