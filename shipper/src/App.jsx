import { AppRoutes } from './router/routes';
import { AppProviders } from './app/providers';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
