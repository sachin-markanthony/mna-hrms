import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole, LoginPayload } from './types';
import { ROLES } from './types';
import { authApi } from './auth.api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Offline / Development seed accounts for Mark Anthony Ventures roles
const SEED_ACCOUNTS: Record<UserRole, User> = {
  SUPER_ADMIN: {
    id: 'usr-01',
    name: 'Alexander Anthony',
    email: 'superadmin@markanthony.ventures',
    role: 'SUPER_ADMIN',
    department: 'Executive Leadership',
    designation: 'Managing Director',
    biometricId: 'BIO-001',
  },
  HR_ADMIN: {
    id: 'usr-02',
    name: 'Sarah Jenkins',
    email: 'hradmin@markanthony.ventures',
    role: 'HR_ADMIN',
    department: 'People Operations',
    designation: 'HR Operations Lead',
    biometricId: 'BIO-012',
  },
  HR_RECRUITER: {
    id: 'usr-03',
    name: 'Marcus Vance',
    email: 'recruiter@markanthony.ventures',
    role: 'HR_RECRUITER',
    department: 'Talent Acquisition',
    designation: 'Senior Talent Partner',
    biometricId: 'BIO-045',
  },
  TEAM_MANAGER: {
    id: 'usr-04',
    name: 'Elena Rostova',
    email: 'manager@markanthony.ventures',
    role: 'TEAM_MANAGER',
    department: 'Product & Tech',
    designation: 'Engineering Manager',
    biometricId: 'BIO-104',
  },
  EMPLOYEE: {
    id: 'usr-05',
    name: 'David Chen',
    email: 'employee@markanthony.ventures',
    role: 'EMPLOYEE',
    department: 'Product & Tech',
    designation: 'Full Stack Engineer',
    biometricId: 'BIO-209',
  },
};

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
      } catch {
        localStorage.removeItem('mna_user');
        localStorage.removeItem('mna_token');
      }
    }
    setLoading(false);

    const onExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = async (email: string, password = 'password123') => {
    setLoading(true);

    const cleanEmail = email.trim();

    // 1. Strict payload: Backend expects strictly { identifier, password }
    const payload: LoginPayload = {
      identifier: cleanEmail,
      password,
    };

    let serverError: string | null = null;

    try {
      // 2. Execute POST /auth/login
      const res = await authApi.login(payload);

      const token =
        res?.access_token ||
        res?.accessToken ||
        res?.data?.access_token ||
        res?.data?.accessToken;

      const refreshToken =
        res?.refresh_token ||
        res?.refreshToken ||
        res?.data?.refresh_token ||
        res?.data?.refreshToken;

      if (token) {
        localStorage.setItem('mna_token', token);
        if (refreshToken) {
          localStorage.setItem('mna_refresh_token', refreshToken);
        }

        // Try getting user profile directly from response or via GET /auth/me
        let profile = res.user || res.data?.user;
        if (!profile) {
          try {
            profile = await authApi.getMe();
          } catch {
            // Profile fetch optional if returned in token
          }
        }

        if (profile) {
          setUser(profile);
          setToken(token);
          localStorage.setItem('mna_user', JSON.stringify(profile));
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      serverError = err?.message || 'Authentication failed';
      const isNetworkUnreachable =
        serverError?.toLowerCase().includes('failed to fetch') ||
        serverError?.toLowerCase().includes('network') ||
        serverError?.toLowerCase().includes('econnrefused');

      // Surface real server validation/auth errors
      if (!isNetworkUnreachable) {
        setLoading(false);
        throw new Error(serverError || 'Authentication failed. Please verify credentials.');
      }
    }

    // 3. Fallback for offline development if backend is not running
    const cleanLower = cleanEmail.toLowerCase();
    let detectedRole: UserRole = 'EMPLOYEE';

    for (const [key, config] of Object.entries(ROLES)) {
      if (config.email === cleanLower) {
        detectedRole = key as UserRole;
        break;
      }
    }

    if (cleanLower.includes('superadmin') || cleanLower.startsWith('admin@')) {
      detectedRole = 'SUPER_ADMIN';
    } else if (cleanLower.includes('hradmin') || cleanLower.startsWith('hr@')) {
      detectedRole = 'HR_ADMIN';
    } else if (cleanLower.includes('recruiter')) {
      detectedRole = 'HR_RECRUITER';
    } else if (cleanLower.includes('manager')) {
      detectedRole = 'TEAM_MANAGER';
    }

    const sessionUser: User = {
      ...SEED_ACCOUNTS[detectedRole],
      email: cleanEmail,
    };
    const sessionToken = `mna_tok_${detectedRole.toLowerCase()}_${Date.now()}`;

    // Lock session into memory and storage
    setUser(sessionUser);
    setToken(sessionToken);
    localStorage.setItem('mna_user', JSON.stringify(sessionUser));
    localStorage.setItem('mna_token', sessionToken);
    setLoading(false);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('mna_user');
    localStorage.removeItem('mna_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
