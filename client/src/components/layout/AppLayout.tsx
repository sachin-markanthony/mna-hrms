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
  Bell,
  Sun,
  Moon,
  GraduationCap ,
  HelpCircle ,
  LogOut,
} from 'lucide-react';
import { useAuth, ROLES } from '../../modules/auth';
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
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR', 'TEAM_LEADER', 'EMPLOYEE'],
      },
    ],
  },
  {
    title: 'PEOPLE & WORKFORCE',
    items: [
      {
        name: 'Employees',
        path: '/employees',
        icon: Users,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR', 'TEAM_LEADER', 'EMPLOYEE'],
      },
      {
        name: 'Time & Attendance',
        path: '/attendance',
        icon: Clock,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR', 'TEAM_LEADER', 'EMPLOYEE'],
      },
      {
        name: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR', 'TEAM_LEADER', 'EMPLOYEE'],
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
        name: 'Recruitment',
        path: '/recruitment',
        icon: Briefcase,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR', 'TEAM_LEADER'],
      },
      {
        name: 'Training & Induction',
        path: '/training',
        icon: GraduationCap,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR', 'TEAM_LEADER', 'EMPLOYEE'],
      },
      {
        name: 'Official Letters Releasing',
        path: '/letters',
        icon: FileCheck,
        roles: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR'],
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
  const navigate = useNavigate();
  const location = useLocation();
  const[menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;
  const roleConfig = ROLES[user.role] || { title: user.role, scope: 'Global' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'MA';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0b1324] text-slate-800 dark:text-slate-100 flex font-sans antialiased select-none">
      {/* ====================================================
          SIDEBAR - Fixed height with Independent Scroll
          ==================================================== */}
      <aside
        className={`h-screen bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20 shrink-0 overflow-hidden ${
          collapsed ? 'w-20' : 'w-[260px]'
        }`}
      >
        {/* Brand Header (Non-scrolling - Click to expand when collapsed) */}
        <div
          onClick={collapsed ? () => setCollapsed(false) : undefined}
          className={`h-16 px-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 ${
            collapsed ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors' : ''
          }`}
          title={collapsed ? 'Click to expand sidebar' : undefined}
        >
          <BrandLogo size="md" collapsed={collapsed} showSubtitle={true} />
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Categorized Navigation (Independent Scroll) */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
          {NAVIGATION_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => item.roles.includes(user.role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3.5 text-[13px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    {section.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  const badge = item.badge;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      title={collapsed ? item.name : undefined}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-semibold transition-all duration-150 cursor-pointer ${
                        active
                          ? 'bg-[#072b53] dark:bg-[#1e3a8a] text-white shadow-xs border-l-4 border-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-[18px] h-[18px] shrink-0 ${
                            active ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!collapsed && badge && (
                        <span
                          className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
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

        {/* Sidebar Footer with User Profile & Logout (Pinned to Bottom) */}
        <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
          {/* User Card */}
          <div
            className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center ${
              collapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            {/* User Initials Badge / Avatar */}
            <div
              className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#072b53] to-[#1e40af] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700"
              title={user.name}
            >
              {userInitials}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate capitalize mt-0.5">
                  {roleConfig.title || user.role.toLowerCase()}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center' : 'gap-2.5 px-3'
            } py-2.5 mt-2 text-[13px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer`}
          >
            <LogOut className="w-[18px] h-[18px] text-rose-500 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ====================================================
          MAIN WORKSPACE (Fixed height with Independent Scroll)
          ==================================================== */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header (Non-scrolling) */}
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between shrink-0 z-10 shadow-2xs transition-colors duration-200">
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

          <div className="flex items-center gap-3">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            </button>
          </div>
        </header>

        {/* Page Content View (Independent Scroll & Zero Horizontal Scroll) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
