// Halaman Peringkat sudah diganti dengan Leaderboard.jsx yang terhubung ke API
import { Navigate } from 'react-router-dom';

export default function Peringkat() {
  return <Navigate to="/peringkat" replace />;
}
