import { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, Trophy, UserRound, Menu, LogOut, X, Wallet } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { logout } from '../utils/auth.js';

const nav = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/kalender', label: 'Kalender GenBI Unsika', icon: CalendarDays },
  { to: '/anggota', label: 'Data Anggota', icon: UserRound },
  { to: '/rekapitulasi-kas', label: 'Rekapitulasi Kas', icon: Wallet },
  { to: '/peringkat', label: 'Peringkat', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const Brand = useMemo(
    () =>
      !collapsed && (
        <div className="flex items-center gap-3">
          <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 rounded-md border border-neutral-200 object-cover" />
          <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>
        </div>
      ),
    [collapsed]
  );

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
              {nav.map(({ to, label, icon: Icon }) => (
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

        {/* Mobile floating drawer (hamburger) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="modal-backdrop" onClick={() => setMobileOpen(false)} />
            <div className="pointer-events-none fixed inset-0 flex items-start">
              <aside className="pointer-events-auto mt-16 ml-4 w-72 max-w-[80%] transform rounded-xl border border-neutral-200 bg-white p-2 shadow-lg transition-all duration-200 ease-out drawer-slide-in">
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-3">
                    <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 rounded-md border border-neutral-200 object-cover" />
                    <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="inline-grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 focus-ring">
                    <X className="h-5 w-5 text-neutral-700" />
                  </button>
                </div>

                <nav className="mt-2 px-1 py-1">
                  <ul className="space-y-1.5">
                    {nav.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <NavLink
                          to={to}
                          end={to === '/'}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center rounded-lg border text-sm focus-ring gap-3 px-3 py-2 ${isActive ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-transparent hover:bg-neutral-100'}`
                          }
                        >
                          <Icon className="h-5 w-5 text-neutral-600" />
                          <span className="text-neutral-800">{label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-3 px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                      navigate('/login', { replace: true });
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-600 hover:bg-secondary-700 border border-secondary-600 px-3 py-2 text-sm font-semibold text-white focus-ring"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[rgb(255,255,255)]/95 backdrop-blur">
            <div className="flex items-center gap-3 px-5 py-4 md:px-8">
              <button className="inline-grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 hover:bg-neutral-50 md:hidden focus-ring" onClick={() => setMobileOpen(true)} aria-label="Toggle sidebar">
                <Menu className="h-5 w-5 text-neutral-700" />
              </button>
              <h2 className="text-base font-semibold text-neutral-900">Portal GenBI Unsika</h2>
              <div className="ml-auto hidden md:flex items-center gap-3 rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] px-3 py-1.5">
                <Avatar name="Awardee GenBI" size={28} />
                <span className="text-sm text-neutral-700">Awardee</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-5 md:p-8 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
