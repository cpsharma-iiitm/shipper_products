export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://mock-api.shipper.local',
  MOCK_MODE: import.meta.env.VITE_MOCK_MODE === 'true' || true,
  APP_NAME: 'Shipper',
  APP_VERSION: '1.0.0',
};

export const isMockMode = () => env.MOCK_MODE;
