import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Receipt,
  Briefcase,
  FileCheck,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  LogOut,
  UserX,
} from 'lucide-react';
import { useAuth, ROLES } from '../../modules/auth';
import { useTheme } from '../../services/theme';
import { notificationsApi, type PortalNotification } from '../../services/notifications.api';
import { notifyInfo } from '../../services/toast';
import { BrandLogo } from '../ui/BrandLogo';

interface NavItem {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
  permissions?: string[];
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
        permissions: ['employees:manage_all', 'documents:vault_all'],
      },
      {
        name: 'Attendance',
        path: '/attendance',
        icon: Clock,
      },
      {
        name: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
      {
        name: 'Offboarding & NOC',
        path: '/offboarding',
        icon: UserX,
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
        permissions: ['payroll:run', 'payroll:salary_manage'],
        badge: 'Nov 26',
      },
      {
        name: 'Official Letters',
        path: '/official-letters',
        icon: FileCheck,
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
        permissions: ['recruitment:manage_all', 'recruitment:question_bank_manage'],
      },
      {
        name: 'Official Letters Releasing',
        path: '/letters',
        icon: FileCheck,
        permissions: ['letters:release'],
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
        permissions: ['roles:manage'],
      },
    ],
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const seenNotifIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const fetchNotifications = async () => {
      try {
        const res = await notificationsApi.list();
        if (!active) return;
        const items = res.items || [];
        if (seenNotifIdsRef.current === null) {
          seenNotifIdsRef.current = new Set(items.map((n) => n.id));
        } else {
          const freshUnread = items.filter(
            (n) => !n.isRead && !seenNotifIdsRef.current?.has(n.id),
          );
          if (freshUnread.length > 0) {
            freshUnread.forEach((n) => seenNotifIdsRef.current?.add(n.id));
            notifyInfo(`${freshUnread[0].title}: ${freshUnread[0].message}`);
            window.dispatchEvent(new CustomEvent('hrms:new-notification'));
          }
        }
        setNotifications(items);
        setUnreadCount(res.unreadCount || 0);
      } catch {
        // non-blocking
      }
    };
    void fetchNotifications();
    const timer = setInterval(fetchNotifications, 5000);
    window.addEventListener('focus', fetchNotifications);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('focus', fetchNotifications);
    };
  }, [user]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (!user) return null;
  const roleConfig = ROLES[user.role] || { title: user.role, scope: 'Global' };

  const currentNavItem = NAVIGATION_SECTIONS.flatMap((s) => s.items).find(
    (item) => item.path === location.pathname,
  );
  const currentPageTitle = currentNavItem?.name ?? `${roleConfig.title} Portal`;

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
    <div className="h-screen w-screen overflow-hidden bg-[#f4f6fa] dark:bg-[#091020] text-slate-800 dark:text-slate-100 flex font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* ====================================================
          SIDEBAR - Fixed height with Independent Scroll
          ==================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 lg:static h-screen bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-all duration-300 z-40 shrink-0 overflow-hidden shadow-lg lg:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${collapsed ? 'w-20' : 'w-[264px]'}`}
      >
        {/* Brand Header (Non-scrolling - Click to expand when collapsed) */}
        <div
          onClick={collapsed ? () => setCollapsed(false) : undefined}
          className={`h-16 px-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 ${collapsed ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors' : ''
            }`}
          title={collapsed ? 'Click to expand sidebar' : undefined}
        >
          <BrandLogo size="md" collapsed={collapsed} showSubtitle={true} />
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Categorized Navigation (Independent Scroll) */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
          {NAVIGATION_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => {
              if (user.isOffboardedGraceAccess) {
                return item.path === '/official-letters';
              }
              return (
                !item.permissions ||
                item.permissions.length === 0 ||
                item.permissions.some((perm) => hasPermission(perm))
              );
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 mb-1.5">
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
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      title={collapsed ? item.name : undefined}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all duration-150 cursor-pointer ${active
                          ? 'bg-gradient-to-r from-[#072b53] to-[#0f3d75] dark:from-[#1e3a8a] dark:to-[#1d4ed8] text-white shadow-sm border-l-4 border-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                        }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-[17px] h-[17px] shrink-0 ${active ? 'text-amber-300' : 'text-slate-400 dark:text-slate-500'
                            }`}
                        />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!collapsed && badge && (
                        <span
                          className={`text-[10.5px] font-extrabold px-1.5 py-0.5 rounded-md ${active
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
          <div
            className={`p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center ${collapsed ? 'justify-center' : 'gap-3'
              }`}
          >
            <div
              className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#072b53] to-[#1e40af] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700"
              title={user.name}
            >
              {userInitials}
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {roleConfig.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  title="Logout"
                  aria-label="Logout"
                  className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              title="Logout"
              aria-label="Logout"
              className="w-full flex items-center justify-center py-2.5 mt-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-[17px] h-[17px] text-rose-500 shrink-0" />
            </button>
          )}
        </div>
      </aside>

      {/* ====================================================
          MAIN WORKSPACE (Fixed height with Independent Scroll)
          ==================================================== */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar Header (Non-scrolling) */}
        <header className="h-16 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-10 shadow-2xs transition-colors duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              HRMS
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">/</span>
            <span className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 truncate">
              {currentPageTitle}
            </span>
            <span className="hidden md:inline-block ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#072b53] dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
              {roleConfig.title} &bull; {roleConfig.scope} Scope
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden xl:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
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
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Notifications
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {unreadCount} unread
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={async () => {
                          await notificationsApi.markAllRead();
                          setUnreadCount(0);
                          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                        }}
                        className="text-[11px] font-semibold text-[#072b53] dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={async () => {
                            if (!n.isRead) {
                              await notificationsApi.markRead(n.id);
                              setUnreadCount((c) => Math.max(0, c - 1));
                              setNotifications((prev) =>
                                prev.map((item) =>
                                  item.id === n.id ? { ...item, isRead: true } : item,
                                ),
                              );
                            }
                            setNotifOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                            !n.isRead ? 'bg-amber-50/40 dark:bg-amber-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View (Independent Scroll & Zero Horizontal Scroll) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Confirm Logout
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to log out of{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {user.name}
                  </span>
                  &apos;s session?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutModalOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
