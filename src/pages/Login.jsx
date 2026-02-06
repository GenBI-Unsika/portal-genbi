import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, loginWithGoogle } from '../utils/auth.js';
import { useToast } from '../components/Toast.jsx';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// Keys for localStorage form persistence (NOT for auth data)
const FORM_STORAGE_KEY = 'portal_login_form_draft';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const { confirm } = useConfirm();

  // Restore form draft on mount (untuk UX agar tidak hilang jika error)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const { email: savedEmail, rememberMe: savedRemember } = JSON.parse(saved);
        if (savedEmail) setEmail(savedEmail);
        if (savedRemember) setRememberMe(savedRemember);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save form draft when email changes (NOT password for security)
  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ email, rememberMe }));
    }
  }, [email, rememberMe]);

  const clearFormDraft = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  const validateForm = () => {
    if (!email.trim()) {
      toast.push('Email wajib diisi', 'warning');
      return false;
    }
    if (!email.includes('@')) {
      toast.push('Format email tidak valid', 'warning');
      return false;
    }
    if (!password) {
      toast.push('Password wajib diisi', 'warning');
      return false;
    }
    if (password.length < 6) {
      toast.push('Password minimal 6 karakter', 'warning');
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Confirm before login
    const ok = await confirm({
      title: 'Masuk?',
      description: `Anda akan login sebagai "${email.trim()}".`,
      confirmText: 'Masuk',
      cancelText: 'Batal',
    });
    if (!ok) return;

    setLoading(true);
    setError('');

    try {
      await login(email, password);

      // Clear form draft after successful login
      if (!rememberMe) {
        clearFormDraft();
      }

      toast.push('Login berhasil! Selamat datang.', 'success');

      const next = loc.state?.from?.pathname || '/';
      nav(next, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Login gagal. Periksa email dan password Anda.';
      setError(msg);
      toast.push(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken) => {
    setLoading(true);
    setError('');

    try {
      await loginWithGoogle(idToken);
      clearFormDraft();
      toast.push('Login dengan Google berhasil!', 'success');

      const next = loc.state?.from?.pathname || '/';
      nav(next, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Login Google gagal';
      setError(msg);
      toast.push(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (msg) => {
    const text = msg || 'Login Google gagal';
    setError(text);
    toast.push(text, 'error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 animate-scale-in">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/favicon-genbi.webp"
            alt="GenBI Unsika"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">Masuk</h1>
        <p className="text-sm text-center text-neutral-500 mb-6">Masukkan email dan password Anda di bawah ini untuk masuk.</p>

        {/* Error Alert */}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@student.unsika.ac.id"
              className="w-full h-11 px-4 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-neutral-700">Password</label>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                onClick={() => {
                  toast.push('Fitur lupa password akan segera tersedia. Hubungi admin untuk reset password.', 'info');
                }}
              >
                Lupa password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-4 pr-12 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" disabled={loading} />
            <label htmlFor="rememberMe" className="text-sm text-neutral-600 select-none cursor-pointer">
              Ingat saya
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-neutral-400">atau masuk dengan</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLoginButton onIdToken={handleGoogleLogin} onError={handleGoogleError} />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            Tidak memiliki akun?{' '}
            <button
              type="button"
              onClick={() => {
                toast.push('Pendaftaran akun dilakukan melalui admin GenBI. Hubungi pengurus untuk info lebih lanjut.', 'info');
              }}
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Daftar
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
