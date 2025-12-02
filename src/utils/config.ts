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

// Cache for discovered API URL
let discoveredApiUrl: string | null = null;

/**
 * Try to connect to a backend URL with a short timeout
 */
const tryConnect = async (url: string, timeout = 2000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Try multiple URLs in parallel and return the first one that works
 * Optimized to handle large lists by batching
 */
const tryMultipleUrls = async (urls: string[], timeout = 1500): Promise<string | null> => {
  // Process in batches to avoid overwhelming the network
  const BATCH_SIZE = 50;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);

    // Try the current batch
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const works = await tryConnect(url, timeout);
        if (works) return url;
        throw new Error('Connection failed');
      })
    );

    // Check if any succeeded in this batch
    for (const result of results) {
      if (result.status === 'fulfilled') {
        return result.value;
      }
    }

    // Optional: small delay between batches to let network breathe
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return null;
};

/**
 * Build a small set of likely backend URLs to try
 */
const buildCandidateUrls = (): string[] => {
  const urls = new Set<string>();

  const addUrl = (candidate: string) => {
    urls.add(candidate.replace(/\/$/, ''));
  };

  // Localhost defaults (covers known backend ports)
  const ports = [5001, 5005, 5010];
  for (const port of ports) {
    addUrl(`http://localhost:${port}/api`);
    addUrl(`http://127.0.0.1:${port}/api`);
  }

  // Current hostname (works for network access)
  if (hasWindow && window.location.hostname) {
    const host = window.location.hostname;
    // Skip if it's already localhost or 127.0.0.1
    if (host !== 'localhost' && host !== '127.0.0.1') {
      for (const port of ports) {
        addUrl(`http://${host}:${port}/api`);
      }
    }
  }

  // Common private network IP ranges (for LAN access)
  // This helps when accessing from other devices on the same network
  if (hasWindow && window.location.hostname) {
    const host = window.location.hostname;

    // If we're accessing via a network IP, prioritize it
    const isPrivateIP = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host);

    if (isPrivateIP) {
      // Prioritize the current network IP by adding it first
      for (const port of ports) {
        addUrl(`http://${host}:${port}/api`);
      }
    }
  }

  return Array.from(urls);
};

/**
 * Auto-discover the backend API URL by trying multiple addresses
 * SCENARIO B: Simplified for Public URL (Ngrok) - no network scanning
 */
export const discoverApiUrl = async (onStatus?: (status: string) => void): Promise<string> => {
  const updateStatus = (msg: string) => {
    console.log(`[Config] ${msg}`);
    onStatus?.(msg);
  };

  // If we already discovered a working URL, verify it still works
  if (discoveredApiUrl) {
    const stillReachable = await tryConnect(discoveredApiUrl);
    if (stillReachable) {
      updateStatus(`Using cached URL: ${discoveredApiUrl}`);
      return discoveredApiUrl;
    }
    updateStatus(`Cached URL failed health check, re-discovering...`);
    discoveredApiUrl = null;
  }

  // Check localStorage first (this is where the Ngrok URL will be saved)
  const storedUrl = loadStoredUrl();
  if (storedUrl) {
    updateStatus(`Validating saved URL: ${storedUrl}`);
    if (await tryConnect(storedUrl)) {
      updateStatus(`Using saved URL: ${storedUrl}`);
      discoveredApiUrl = storedUrl;
      return storedUrl;
    }
    updateStatus(`Saved URL unreachable. Please verify it in Settings.`);
    if (hasLocalStorage()) {
      try {
        window.localStorage.removeItem('api_url');
      } catch { }
    }
  }

  // Environment variable URL (for production builds)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    updateStatus(`Validating environment URL: ${envUrl}`);
    if (await tryConnect(envUrl)) {
      updateStatus(`Using environment URL: ${envUrl}`);
      discoveredApiUrl = envUrl;
      return envUrl;
    }
    updateStatus(`Environment URL unreachable. Falling back to discovery.`);
  }

  updateStatus(`Scanning common local URLs (ports 5001, 5005, 5010)...`);
  const candidateUrls = buildCandidateUrls();
  const discovered = await tryMultipleUrls(candidateUrls, 2000);

  if (discovered) {
    updateStatus(`✓ Connected via ${discovered}`);
    discoveredApiUrl = discovered;
    return discovered;
  }

  // Default fallback - user must set URL in settings
  const fallback = 'http://localhost:5001/api';
  updateStatus(`⚠ No working URL found. Please set the backend URL in Settings.`);
  return fallback;
};

const saveUrl = (url: string) => {
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem('api_url', url);
    } catch { }
  }
};

/**
 * Get API URL synchronously (uses cached value or fallback)
 */
export const getApiUrl = (): string => {
  if (discoveredApiUrl) return discoveredApiUrl;

  const storedUrl = loadStoredUrl();
  if (storedUrl) return storedUrl;

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  if (hasWindow && window.location.hostname) {
    return `http://${window.location.hostname}:5001/api`;
  }

  return 'http://localhost:5001/api';
};

export const setApiUrl = (url: string) => {
  if (!hasLocalStorage()) return;
  let cleanUrl = url.trim().replace(/\/$/, '');

  // Ensure URL ends with /api
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl += '/api';
  }

  window.localStorage.setItem('api_url', cleanUrl);
  discoveredApiUrl = cleanUrl;
  window.location.reload();
};

export const resetApiUrl = () => {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem('api_url');
  discoveredApiUrl = null;
  window.location.reload();
};

export const clearApiCache = () => {
  discoveredApiUrl = null;
};

/**
 * Set the discovered URL directly (used after successful discovery)
 */
export const setDiscoveredUrl = (url: string) => {
  discoveredApiUrl = url;
};
