import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CheckSquare,
  BarChart3,
  Award,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
} from 'lucide-react';
import type { Employee } from '../types/induction.types';

export type InductionNavTab =
  | 'overview'
  | 'induction'
  | 'materials'
  | 'assessments'
  | 'progress'
  | 'certificates'
  | 'support';

interface InductionSidebarProps {
  currentTab: InductionNavTab;
  onTabChange: (tab: InductionNavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  employee: Employee | null;
  onLogout?: () => void;
}

export const InductionSidebar: React.FC<InductionSidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  employee,
  onLogout,
}) => {
  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard, badge: 'Active' },
    { id: 'induction' as const, label: 'My Induction', icon: GraduationCap, badge: 'Phase 1' },
    { id: 'materials' as const, label: 'Learning Materials', icon: BookOpen, badge: '22 Docs' },
    { id: 'assessments' as const, label: 'Assessments', icon: CheckSquare, badge: 'Locked' },
    { id: 'progress' as const, label: 'My Progress', icon: BarChart3, badge: '35%' },
    { id: 'certificates' as const, label: 'Certificates', icon: Award, badge: 'Milestone' },
    { id: 'support' as const, label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#1A120B] text-stone-200 border-r border-[#3E2723]/30 transition-all duration-300 select-none z-30 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Brand Section */}
      <div className="flex items-center justify-between p-4.5 border-b border-[#2C1810]">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#996515] p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#24140E] rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#E6C687]" />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-[#FAF7F2] uppercase font-serif">
                  MA VENTURES
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#3A2312] text-[#D4AF37] border border-[#D4AF37]/30">
                  HRMS
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium truncate">
                Employee Learning Portal
              </p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-[#2B1810] hover:bg-[#3D2217] text-stone-400 hover:text-white transition cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400/80">
            Induction Curriculum
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer relative ${
                isActive
                  ? 'bg-gradient-to-r from-[#3D2217] to-[#2B1810] text-[#FAF7F2] font-semibold border-l-4 border-[#D4AF37] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#2B1810]/50'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 transition-transform ${
                  isActive ? 'text-[#D4AF37]' : 'text-stone-400 group-hover:text-stone-300'
                }`}
              />
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#1A120B]'
                          : 'bg-[#2A1810] text-stone-400 border border-stone-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Employee Profile Card */}
      <div className="p-3 border-t border-[#2C1810] bg-[#160E08]/70">
        {!collapsed ? (
          <div className="bg-[#24140E] border border-[#3E2723]/60 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    employee?.profileImage ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                  }
                  alt={employee?.fullName || 'Employee'}
                  className="w-9 h-9 rounded-xl object-cover border border-[#D4AF37]/40 ring-1 ring-[#D4AF37]/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#24140E]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#FAF7F2] truncate">
                  {employee?.fullName || 'Rahul Sharma'}
                </p>
                <p className="text-[10px] text-[#D4AF37] font-medium tracking-wide truncate">
                  {employee?.employeeCode || 'MA-2026-089'}
                </p>
                <p className="text-[10px] text-stone-400 truncate">
                  {employee?.designation || 'Senior Investment Advisor'}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#3A2218] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span className="truncate">{employee?.department?.split(' ')[0] || 'Advisory'}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition cursor-pointer hover:underline"
                title="Sign out of portal"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={employee?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt="Employee"
              className="w-9 h-9 rounded-xl object-cover border border-[#D4AF37]/50"
            />
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-[#2B1810] transition"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
