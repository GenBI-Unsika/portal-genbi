import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut, Menu, X, ChevronLeft, User2, Trophy, CalendarDays, Wallet, FileText, UserRound } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { logout, getMe, syncMe } from '../utils/auth.js';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import { useToast } from './Toast.jsx';

// Role labels mapping
const ROLE_LABELS = {
  admin: 'Administrator',
  ketua: 'Ketua',
  wakil: 'Wakil Ketua',
  bendahara: 'Bendahara',
  sekretaris: 'Sekretaris',
  awardee: 'Awardee',
  alumni: 'Alumni',
  member: 'Anggota',
};

// Navigation items
const navItems = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays },
  { to: '/anggota', label: 'Anggota', icon: UserRound },
  { to: '/rekapitulasi-kas', label: 'Kas', icon: Wallet },
  { to: '/peringkat', label: 'Peringkat', icon: Trophy },
  { to: '/dispensasi', label: 'Dispensasi', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User2 },
];

export default function MinimalLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => getMe());
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useConfirm();
  const toast = useToast();


  useEffect(() => {
    const loadUser = async () => {
      try {
        const freshUser = await syncMe();
        if (freshUser) {
          setUser(freshUser);
        }
      } catch (err) {
        if (err?.status === 401) {
          toast.push('Sesi login telah berakhir. Silakan login kembali.', 'error');
          navigate('/login', { replace: true });
          return;
        }
        // Failed to sync user data
      }
    };
    loadUser();
  }, [navigate]);


  const userName = user?.profile?.name || user?.name || user?.email?.split('@')[0] || 'Pengguna';
  const userRole = user?.role || 'awardee';
  const userRoleLabel = ROLE_LABELS[userRole] || 'Anggota';
  const userAvatar = user?.profile?.avatar || user?.avatar || null;


  const isAdmin = ['admin', 'ketua', 'wakil', 'bendahara', 'sekretaris'].includes(userRole);

  const doLogout = async () => {
    const ok = await confirm({
      title: 'Logout?',
      description: 'Anda akan keluar dari akun ini. Pastikan semua pekerjaan sudah tersimpan.',
      confirmText: 'Ya, logout',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!ok) return;

    try {
      await logout();
      toast.push('Anda telah logout. Sampai jumpa!', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.push('Gagal logout: ' + (err?.message || 'Terjadi kesalahan'), 'error');
    }
  };


  const getCurrentPageTitle = () => {
    const current = navItems.find((item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'));
    return current?.label || 'Portal GenBI';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Minimalist Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-soft-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Back */}
            <div className="flex items-center gap-4">
              <NavLink to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-9 w-9 rounded-xl border border-slate-200/80 object-cover shadow-soft-sm transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 rounded-xl ring-2 ring-primary-500/0 group-hover:ring-primary-500/20 transition-all" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 tracking-tight">GenBI Unsika</p>
                  <p className="text-xs text-slate-500 -mt-0.5">Portal Awardee</p>
                </div>
              </NavLink>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.slice(0, 6).map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                      transition-all duration-200 ease-out
                      ${isActive ? 'text-primary-700 bg-primary-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : 'text-slate-500'}`} />
                    <span>{label}</span>
                    {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: User Profile & Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* User Info - Desktop */}
              <NavLink to="/profile" className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-soft-sm">
                <Avatar name={userName} src={userAvatar} size={32} />
                <div className="text-right">
                  <span className="block text-sm font-medium text-slate-800 leading-tight">{userName}</span>
                  <span className="block text-xs text-slate-500 leading-tight">{userRoleLabel}</span>
                </div>
              </NavLink>

              {/* Logout - Desktop */}
              <button
                onClick={doLogout}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 transition-all shadow-soft-sm"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-soft-sm">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl animate-slide-fade">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive ? 'text-primary-700 bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-slate-500'}`} />
                    <span>{label}</span>
                  </NavLink>
                );
              })}

              <div className="pt-2 mt-2 border-t border-slate-200">
                <button
                  onClick={async () => {
                    await doLogout();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet context={{ user, isAdmin, userRole }} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
            <p>© 2024-2025 GenBI Unsika. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary-600 transition-colors">
                Bantuan
              </a>
              <a href="#" className="hover:text-primary-600 transition-colors">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
