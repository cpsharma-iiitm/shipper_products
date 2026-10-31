import { AppProviders } from './app/providers';
import AppRoutes from './app/router/routes';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
