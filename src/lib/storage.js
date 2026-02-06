export const KEYS = {
  TOKEN: 'genbi:token:v1',
  USER: 'genbi:user:v1',
  PROFILE: 'genbi:profile:v1',
  RANK: 'genbi:rank:v1',
};

export const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const getJSON = (k, fallback = null) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
export const removeKey = (k) => localStorage.removeItem(k);

// Generate unique ID
export const uid = () => Math.random().toString(36).substring(2, 9);
