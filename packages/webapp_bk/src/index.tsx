import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react';

import './index.css';

import Layout from './pages/layout/Layout.js';
import Chat from './pages/chat/Chat.js';

initializeIcons();

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Chat />,
      },
      {
        path: 'qa',
        lazy: () => import('./pages/oneshot/OneShot.js'),
      },
      {
        path: '*',
        lazy: () => import('./pages/NoPage.js'),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
