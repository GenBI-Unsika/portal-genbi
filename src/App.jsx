import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import Layout from './components/Layout.jsx';
import MinimalLayout from './components/MinimalLayout.jsx';
import { ensureAuthed, isAuthed } from './utils/auth.js';
import ToastProvider from './components/Toast.jsx';
import { ModalProvider } from './contexts/ModalContext.jsx';

// Route-level code splitting
const Login = React.lazy(() => import('./pages/Login.jsx'));
const Home = React.lazy(() => import('./pages/Home.jsx'));
const Calendar = React.lazy(() => import('./pages/Calendar.jsx'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard.jsx'));
const Profile = React.lazy(() => import('./pages/Profile.jsx'));
const Anggota = React.lazy(() => import('./pages/Anggota.jsx'));
const DivisionDetail = React.lazy(() => import('./pages/DivisionDetail.jsx'));
const RekapitulasiKas = React.lazy(() => import('./pages/RekapitulasiKas.jsx'));
const Dispensasi = React.lazy(() => import('./pages/Dispensasi.jsx'));
const PusatInformasi = React.lazy(() => import('./pages/PusatInformasi.jsx'));

function RequireAuth({ children }) {
  const loc = useLocation();
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        if (isAuthed()) {
          setOk(true);
          return;
        }
        const nextOk = await ensureAuthed();
        setOk(nextOk);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return null;
  if (!ok) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}

export default function App() {
  return (
    <ModalProvider>
      <ToastProvider>
        <React.Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500" />
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Standard Layout with sidebar */}
            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Home />} />
              <Route path="/kalender" element={<Calendar />} />
              <Route path="/anggota" element={<Anggota />} />
              <Route path="/anggota/:divisionKey" element={<DivisionDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/rekapitulasi-kas" element={<RekapitulasiKas />} />
              <Route path="/peringkat" element={<Leaderboard />} />
              <Route path="/dispensasi" element={<Dispensasi />} />
              <Route path="/pusat-informasi" element={<PusatInformasi />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </ToastProvider>
    </ModalProvider>
  );
}
