import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Receipt,
  Briefcase,
  GraduationCap,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, ROLES } from '../../modules/auth';
import { useTrainingSummary } from '../../modules/onboarding/hooks/useInductionStore';
import { useTheme } from '../../services/theme';
import { BrandLogo } from '../ui/BrandLogo';

interface NavItem {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
  roles: string[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_RECRUITER', 'TEAM_MANAGER', 'EMPLOYEE'],
      },
    ],
  },
  {
    title: 'PEOPLE & WORKFORCE',
    items: [
      {
        name: 'Employees & KYC Vault',
        path: '/employees',
        icon: Users,
        roles: ['SUPER_ADMIN', 'HR_ADMIN'],
        badge: '148',
      },
      {
        name: 'Time & Attendance',
        path: '/attendance',
        icon: Clock,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'TEAM_MANAGER', 'EMPLOYEE'],
      },
      {
        name: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'TEAM_MANAGER', 'EMPLOYEE'],
        badge: '3 Req',
      },
    ],
  },
  {
    title: 'FINANCE & PAYROLL',
    items: [
      {
        name: 'Payroll Engine',
        path: '/payroll',
        icon: Receipt,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'EMPLOYEE'],
        badge: 'Nov 26',
      },
    ],
  },
  {
    title: 'TALENT & OPERATIONS',
    items: [
      {
        name: 'Recruitment & Pipeline',
        path: '/recruitment',
        icon: Briefcase,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_RECRUITER', 'TEAM_MANAGER'],
      },
      {
        name: 'Training & Induction',
        path: '/training',
        icon: GraduationCap,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'TEAM_MANAGER', 'EMPLOYEE'],
      },
      {
        name: 'Official Letters Releasing',
        path: '/letters',
        icon: FileCheck,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_RECRUITER'],
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      {
        name: 'Master Settings & RBAC',
        path: '/settings',
        icon: Settings,
        roles: ['SUPER_ADMIN', 'HR_ADMIN'],
      },
    ],
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const trainingSummary = useTrainingSummary();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;
  const roleConfig = ROLES[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1324] text-slate-800 dark:text-slate-100 flex font-sans antialiased transition-colors duration-200">
      {/* ====================================================
          ENLARGED SIDEBAR (280px) - Mark Anthony Brand Style
          ==================================================== */}
      <aside
        className={`bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20 shrink-0 ${
          collapsed ? 'w-22' : 'w-[280px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <BrandLogo
            size="md"
            collapsed={collapsed}
            showSubtitle={true}
          />
        </div>

        {/* Dynamic Categorized Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
          {NAVIGATION_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => item.roles.includes(user.role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1.5">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    {section.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  const badge =
                    item.path === '/training'
                      ? `${trainingSummary.overallPercentage}%`
                      : item.badge;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      title={collapsed ? item.name : undefined}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                        active
                          ? 'bg-[#072b53] dark:bg-[#1e3a8a] text-white shadow-sm border-l-4 border-amber-400'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-5 h-5 shrink-0 ${
                            active ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!collapsed && badge && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-700 dark:text-slate-300">Self-Hosted Cluster</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">v1.0.0 &bull; Postgres</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition mx-auto border border-slate-200 dark:border-slate-700 cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* ====================================================
          MAIN WORKSPACE
          ==================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              WORKSPACE
            </span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {roleConfig.title} Portal
            </span>
            <span className="hidden sm:inline-block ml-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {roleConfig.scope} Scope
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#072b53] text-white flex items-center justify-center text-xs font-black ring-2 ring-slate-100 dark:ring-slate-700">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111c35] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                      {roleConfig.title} &bull; {roleConfig.scope} Scope
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/training');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      My Profile &amp; QR Badge
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Security &amp; Preferences
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
