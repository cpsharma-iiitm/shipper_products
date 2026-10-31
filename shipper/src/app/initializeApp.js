import App from '../src/App';
import { BrowserRouter } from 'react-router-dom';

export function initializeApp(root) {
  const app = <BrowserRouter><App /></BrowserRouter>;
  root.render(app);
}
