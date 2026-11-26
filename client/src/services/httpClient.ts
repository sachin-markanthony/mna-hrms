const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function fetchWithTunnelFallback(
  endpoint: string,
  qs: string,
  init: RequestInit,
): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL.replace(/\/$/, '')}${cleanEndpoint}${qs ? `?${qs}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (netErr) {
    if (!url.startsWith('http://localhost:3000') && !url.startsWith('http://127.0.0.1:3000')) {
      const localUrl = `http://localhost:3000${cleanEndpoint}${qs ? `?${qs}` : ''}`;
      response = await fetch(localUrl, init);
    } else {
      throw netErr;
    }
  }

  if (response.status === 404 && !url.startsWith('http://localhost:3000') && !url.startsWith('http://127.0.0.1:3000')) {
    const localUrl = `http://localhost:3000${cleanEndpoint}${qs ? `?${qs}` : ''}`;
    try {
      const localResp = await fetch(localUrl, init);
      if (localResp.ok) {
        response = localResp;
      }
    } catch {
      // Local backend unreachable, retain original response
    }
  }

  return response;
}

function clearSessionAndExpire() {
  localStorage.removeItem('mna_token');
  localStorage.removeItem('mna_refresh_token');
  localStorage.removeItem('mna_user');
  window.dispatchEvent(new CustomEvent('auth:expired'));
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('mna_refresh_token');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetchWithTunnelFallback('/auth/refresh', '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tunnel-Skip-Anti-Phishing-Page': '1',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = await response.json().catch(() => null);
      const newAccessToken: string | undefined =
        payload?.accessToken ||
        payload?.access_token ||
        payload?.data?.accessToken ||
        payload?.data?.access_token;

      const newRefreshToken: string | undefined =
        payload?.refreshToken ||
        payload?.refresh_token ||
        payload?.data?.refreshToken ||
        payload?.data?.refresh_token;

      const refreshedUser = payload?.user || payload?.data?.user;

      if (!newAccessToken) {
        return null;
      }

      localStorage.setItem('mna_token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('mna_refresh_token', newRefreshToken);
      }
      if (refreshedUser) {
        localStorage.setItem('mna_user', JSON.stringify(refreshedUser));
      }

      window.dispatchEvent(
        new CustomEvent('auth:refreshed', {
          detail: { token: newAccessToken, user: refreshedUser },
        }),
      );

      return newAccessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('mna_token');
  const { params, _retry, ...customConfig } = options;

  let qs = '';
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) searchParams.append(key, String(val));
    });
    qs = searchParams.toString();
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Tunnel-Skip-Anti-Phishing-Page': '1',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  const response = await fetchWithTunnelFallback(endpoint, qs, {
    ...customConfig,
    headers,
  });

  const isAuthEndpoint =
    endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh');

  if (response.status === 401 && !isAuthEndpoint) {
    if (!_retry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request<T>(endpoint, {
          ...options,
          _retry: true,
        });
      }
    }

    clearSessionAndExpire();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.message || data?.error || `Request failed with status ${response.status}`;
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

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
