import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Calendar from './pages/Calendar.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';
import Anggota from './pages/Anggota.jsx';
import DivisionDetail from './pages/DivisionDetail.jsx';
import { isAuthed } from './utils/auth.js';
import ToastProvider from './components/Toast.jsx';

function RequireAuth({ children }) {
  const ok = isAuthed();
  const loc = useLocation();
  if (!ok) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
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
          <Route path="/peringkat" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
