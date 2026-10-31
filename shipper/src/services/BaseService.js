export class BaseService {
  async request(endpoint, options = {}) {
    const response = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.status === 204 ? null : response.json();
  }
}

export default BaseService;
