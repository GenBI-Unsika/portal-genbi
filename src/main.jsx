import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import { ConfirmProvider } from './contexts/ConfirmContext.jsx';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const app = (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
  </BrowserRouter>
);

createRoot(document.getElementById('root')).render(<React.StrictMode>{googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider> : app}</React.StrictMode>);
