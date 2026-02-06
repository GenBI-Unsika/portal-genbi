import { useMemo, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Trophy, UserRound, Menu, LogOut, Wallet, FileText, Users } from 'lucide-react';
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

// Routes that should have sidebar collapsed by default (need wide view)
const WIDE_VIEW_ROUTES = ['/rekapitulasi-kas', '/peringkat'];

// Desktop sidebar navigation (full list)
const sidebarNav = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/kalender', label: 'Kalender GenBI', icon: CalendarDays },
  { to: '/anggota', label: 'Data Anggota', icon: Users },
  { to: '/rekapitulasi-kas', label: 'Rekapitulasi Kas', icon: Wallet },
  { to: '/peringkat', label: 'Peringkat', icon: Trophy },
  { to: '/dispensasi', label: 'Surat Dispensasi', icon: FileText },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

// Mobile bottom navigation (6 items - profile moved to header)
const mobileNav = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays },
  { to: '/peringkat', label: 'Poin', icon: Trophy },
  { to: '/dispensasi', label: 'Surat', icon: FileText },
  { to: '/anggota', label: 'Anggota', icon: Users },
  { to: '/rekapitulasi-kas', label: 'Kas', icon: Wallet },
];

export default function Layout() {
  const location = useLocation();
  const isWideViewRoute = WIDE_VIEW_ROUTES.includes(location.pathname);

  const [collapsed, setCollapsed] = useState(isWideViewRoute);
  const [user, setUser] = useState(() => getMe());
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const toast = useToast();

  // Auto-collapse sidebar when navigating to wide view routes
  useEffect(() => {
    if (isWideViewRoute) {
      setCollapsed(true);
    }
  }, [isWideViewRoute, location.pathname]);

  // Sync user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const freshUser = await syncMe();
        if (freshUser) {
          setUser(freshUser);
        }
      } catch (err) {
        // Check if session expired (401 error)
        if (err?.status === 401) {
          toast.push('Sesi login telah berakhir. Silakan login kembali.', 'error');
          navigate('/login', { replace: true });
          return;
        }
        // Use cached data if sync fails for other reasons
        console.warn('Failed to sync user data:', err);
      }
    };
    loadUser();
  }, [navigate]);

  // Extract user info
  const userName = user?.profile?.name || user?.name || user?.email?.split('@')[0] || 'Pengguna';
  const userRole = user?.role || 'awardee';
  const userRoleLabel = ROLE_LABELS[userRole] || 'Anggota';
  const userAvatar = user?.profile?.avatar || user?.avatar || null;

  // Check if user has admin/elevated privileges
  const isAdmin = ['admin', 'ketua', 'wakil', 'bendahara', 'sekretaris'].includes(userRole);

  const Brand = useMemo(
    () =>
      !collapsed && (
        <div className="flex items-center gap-3">
          <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 rounded-md border border-neutral-200 object-cover" />
          <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>
        </div>
      ),
    [collapsed],
  );

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
      toast.push('Logout berhasil. Sampai jumpa!', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.push('Gagal logout: ' + (err?.message || 'Terjadi kesalahan'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <div className="flex">
        {/* Sidebar (desktop only) */}
        <aside className={`sticky top-0 hidden md:flex h-screen flex-col border-r border-neutral-200 bg-[rgb(255,255,255)] transition-[width] duration-200 ${collapsed ? 'w-[88px]' : 'w-[264px]'}`}>
          {/* Header sidebar */}
          <div className={`flex items-center border-b border-neutral-200 ${collapsed ? 'justify-center py-3' : 'justify-between px-3 py-3'}`}>
            {Brand}
            <button type="button" aria-label={collapsed ? 'Buka sidebar' : 'Ciutkan sidebar'} onClick={() => setCollapsed((s) => !s)} className="inline-grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 focus-ring">
              <Menu className="h-5 w-5 text-neutral-700" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1.5">
              {sidebarNav.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `
                        group flex items-center rounded-xl border text-sm focus-ring
                        ${collapsed ? 'justify-center px-0 py-3' : 'gap-3.5 px-3 py-3'}
                        ${isActive ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-transparent hover:bg-neutral-100'}
                      `
                    }
                  >
                    <Icon className="h-5 w-5 text-neutral-600" />
                    {!collapsed && <span className="text-neutral-800">{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-2 pb-4">
            <button
              type="button"
              onClick={doLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-600 hover:bg-secondary-700 border border-secondary-600 px-3 py-2.5 text-sm font-semibold text-[rgb(255,255,255)] focus-ring"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-[10000] border-b border-neutral-200 bg-white shadow-soft-sm isolate">
            <div className="flex items-center gap-3 px-4 py-3 md:px-8 md:py-4">
              {/* Mobile: Show logo */}
              <div className="flex md:hidden items-center gap-2.5">
                <img src="/favicon-genbi.webp" alt="GenBI" className="h-9 w-9 rounded-md border border-neutral-200 object-cover" />
                <h2 className="text-base font-semibold text-neutral-900">Portal GenBI</h2>
              </div>
              {/* Desktop: Full title */}
              <h2 className="hidden md:block text-base font-semibold text-neutral-900">Portal GenBI Unsika</h2>

              {/* User Info - Desktop & Mobile */}
              <NavLink to="/profile" className="ml-auto flex items-center gap-1.5 md:gap-3 rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] px-1.5 py-1 md:px-3 md:py-1.5 hover:bg-neutral-50 transition-colors">
                <Avatar name={userName} src={userAvatar} size={24} className="md:w-7 md:h-7" />
                <div className="flex flex-col">
                  <span className="text-[11px] md:text-sm font-medium text-neutral-800 leading-tight truncate max-w-[100px] md:max-w-none">{userName}</span>
                  <span className="text-[9px] md:text-xs text-neutral-500 leading-tight">{userRoleLabel}</span>
                </div>
              </NavLink>
            </div>
          </header>

          {/* Main content with bottom padding for mobile nav */}
          <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8 lg:p-10 lg:pb-10">
            <Outlet context={{ user, isAdmin, userRole }} />
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="bottom-nav md:hidden">
            <div className="flex items-center justify-around">
              {mobileNav.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon className="nav-icon" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
