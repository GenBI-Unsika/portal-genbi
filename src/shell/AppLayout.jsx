import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, LogOut, Search, ChevronDown, User2, Trophy, X, Wallet } from 'lucide-react';
import ToastProvider from '../components/Toasts';
import { useAuth } from '../modules/auth/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext.jsx';

const nav = [
  { to: '/', label: 'Beranda', icon: LayoutGrid },
  { to: '/kalender', label: 'Kalender GenBI Unsika', icon: CalendarDays },
  { to: '/anggota', label: 'Data Anggota', icon: User2 },
  { to: '/rekapitulasi-kas', label: 'Rekapitulasi Kas', icon: Wallet },
  { to: '/peringkat', label: 'Peringkat', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User2 },
];

export default function AppLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();
  const [collapsed, setCollapsed] = useState(() => JSON.parse(localStorage.getItem('sb-col') || 'false'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => localStorage.setItem('sb-col', JSON.stringify(collapsed)), [collapsed]);
  useEffect(() => setOpen(false), [loc.pathname]);

  const Brand = useMemo(
    () =>
      !collapsed ? (
        <div className="flex items-center gap-3 px-3 py-3">
          <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 p-1 rounded-lg border border-neutral-200 object-cover" />
          <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>
        </div>
      ) : null,
    [collapsed],
  );

  const doLogout = async () => {
    const ok = await confirm({
      title: 'Logout?',
      description: 'Anda akan keluar dari akun ini.',
      confirmText: 'Ya, logout',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!ok) return;

    logout();
    navigate('/login', { replace: true });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-800">
        <div className="flex">
          {/* Sidebar (desktop only) */}
          <aside className={`sticky top-0 hidden md:flex h-screen flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ${collapsed ? 'w-[84px]' : 'w-[260px]'} shadow-soft-sm`}>
            <div className="flex items-center justify-between border-b border-neutral-200">
              {Brand}
              <button
                className="mr-2 inline-grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] transition focus-ring"
                onClick={() => setCollapsed((s) => !s)}
                aria-label="Toggle sidebar"
              >
                {collapsed ? <ChevronRight className="h-4 w-4 text-neutral-700" /> : <ChevronLeft className="h-4 w-4 text-neutral-700" />}
              </button>
            </div>

            <nav className="flex-1 px-2 py-4">
              <ul className="space-y-1">
                {nav.map(({ to, label, icon: Icon }) => {
                  const active = loc.pathname === to || loc.pathname.startsWith(to + '/');

                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        className={`group flex w-full items-center rounded-xl border border-transparent py-2.5 text-sm transition
                          ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                          ${active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-neutral-50'}`}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-neutral-600'}`} />
                        {!collapsed && <span className={active ? 'text-primary-700' : 'text-neutral-700'}>{label}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto px-2 pb-4">
              <button onClick={doLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-900 border border-neutral-200 px-3 py-2.5 text-sm font-medium text-white transition focus-ring">
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
                      <img src="/favicon-genbi.webp" alt="GenBI Unsika" className="h-8 w-8 p-1 rounded-lg border border-neutral-200 object-cover" />
                      <p className="text-base font-semibold text-neutral-900">GenBI Unsika</p>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="inline-grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 focus-ring">
                      <X className="h-5 w-5 text-neutral-700" />
                    </button>
                  </div>

                  <nav className="mt-2 px-1 py-1">
                    <ul className="space-y-1">
                      {nav.map(({ to, label, icon: Icon }) => {
                        const active = loc.pathname === to || loc.pathname.startsWith(to + '/');
                        return (
                          <li key={to}>
                            <NavLink
                              to={to}
                              onClick={() => setMobileOpen(false)}
                              className={`group flex w-full items-center rounded-lg border border-transparent py-2.5 text-sm transition gap-3 px-3 ${active ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-neutral-50'}`}
                            >
                              <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-neutral-600'}`} />
                              <span className={active ? 'text-primary-700' : 'text-neutral-700'}>{label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="mt-3 px-2 pb-2">
                    <button
                      onClick={async () => {
                        await doLogout();
                        setMobileOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 hover:bg-neutral-900 border border-neutral-200 px-3 py-2 text-sm font-medium text-white transition focus-ring"
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
            <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white shadow-soft-sm isolate">
              <div className="flex items-center gap-3 px-4 py-3 md:px-6">
                <button className="inline-grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 hover:bg-neutral-50 md:hidden focus-ring" onClick={() => setMobileOpen(true)} aria-label="Toggle sidebar">
                  <Menu className="h-5 w-5 text-neutral-700" />
                </button>
                <h2 className="text-base font-semibold text-neutral-900">Selamat datang, {user?.email}</h2>

                <div className="ml-auto w-full max-w-md">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus-ring" placeholder="Telusuri…" />
                  </div>
                </div>

                <div className="relative ml-2">
                  <button onClick={() => setOpen((s) => !s)} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 hover:bg-neutral-50 focus-ring">
                    <div className="grid h-8 w-8 place-items-center rounded-full border border-neutral-200 bg-primary-50 text-primary-700">
                      <User2 className="h-4 w-4" />
                    </div>
                    <span className="hidden text-sm font-medium text-neutral-800 md:block">Profile</span>
                    <ChevronDown className="hidden h-4 w-4 text-neutral-500 md:block" />
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft-sm">
                      <button
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          setOpen(false);
                          navigate('/profile');
                        }}
                      >
                        Lihat Profil
                      </button>
                      <div className="my-1 h-px bg-neutral-200" />
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-secondary-700 hover:bg-neutral-50" onClick={doLogout}>
                        <LogOut className="h-4 w-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="flex-1 p-3 sm:p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
