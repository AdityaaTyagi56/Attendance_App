const hasWindow = typeof window !== 'undefined';
const hasLocalStorage = () => {
  try {
    return hasWindow && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const loadStoredUrl = () => {
  if (!hasLocalStorage()) return null;
  try {
    return window.localStorage.getItem('api_url');
  } catch {
    return null;
  }
};

export const getApiUrl = () => {
  const storedUrl = loadStoredUrl();
  if (storedUrl) return storedUrl;

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  if (hasWindow) {
    return `http://${window.location.hostname || 'localhost'}:5001/api`;
  }

  // Safe fallback when no window (tests, SSR, etc.)
  return 'http://localhost:5001/api';
};

export const setApiUrl = (url: string) => {
  if (!hasLocalStorage()) return;
  const cleanUrl = url.trim().replace(/\/$/, '');
  window.localStorage.setItem('api_url', cleanUrl);
  window.location.reload();
};

export const resetApiUrl = () => {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem('api_url');
  window.location.reload();
};
