const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('mna_token');
  const { params, ...customConfig } = options;

  let url = `${BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  let qs = '';
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) searchParams.append(key, String(val));
    });
    qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Tunnel-Skip-Anti-Phishing-Page': '1',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, { ...customConfig, headers });
  } catch (netErr) {
    // If remote tunnel fails to connect, fallback to local backend (http://localhost:3000)
    if (!url.startsWith('http://localhost:3000') && !url.startsWith('http://127.0.0.1:3000')) {
      const localUrl = `http://localhost:3000${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}${qs ? `?${qs}` : ''}`;
      response = await fetch(localUrl, { ...customConfig, headers });
    } else {
      throw netErr;
    }
  }

  // If the remote tunnel returns 404 (route not yet deployed on remote server), fallback to local backend
  if (response.status === 404 && !url.startsWith('http://localhost:3000') && !url.startsWith('http://127.0.0.1:3000')) {
    const localUrl = `http://localhost:3000${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}${qs ? `?${qs}` : ''}`;
    try {
      const localResp = await fetch(localUrl, { ...customConfig, headers });
      if (localResp.ok) {
        response = localResp;
      }
    } catch {
      // Local backend unreachable, retain original response
    }
  }

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    localStorage.removeItem('mna_token');
    localStorage.removeItem('mna_user');
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
  }

  return data;
}

export const httpClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
