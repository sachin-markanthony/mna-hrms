import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from './types';
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

    try {
      // 1. Call the consolidated Auth API endpoint
      const res = await authApi.login({ email, password });
      if (res?.access_token && res?.user) {
        setUser(res.user);
        setToken(res.access_token);
        localStorage.setItem('mna_user', JSON.stringify(res.user));
        localStorage.setItem('mna_token', res.access_token);
        setLoading(false);
        return;
      }
    } catch {
      // Backend offline or endpoint still compiling - use offline fallback
    }

    // 2. Resolve role based on entered email
    const cleanEmail = email.trim().toLowerCase();
    let detectedRole: UserRole = 'EMPLOYEE';

    for (const [key, config] of Object.entries(ROLES)) {
      if (config.email === cleanEmail) {
        detectedRole = key as UserRole;
        break;
      }
    }

    if (cleanEmail.includes('superadmin') || cleanEmail.startsWith('admin@')) {
      detectedRole = 'SUPER_ADMIN';
    } else if (cleanEmail.includes('hradmin') || cleanEmail.startsWith('hr@')) {
      detectedRole = 'HR_ADMIN';
    } else if (cleanEmail.includes('recruiter')) {
      detectedRole = 'HR_RECRUITER';
    } else if (cleanEmail.includes('manager')) {
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
