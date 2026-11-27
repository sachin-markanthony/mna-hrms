import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { ROLES, useAuth } from '../../../auth';
import { useTheme } from '../../../../services/theme';
import type { ChapterView, InductionNotification } from '../../types/learning.types';

interface InductionTopbarProps {
  chapters: ChapterView[];
  notifications: InductionNotification[];
  onOpenMobileSidebar: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

interface SearchResult {
  chapter: ChapterView;
  path: string;
  available: boolean;
  reason: string;
}

function getBreadcrumbTrail(pathname: string, chapters: ChapterView[]) {
  if (pathname === '/induction' || pathname === '/induction/overview') {
    return [{ label: 'Employee Induction', to: '/induction' }];
  }
  if (pathname.startsWith('/induction/chapters')) {
    const match = pathname.match(/\/induction\/chapters\/(\d+)(\/assessment|\/result)?/);
    if (match) {
      const chapterNumber = Number(match[1]);
      const chapter = chapters.find((item) => item.chapterNumber === chapterNumber);
      const suffix = match[2];
      return [
        { label: 'Learning Chapters', to: '/induction/chapters' },
        {
          label: chapter ? `Chapter ${chapter.chapterNumber}` : `Chapter ${chapterNumber}`,
          to: `/induction/chapters/${chapterNumber}`,
        },
        ...(suffix
          ? [
            {
              label: suffix === '/assessment' ? 'Assessment' : 'Result',
              to: pathname,
            },
          ]
          : []),
      ];
    }
    return [{ label: 'Learning Chapters', to: '/induction/chapters' }];
  }
  if (pathname === '/induction/assessments') {
    return [{ label: 'My Assessments', to: pathname }];
  }
  if (pathname === '/induction/progress') {
    return [{ label: 'My Progress', to: pathname }];
  }
  if (pathname === '/induction/support') {
    return [{ label: 'Help & Support', to: pathname }];
  }
  if (pathname === '/induction/reference') {
    return [{ label: 'Reference Notes', to: pathname }];
  }
  if (pathname === '/induction/final-assessment') {
    return [{ label: 'The Grand Final Quiz', to: pathname }];
  }
  return [];
}

export function InductionTopbar({
  chapters,
  notifications,
  onOpenMobileSidebar,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}: InductionTopbarProps) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const trail = getBreadcrumbTrail(location.pathname, chapters);
  const roleConfig = user ? ROLES[user.role] : null;

  useEffect(() => {
    setSearchOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return chapters
      .filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(query) ||
          chapter.description.toLowerCase().includes(query) ||
          `chapter ${chapter.chapterNumber}`.includes(query),
      )
      .slice(0, 7)
      .map((chapter) => {
        if (chapter.kind === 'reference') {
          return {
            chapter,
            path: '/induction/reference',
            available: true,
            reason: 'Reference',
          };
        }
        if (chapter.kind === 'final_assessment') {
          return {
            chapter,
            path: '/induction/final-assessment',
            available: chapter.isUnlocked,
            reason: chapter.isUnlocked ? 'Final assessment' : 'Complete all 18 chapters',
          };
        }
        return {
          chapter,
          path: `/induction/chapters/${chapter.chapterNumber}`,
          available: chapter.isUnlocked,
          reason: chapter.isUnlocked
            ? chapter.completed
              ? 'Review chapter'
              : 'Open chapter'
            : 'Locked',
        };
      });
  }, [chapters, searchQuery]);

  const openResult = (result: SearchResult) => {
    if (!result.available) return;
    setSearchQuery('');
    setSearchOpen(false);
    navigate(result.path);
  };

  const handleNotificationClick = (notification: InductionNotification) => {
    onMarkNotificationRead(notification.id);
    if (notification.actionPath) {
      setNotificationsOpen(false);
      navigate(notification.actionPath);
    }
  };

  return (
    <header className="induction-topbar z-10 h-16 shrink-0 border-b border-[#E9DED2] bg-[#FFFCF7]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="induction-topbar-control rounded-lg border border-[#E9DED2] bg-white p-2 text-[#3B2314] shadow-sm transition hover:bg-[#F8F1E7] lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div className="hidden items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#A09182] sm:flex">
              <Link to="/dashboard" className="transition hover:text-[#3B2314]">
                HRMS
              </Link>
              <span className="text-slate-300">/</span>
              {trail.map((item) => (
                <span key={`${item.to}-${item.label}`} className="flex min-w-0 items-center gap-2">
                  {item !== trail[0] && <span className="text-slate-300">/</span>}
                  <Link
                    to={item.to}
                    className={`max-w-[180px] truncate transition hover:text-[#3B2314] ${item === trail[trail.length - 1]
                        ? 'text-sm font-bold normal-case tracking-normal text-[#3B2314]'
                        : ''
                      }`}
                  >
                    {item.label}
                  </Link>
                </span>
              ))}
            </div>
            <span className="truncate text-sm font-bold text-[#3B2314] sm:hidden">
              {trail[trail.length - 1]?.label ?? 'Employee Induction'}
            </span>
            {roleConfig && (
              <span className="induction-role-badge hidden shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold md:inline-flex">
                {roleConfig.title} &bull; {roleConfig.scope} Scope
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <div ref={searchRef} className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A09182]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchResults[0]?.available) {
                  openResult(searchResults[0]);
                }
              }}
              placeholder="Search chapters…"
              aria-label="Search induction chapters"
              className="induction-topbar-control w-44 rounded-xl border border-[#E9DED2] bg-white py-2 pl-9 pr-3 text-[11px] font-medium text-[#3B2314] shadow-sm outline-none transition placeholder:text-[#B3A597] focus:border-[#C9A46A] focus:ring-2 focus:ring-[#B8893A]/15 lg:w-60"
            />

            {searchOpen && searchQuery.trim() && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-[#E9DED2] bg-white shadow-[0_18px_50px_rgba(59,35,20,0.14)]">
                <div className="flex items-center justify-between border-b border-[#F0E7DC] px-3.5 py-2.5">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#A09182]">
                    Search results
                  </span>
                  <span className="text-[10px] font-semibold text-[#A09182]">
                    {searchResults.length} found
                  </span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs font-bold text-[#3B2314]">No chapters found</p>
                    <p className="mt-1 text-[11px] text-[#8A7A6C]">
                      Try a topic such as “pricing”, “RERA” or “commission”.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto p-1.5">
                    {searchResults.map((result) => (
                      <button
                        key={result.chapter.chapterNumber}
                        type="button"
                        disabled={!result.available}
                        onClick={() => openResult(result)}
                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${result.available
                            ? 'hover:bg-[#FBF5EA]'
                            : 'cursor-not-allowed opacity-60'
                          }`}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F7F0E4] text-[10px] font-extrabold text-[#9A7A45]">
                          {result.chapter.chapterNumber}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11.5px] font-bold text-[#3B2314]">
                            {result.chapter.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-[#8A7A6C]">
                            {result.reason}
                          </span>
                        </span>
                        {result.available ? (
                          <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#B8893A]" />
                        ) : (
                          <LockKeyhole className="mt-1 h-3.5 w-3.5 shrink-0 text-[#A09182]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="induction-topbar-date hidden items-center rounded-full border px-3 py-1 text-[11px] font-semibold xl:inline-flex">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            className="induction-topbar-control rounded-lg border p-2 transition"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
              }}
              className="induction-topbar-control relative rounded-xl border border-[#E9DED2] bg-white p-2 text-[#5F4B3C] shadow-sm transition hover:bg-[#F8F1E7]"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B8893A] px-1 text-[8px] font-extrabold text-white ring-2 ring-[#FFFCF7]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-2xl border border-[#E9DED2] bg-white shadow-[0_18px_50px_rgba(59,35,20,0.14)] sm:w-[380px]">
                <div className="flex items-center justify-between border-b border-[#F0E7DC] px-4 py-3">
                  <div>
                    <p className="text-[11px] font-extrabold text-[#3B2314]">Notifications</p>
                    <p className="text-[9.5px] font-semibold text-[#A09182]">
                      {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllNotificationsRead}
                      className="text-[10px] font-bold text-[#8A6427] underline decoration-[#D9BE92] underline-offset-4 transition hover:text-[#3B2314]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-1.5">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-[11px] text-[#8A7A6C]">
                      You are all caught up.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#FBF5EA] ${notification.read ? 'opacity-70' : ''
                          }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${notification.tone === 'success'
                              ? 'bg-[#EEF6F0] text-[#356B4A]'
                              : notification.tone === 'warning'
                                ? 'bg-[#FDF3E1] text-[#9A6420]'
                                : 'bg-[#F3F6F8] text-[#406B7A]'
                            }`}
                        >
                          {notification.tone === 'success' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : notification.tone === 'warning' ? (
                            <AlertCircle className="h-3.5 w-3.5" />
                          ) : (
                            <Bell className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#3B2314]">
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8893A]" />
                            )}
                          </span>
                          <span className="mt-0.5 block text-[10.5px] leading-5 text-[#7A6A5C]">
                            {notification.message}
                          </span>
                          {notification.actionLabel && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#8A6427]">
                              {notification.actionLabel}
                              <ChevronRight className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
