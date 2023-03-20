import { createBrowserRouter } from 'react-router-dom';
import Home from '../Home';
import FormBuilder from '../FormBuilder';
import SuccessPage from '../SuccessPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/form-builder',
    element: <FormBuilder />,
  },
  {
    path: '/success',
    element: <SuccessPage />,
  },
]);
