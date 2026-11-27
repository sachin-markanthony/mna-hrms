import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Home,
  LifeBuoy,
  LogOut,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { BrandLogo } from '../../../../components/ui/BrandLogo';
import { useAuth } from '../../../auth';
import type { EmployeeProfile, InductionSummary } from '../../types/learning.types';
import { getInitials } from '../../utils/chapterStatus';

interface InductionSidebarProps {
  employee: EmployeeProfile;
  summary: InductionSummary;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const NAV_SECTIONS = [
  {
    label: 'My Learning',
    items: [
      { label: 'Induction Overview', to: '/induction', icon: Home, end: true },
      { label: 'Learning Chapters', to: '/induction/chapters', icon: BookOpen },
    ],
  },
  {
    label: 'My Progress',
    items: [
      { label: 'My Assessments', to: '/induction/assessments', icon: ClipboardCheck },
      { label: 'My Progress', to: '/induction/progress', icon: TrendingUp },
    ],
  },
  {
    label: 'Help & Support',
    items: [
      { label: 'Help & Support', to: '/induction/support', icon: LifeBuoy },
    ],
  },
];

export function InductionSidebar({
  employee,
  summary,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: InductionSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#2B1810]/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-[#E9DED2] bg-[#FFFCF7] transition-all duration-300 lg:static lg:z-30 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[84px]' : 'w-[272px]'}`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#EFE5D9] px-4">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mx-auto rounded-xl p-1 transition hover:bg-[#F7EFE4]"
              title="Expand sidebar"
            >
              <BrandLogo size="sm" collapsed />
            </button>
          ) : (
            <BrandLogo size="md" showSubtitle />
          )}

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-1.5 text-[#9A8B7E] transition hover:bg-[#F5EDE2] hover:text-[#3B2314] lg:inline-flex"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-[#9A8B7E] transition hover:bg-[#F5EDE2] hover:text-[#3B2314] lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mx-auto mb-4 hidden h-8 w-8 items-center justify-center rounded-lg text-[#9A8B7E] transition hover:bg-[#F5EDE2] hover:text-[#3B2314] lg:flex"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              {!collapsed && (
                <p className="mb-2 px-3 text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#A69788]">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold transition ${
                          isActive
                            ? 'bg-[#3B2314] text-[#FFFDF9] shadow-[0_8px_18px_rgba(59,35,20,0.16)]'
                            : 'text-[#6E5B4C] hover:bg-[#F6EEE3] hover:text-[#3B2314]'
                        } ${collapsed ? 'justify-center px-0' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`h-[17px] w-[17px] shrink-0 ${
                              isActive ? 'text-[#E6C687]' : 'text-[#A28F7D]'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {!collapsed && (
            <div className="mt-2 rounded-2xl border border-[#EFE1CE] bg-[#FBF5EA] p-3.5">
              <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
                <Sparkles className="h-3 w-3" />
                Your journey
              </div>
              <p className="mt-1.5 text-[12px] font-bold text-[#3B2314]">
                {summary.completedChapters} of {summary.totalLearningChapters} chapters
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDE2D2]">
                <div
                  className="h-full rounded-full bg-[#B8893A] transition-all duration-500"
                  style={{ width: `${summary.overallPercentage}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] font-semibold text-[#8A7765]">
                {summary.overallPercentage}% complete
              </p>
            </div>
          )}
        </nav>

        <div className="shrink-0 border-t border-[#EFE5D9] p-3">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B2314] text-[11px] font-extrabold text-[#F3DFC0]"
              title={employee.fullName}
            >
              {getInitials(employee.fullName)}
            </button>
          ) : (
            <div className="rounded-2xl border border-[#EDE2D6] bg-white p-3">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex w-full items-center gap-3 text-left"
                aria-expanded={profileOpen}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B2314] text-[11px] font-extrabold text-[#F3DFC0]">
                  {getInitials(employee.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-[#3B2314]">
                    {employee.fullName}
                  </p>
                  <p className="truncate text-[10px] font-semibold text-[#9A7A45]">
                    {employee.employeeCode}
                  </p>
                  <p className="truncate text-[10px] text-[#8A7A6C]">
                    {employee.designation}
                  </p>
                </div>
              </button>

              {profileOpen && (
                <div className="mt-3 space-y-1 border-t border-[#F0E7DC] pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/induction/progress');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-[#6E5B4C] transition hover:bg-[#F8F1E7]"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-[#A28F7D]" />
                    View my progress
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-[#A34C35] transition hover:bg-[#FDF2EE]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export function InductionSidebarBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#E8D9C2] bg-[#FBF5EA] px-2 py-0.5 text-[9px] font-bold text-[#8A6427]">
      <GraduationCap className="h-2.5 w-2.5" />
      Induction
    </span>
  );
}
