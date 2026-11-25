import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Menu,
} from 'lucide-react';
import type { Employee, InductionNotification, InductionChapter } from '../types/induction.types';

interface InductionHeaderProps {
  employee: Employee | null;
  notifications: InductionNotification[];
  chapters: InductionChapter[];
  onSelectChapter: (chapter: InductionChapter) => void;
  onOpenMobileSidebar: () => void;
  onMarkNotificationRead: (id: string) => void;
}

export const InductionHeader: React.FC<InductionHeaderProps> = ({
  employee,
  notifications,
  chapters,
  onSelectChapter,
  onOpenMobileSidebar,
  onMarkNotificationRead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Filter chapters based on search query
  const filteredChapters = searchQuery.trim()
    ? chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.chapterNumber.toString().includes(searchQuery) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD8] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Title & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-[#2B1810] hover:bg-[#EFE7DE] transition"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>

            <h1 className="text-lg sm:text-xl font-bold text-[#2B1810] tracking-tight flex items-center gap-2">
              <span>Employee Induction</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-[#F5ECE1] text-[#7A4E2D] px-2 py-0.5 rounded-md border border-[#D9C3B0]">
                <Sparkles className="w-2.5 h-2.5 text-[#B8860B]" />
                MA Ventures Induction Portal
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Search Bar with Live Chapter Query */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search handbook chapters, sessions, real estate topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#DDD3C9] focus:outline-none focus:ring-2 focus:ring-[#8C6D37]/30 focus:border-[#8C6D37] text-[#2B1810] placeholder-stone-400 shadow-2xs"
            />
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E0D5CB] rounded-xl shadow-lg max-h-72 overflow-y-auto p-2 z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Handbook Chapters ({filteredChapters.length} matched)
              </div>
              {filteredChapters.length > 0 ? (
                filteredChapters.map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      onSelectChapter(chap);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#FAF7F2] flex items-center justify-between text-xs transition cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-[#2B1810] group-hover:text-[#7A4E2D]">
                        Chapter {chap.chapterNumber}: {chap.title}
                      </span>
                      <p className="text-[10px] text-stone-500 line-clamp-1">{chap.description}</p>
                    </div>
                    <span className="text-[10px] font-medium text-[#8C6D37] bg-[#F7F2EC] px-2 py-0.5 rounded ml-2 shrink-0">
                      {chap.estimatedDuration}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-stone-500">
                  No handbook chapters found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions & User Greeting */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl bg-white border border-[#DDD3C9] text-[#2B1810] hover:bg-[#F5ECE1] transition shadow-2xs cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 text-[#3D2217]" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B8860B] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#FAF7F2]">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#E0D5CB] rounded-2xl shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#EFE7DE] mb-2 px-1">
                  <span className="text-xs font-bold text-[#2B1810] uppercase tracking-wide">
                    Induction Notifications ({unreadNotifsCount} new)
                  </span>
                  <span className="text-[10px] text-[#8C6D37] font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-xs transition cursor-pointer ${notif.read
                        ? 'bg-[#FAF7F2] border-[#E8DFD8] text-stone-600'
                        : 'bg-white border-[#D4AF37]/50 shadow-2xs text-[#2B1810]'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-xs text-[#2B1810]">{notif.title}</span>
                        <span className="text-[9px] text-stone-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mb-1">{notif.message}</p>
                      {notif.actionLabel && (
                        <div className="text-[10px] font-semibold text-[#8C6D37] hover:underline flex items-center gap-1">
                          <span>{notif.actionLabel}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Center Popover */}
          <button
            onClick={() =>
              alert(
                'MA Ventures Employee Learning Help Center\n\nFor queries regarding real estate induction modules, handbook chapters, or assessment deadlines, reach out to HR L&D at induction@maventures.com.'
              )
            }
            className="p-2 rounded-xl bg-white border border-[#DDD3C9] text-[#2B1810] hover:bg-[#F5ECE1] transition shadow-2xs cursor-pointer"
            aria-label="Help & Guidance"
            title="Induction Handbook Guide"
          >
            <HelpCircle className="w-4.5 h-4.5 text-[#3D2217]" />
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2.5 p-1 sm:pl-2.5 sm:pr-2 rounded-xl bg-white border border-[#DDD3C9] hover:bg-[#F5ECE1] transition shadow-2xs cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#2B1810] leading-tight">
                  {employee?.fullName || 'Rahul Sharma'}
                </p>
                <p className="text-[10px] text-[#8C6D37] font-semibold">
                  {employee?.employeeCode || 'MA-2026-089'}
                </p>
              </div>
              <img
                src={
                  employee?.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                }
                alt={employee?.fullName || 'Employee'}
                className="w-8 h-8 rounded-lg object-cover border border-[#D4AF37]/50"
              />
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E0D5CB] rounded-2xl shadow-xl p-3 z-50">
                <div className="flex items-center gap-3 p-2 border-b border-[#EFE7DE] mb-2">
                  <img
                    src={employee?.profileImage}
                    alt="Employee"
                    className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1810]">{employee?.fullName}</h4>
                    <p className="text-[10px] text-[#8C6D37] font-semibold">{employee?.designation}</p>
                    <p className="text-[9px] text-stone-500">{employee?.department}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded-lg bg-[#FAF7F2] text-stone-600 flex items-center justify-between text-[11px]">
                    <span>Employee ID</span>
                    <span className="font-semibold text-[#2B1810]">{employee?.employeeCode}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAF7F2] text-stone-600 flex items-center justify-between text-[11px]">
                    <span>Date of Joining</span>
                    <span className="font-semibold text-[#2B1810]">{employee?.joiningDate}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#EFE7DE] text-center">
                  <button
                    onClick={() => {
                      alert('Profile management is linked with MA Ventures HRMS Master Profile.');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full py-1.5 text-[11px] font-bold text-[#2B1810] hover:bg-[#F5ECE1] rounded-lg transition"
                  >
                    View Official HRMS Record
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
