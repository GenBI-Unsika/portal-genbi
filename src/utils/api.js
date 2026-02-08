const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  /** @param {{ status:number, message:string, details?:any }} params */
  constructor({ status, message, details }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getAccessToken() {
  return localStorage.getItem('authToken');
}

export function setAccessToken(token) {
  if (!token) {
    localStorage.removeItem('authToken');
    return;
  }
  localStorage.setItem('authToken', token);
}

async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Lacak status refresh untuk menghindari race condition
let isRefreshing = false;
let refreshPromise = null;

/**
 * Coba refresh access token menggunakan cookie
 */
async function tryRefreshToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {

        setAccessToken(null);
        localStorage.removeItem('me');
        return null;
      }

      const json = await res.json();
      const newToken = json?.data?.accessToken;

      if (newToken) {
        setAccessToken(newToken);

        if (json?.data?.user) {
          localStorage.setItem('me', JSON.stringify(json.data.user));
        }
        return newToken;
      }
      return null;
    } catch {
      setAccessToken(null);
      localStorage.removeItem('me');
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * @param {string} path
 * @param {RequestInit & { body?: any, skipAuth?: boolean, _retry?: boolean }} options
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers(options.headers || {});

  const skipAuth = Boolean(options.skipAuth);
  if (!skipAuth && !headers.has('Authorization')) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: 'include',
  });

  const json = await readJsonSafe(res);


  if (res.status === 401 && !skipAuth && !options._retry) {
    const newToken = await tryRefreshToken();
    if (newToken) {

      return apiFetch(path, { ...options, _retry: true });
    }

    const message = 'Sesi login telah berakhir. Silakan login kembali.';
    throw new ApiError({ status: 401, message, details: null });
  }

  if (!res.ok) {
    const message = json?.error?.message || json?.message || res.statusText || 'Request failed';
    throw new ApiError({ status: res.status, message, details: json?.error?.details || json?.details });
  }

  return json;
}

export async function authLogin(email, password) {
  const json = await apiFetch('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: { email, password },
  });
  return json?.data;
}

export async function authGoogle(idToken) {
  const json = await apiFetch('/auth/google', {
    method: 'POST',
    skipAuth: true,
    body: { idToken },
  });
  return json?.data;
}

export async function authRefresh() {
  const json = await apiFetch('/auth/refresh', {
    method: 'POST',
    skipAuth: true,
  });
  return json?.data;
}

export async function authLogout() {
  const json = await apiFetch('/auth/logout', {
    method: 'POST',
    skipAuth: true,
  });
  return json?.data;
}

export async function fetchMe() {
  const json = await apiFetch('/me', { method: 'GET' });
  return json?.data;
}

export async function updateMyProfile(profileData) {
  const json = await apiFetch('/me/profile', {
    method: 'PATCH',
    body: profileData,
  });
  return json?.data;
}

// ───────────────────────────────────────────────
// Tim / Anggota
// ───────────────────────────────────────────────

export async function fetchTeamMembers() {
  const json = await apiFetch('/teams', { method: 'GET' });
  return json?.data || [];
}

// Admin: ambil semua anggota tim (termasuk yang tidak aktif)
export async function fetchAllTeamMembers() {
  const json = await apiFetch('/teams/admin/all', { method: 'GET' });
  return json?.data || [];
}

// Admin: buat anggota tim
export async function createTeamMember(data) {
  const json = await apiFetch('/teams', {
    method: 'POST',
    body: data,
  });
  return json?.data;
}

// Admin: update anggota tim
export async function updateTeamMember(id, data) {
  const json = await apiFetch(`/teams/${id}`, {
    method: 'PATCH',
    body: data,
  });
  return json?.data;
}

// Admin: hapus anggota tim
export async function deleteTeamMember(id) {
  const json = await apiFetch(`/teams/${id}`, {
    method: 'DELETE',
  });
  return json;
}

// ───────────────────────────────────────────────
// Divisi
// ───────────────────────────────────────────────

export async function fetchDivisions() {
  try {
    const json = await apiFetch('/divisions', { method: 'GET' });
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function fetchDivisionByKey(key) {
  try {
    const json = await apiFetch(`/divisions/${key}`, { method: 'GET' });
    return json?.data || null;
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────────
// Event / Kalender
// ───────────────────────────────────────────────

export async function fetchEvents() {
  try {
    const json = await apiFetch('/events', { method: 'GET' });
    return json?.data || [];
  } catch {
    return [];
  }
}

// ───────────────────────────────────────────────
// Integrasi Google Calendar
// ───────────────────────────────────────────────

export async function getCalendarConfig() {
  try {
    const json = await apiFetch('/calendar/config', { method: 'GET' });
    return json?.data || { isConfigured: false };
  } catch {
    return { isConfigured: false };
  }
}

export async function getGoogleCalendarUrl(eventId) {
  try {
    const json = await apiFetch(`/calendar/google-url/${eventId}`, { method: 'GET' });
    return json?.data?.url || null;
  } catch {
    return null;
  }
}

export function getExportCalendarUrl(eventId) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  if (eventId) {
    return `${baseUrl}/calendar/export/${eventId}`;
  }
  return `${baseUrl}/calendar/export`;
}

// ───────────────────────────────────────────────
// Leaderboard / Poin
// ───────────────────────────────────────────────

export async function fetchLeaderboard() {

  try {
    const json = await apiFetch('/leaderboard', { method: 'GET' });
    return json?.data || [];
  } catch {
    return [];
  }
}

// Admin: Buat record poin
export async function createPointRecord(data) {
  const json = await apiFetch('/leaderboard/points', {
    method: 'POST',
    body: data,
  });
  return json?.data;
}

// Admin: Update record poin
export async function updatePointRecord(memberId, activityIndex, data) {
  const json = await apiFetch(`/leaderboard/points/${memberId}/${activityIndex}`, {
    method: 'PATCH',
    body: data,
  });
  return json?.data;
}

// Admin: Hapus record poin
export async function deletePointRecord(memberId, activityIndex) {
  const json = await apiFetch(`/leaderboard/points/${memberId}/${activityIndex}`, {
    method: 'DELETE',
  });
  return json?.data;
}

// ───────────────────────────────────────────────
// Bendahara / Kas
// ───────────────────────────────────────────────

export async function fetchTreasuryRecap() {
  try {
    const json = await apiFetch('/treasury', { method: 'GET' });
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function createTreasuryRecord(data) {

  const json = await apiFetch('/treasury', {
    method: 'POST',
    body: data,
  });
  return json?.data;
}

export async function updateTreasuryRecord(memberId, period, data) {

  const json = await apiFetch('/treasury', {
    method: 'POST',
    body: { memberId, period, ...data },
  });
  return json?.data;
}

export async function updateTreasuryMember(memberId, monthsData) {

  const json = await apiFetch(`/treasury/member/${memberId}`, {
    method: 'PUT',
    body: monthsData,
  });
  return json?.data;
}

export async function deleteTreasuryRecord(memberId, period) {
  const json = await apiFetch(`/treasury/${memberId}/${period}`, {
    method: 'DELETE',
  });
  return json;
}

// ───────────────────────────────────────────────
// Master Data
// ───────────────────────────────────────────────

export async function fetchFaculties() {
  const json = await apiFetch('/master-data/faculties', { method: 'GET' });
  return json?.data || [];
}

export async function fetchStudyPrograms(facultyId) {
  const url = facultyId ? `/master-data/study-programs?facultyId=${facultyId}` : '/master-data/study-programs';
  const json = await apiFetch(url, { method: 'GET' });
  return json?.data || [];
}

// ───────────────────────────────────────────────
// Poin Saya
// ───────────────────────────────────────────────

export async function fetchMyPoints() {
  try {
    const json = await apiFetch('/me/points', { method: 'GET' });
    return json?.data || { total: 0, breakdown: [], history: [] };
  } catch {
    return { total: 0, breakdown: [], history: [] };
  }
}

// ───────────────────────────────────────────────
// Uang Kas Saya
// ───────────────────────────────────────────────

export async function fetchMyTreasury() {
  try {
    const json = await apiFetch('/me/treasury', { method: 'GET' });
    return json?.data || { entries: [], summary: { paid: 0, unpaid: 0 } };
  } catch {
    return { entries: [], summary: { paid: 0, unpaid: 0 } };
  }
}

// ───────────────────────────────────────────────
// Dispensasi
// ───────────────────────────────────────────────

export async function fetchMyDispensations() {
  try {
    const json = await apiFetch('/dispensations/me', { method: 'GET' });
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function createDispensation(data) {
  const json = await apiFetch('/dispensations', {
    method: 'POST',
    body: data,
  });
  return json?.data;
}

// Member: Update dispensasi saya (hanya jika masih DIAJUKAN)
export async function updateDispensation(id, data) {
  const json = await apiFetch(`/dispensations/${id}`, {
    method: 'PATCH',
    body: data,
  });
  return json?.data;
}

// Member: Tarik kembali (hapus) dispensasi saya
export async function deleteDispensation(id) {
  const json = await apiFetch(`/dispensations/${id}`, {
    method: 'DELETE',
  });
  return json;
}

// Admin: Ambil semua dispensasi
export async function fetchAllDispensations() {
  try {
    const json = await apiFetch('/dispensations', { method: 'GET' });
    return json?.data || [];
  } catch {
    return [];
  }
}

// Admin: Update status dispensasi
export async function updateDispensationStatus(id, data) {
  const json = await apiFetch(`/dispensations/${id}/status`, {
    method: 'PATCH',
    body: data,
  });
  return json?.data;
}

// Admin: Ambil template dispensasi aktif
export async function fetchDispensationTemplate() {
  try {
    const json = await apiFetch('/dispensations/template/active', { method: 'GET' });
    return json?.data;
  } catch {
    return null;
  }
}

// Admin: Upload template dispensasi
export async function uploadDispensationTemplate(file) {
  const formData = new FormData();
  formData.append('template', file);

  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/dispensations/template/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const json = await readJsonSafe(res);
    throw new ApiError({
      status: res.status,
      message: json?.message || 'Upload template gagal',
      details: json?.details,
    });
  }

  return await res.json();
}

// Admin: Hapus template dispensasi
export async function deleteDispensationTemplate(id) {
  const json = await apiFetch(`/dispensations/template/${id}`, {
    method: 'DELETE',
  });
  return json;
}

// Admin: Generate surat untuk dispensasi yang disetujui
export async function generateDispensationLetter(id) {
  const json = await apiFetch(`/dispensations/${id}/generate-letter`, {
    method: 'POST',
  });
  return json?.data;
}
