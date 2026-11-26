import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginPayload } from './types';
import { authApi } from './auth.api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mna_user');
    const savedToken = localStorage.getItem('mna_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        // Sync live role & permissions from backend on reload
        authApi
          .getMe()
          .then((freshProfile) => {
            if (freshProfile) {
              setUser(freshProfile);
              localStorage.setItem('mna_user', JSON.stringify(freshProfile));
            }
          })
          .catch(() => {
            // Token refresh/expiry handled by httpClient
          });
      } catch {
        localStorage.removeItem('mna_user');
        localStorage.removeItem('mna_token');
        localStorage.removeItem('mna_refresh_token');
      }
    }
    setLoading(false);

    const onExpired = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('mna_refresh_token');
    };
    const onRefreshed = (event: Event) => {
      const detail = (event as CustomEvent<{ token?: string; user?: User }>).detail;
      if (detail?.token) setToken(detail.token);
      if (detail?.user) setUser(detail.user);
    };
    window.addEventListener('auth:expired', onExpired);
    window.addEventListener('auth:refreshed', onRefreshed);
    return () => {
      window.removeEventListener('auth:expired', onExpired);
      window.removeEventListener('auth:refreshed', onRefreshed);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const payload: LoginPayload = {
        email: email.trim(),
        password,
      };

      const res = await authApi.login(payload);

      const accessToken =
        res?.accessToken ||
        res?.access_token ||
        res?.data?.accessToken ||
        res?.data?.access_token;

      const refreshToken =
        res?.refreshToken ||
        res?.refresh_token ||
        res?.data?.refreshToken ||
        res?.data?.refresh_token;

      if (!accessToken) {
        throw new Error('Authentication failed: no access token returned by server.');
      }

      localStorage.setItem('mna_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('mna_refresh_token', refreshToken);
      }

      const profile = res.user || res.data?.user || (await authApi.getMe());
      if (!profile) {
        throw new Error('Authentication failed: unable to load user profile.');
      }

      setUser(profile);
      setToken(accessToken);
      localStorage.setItem('mna_user', JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('mna_user');
    localStorage.removeItem('mna_token');
    localStorage.removeItem('mna_refresh_token');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, hasPermission, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
