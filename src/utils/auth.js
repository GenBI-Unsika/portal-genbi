import { authGoogle, authLogin, authLogout, authRefresh, fetchMe, getAccessToken, setAccessToken } from './api.js';

export function isAuthed() {
  return Boolean(getAccessToken());
}

export function getMe() {
  try {
    return JSON.parse(localStorage.getItem('me') || '{}') || {};
  } catch {
    return {};
  }
}

export function setMe(next) {
  localStorage.setItem('me', JSON.stringify(next || {}));
}

export async function login(email, password) {
  const data = await authLogin(email, password);
  setAccessToken(data?.accessToken);
  setMe(data?.user);
  return true;
}

export async function loginWithGoogle(idToken) {
  const data = await authGoogle(idToken);
  setAccessToken(data?.accessToken);
  setMe(data?.user);
  return true;
}

export async function logout() {
  try {
    await authLogout();
  } finally {
    setAccessToken(null);
    localStorage.removeItem('me');
  }
}

export async function ensureAuthed() {
  if (getAccessToken()) return true;

  try {
    const data = await authRefresh();
    setAccessToken(data?.accessToken);
    setMe(data?.user);
    return Boolean(data?.accessToken);
  } catch {
    setAccessToken(null);
    localStorage.removeItem('me');
    return false;
  }
}

export async function syncMe() {
  const me = await fetchMe();
  setMe(me);
  return me;
}
