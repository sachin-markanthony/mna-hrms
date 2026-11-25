import { useState } from 'react';
import {
  Users,
  Clock,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  MapPin,
  QrCode,
  Lock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth, ROLES } from '../auth';
import logoImg from '../../assets/malogo.png';

export function Dashboard() {
  const { user } = useAuth();
  const [activeRange, setActiveRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [personalView, setPersonalView] = useState(false);

  if (!user) return null;
  const roleConfig = ROLES[user.role];

  // System Setup Milestones with full non-truncated titles
  const setupMilestones = [
    { title: 'Organization Master', status: 'Completed', detail: 'Headquarters & branch settings' },
    { title: 'Departments & Designations', status: 'Completed', detail: '8 active departments mapped' },
    { title: 'Shift & Grace Logic', status: 'Completed', detail: '15m grace period configured' },
    { title: 'Face-Scan Gate Webhook', status: 'Completed', detail: 'Biometric debounce active' },
    { title: 'CRM Site Visit Ingestion', status: 'Completed', detail: 'GPS coordinate logging live' },
    { title: 'Manual KYC Vault', status: 'Completed', detail: 'Offline review workflow' },
    { title: 'Mail & Calendar Server', status: 'In Progress', detail: 'SMTP & invite dispatch' },
  ];

  // Dynamic Metrics based on active Role
  const getCards = () => {
    if (user.role === 'EMPLOYEE' || personalView) {
      return [
        {
          title: 'My Monthly Attendance',
          count: '96.4%',
          note: '21 / 22 Working Days',
          change: '+2.1% vs last month',
          icon: Clock,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          title: 'Available Leave Balance',
          count: '14 Days',
          note: 'Casual: 6 | Sick: 8',
          change: 'Locks on apply',
          icon: CalendarDays,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
        },
        {
          title: 'CRM Site Visits Logged',
          count: '18 Visits',
          note: 'GPS Verified in Field',
          change: 'Synced from CRM App',
          icon: MapPin,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
        {
          title: 'Latest Payslip Status',
          count: 'Generated',
          note: 'October 2026 Salary',
          change: 'Ready in My Payslips',
          icon: CheckCircle2,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
      ];
    }

    if (user.role === 'TEAM_MANAGER') {
      return [
        {
          title: 'Team Strength',
          count: '18 Members',
          note: user.department || 'Product Engineering',
          change: '100% active roster',
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          title: 'Team Present Today',
          count: '16 / 18',
          note: 'Gate & CRM verified',
          change: '88.9% on-duty',
          icon: Clock,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
        },
        {
          title: 'Pending Leave Approvals',
          count: '3 Requests',
          note: 'Requires manager sign-off',
          change: 'Balance auto-locked',
          icon: CalendarDays,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
        {
          title: 'Assigned Scorecards',
          count: '2 Candidates',
          note: 'Technical Evaluation Round',
          change: 'Due within 24 hours',
          icon: CheckCircle2,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
      ];
    }

    if (user.role === 'HR_RECRUITER') {
      return [
        {
          title: 'Active Pipeline',
          count: '42 Candidates',
          note: 'Across 6 open job openings',
          change: '+8 new applicants this week',
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          title: 'Interviews Scheduled',
          count: '14 This Week',
          note: 'Google Calendar synced',
          change: 'Automated invitations',
          icon: Clock,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
        },
        {
          title: 'Pending Scorecards',
          count: '5 Evaluated',
          note: 'Awaiting round recommendation',
          change: 'Hire / No Hire / Hold',
          icon: AlertCircle,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
        {
          title: 'Offer Letters Released',
          count: '3 Dispatched',
          note: 'Automated PDF with audit log',
          change: '100% delivery rate',
          icon: CheckCircle2,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
      ];
    }

    // Default: Super Admin & HR Admin (Org-wide Scope)
    return [
      {
        title: 'Total Active Workforce',
        count: '148',
        note: 'Across 8 departments',
        change: '+4 new joiners this month',
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        title: 'Present Today',
        count: '136',
        note: 'Biometric gate & CRM visits',
        change: '91.8% workforce attendance',
        icon: Clock,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        title: 'Approved On Leave',
        count: '9',
        note: 'Balances deducted & locked',
        change: '3 Casual | 6 Privilege',
        icon: CalendarDays,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
      },
      {
        title: 'Latecomer Alerts',
        count: '3 Flags',
        note: 'Exceeded 15m shift grace',
        change: 'Automated notification sent',
        icon: AlertCircle,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
      },
      {
        title: 'Monthly Payroll State',
        count: user.role === 'SUPER_ADMIN' ? 'READY TO LOCK' : 'DRAFT REVIEW',
        note: 'November 2026 Cycle',
        change: 'Auto-calculated LOP deductions',
        icon: Lock,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
    ];
  };

  const cards = getCards();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Wednesday, November 25, 2026 &bull; Mark Anthony Ventures
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              Branch: Global Headquarters
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Biometrics &amp; CRM Synced
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPersonalView(!personalView)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              personalView
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-[#eb5744] hover:bg-[#d84b39] text-white'
            }`}
          >
            {personalView ? 'Switch to Org Dashboard' : 'My Personal Dashboard'}
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#eb5744] border-2 border-[#eb5744] hover:bg-orange-50 transition cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" />
            Customize View
          </button>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                activeRange === r
                  ? 'bg-[#eb5744] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : r === 'year' ? 'This Year' : 'Today'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> 11/01/2026
          </span>
          <span className="text-slate-400">&rarr;</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> 11/30/2026
          </span>
        </div>
      </div>

      {/* Setup Milestone Progress Banner (Clear, Full Titles, No Truncation) */}
      {(user.role === 'SUPER_ADMIN' || user.role === 'HR_ADMIN') && (
        <div className="bg-gradient-to-r from-orange-50/80 via-white to-orange-50/80 border border-orange-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="Mark Anthony"
                className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Mark Anthony Ventures Portal Setup &bull; Phase 1 Milestones
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core infrastructure and system services for self-hosted cluster
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              6 of 7 Services Operational
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
            {setupMilestones.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                  step.status === 'Completed'
                    ? 'bg-white border-slate-200 shadow-2xs'
                    : 'bg-orange-50 border-orange-300 ring-2 ring-orange-200/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      0{idx + 1}
                    </span>
                    {step.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">
                    {step.title}
                  </h4>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      step.status === 'Completed' ? 'text-emerald-700' : 'text-orange-700'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              <strong className="text-slate-900">Next Action:</strong> Configure SMTP &amp; Google Calendar integration for automated candidate invitations.
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eb5744] hover:bg-[#d84b39] text-white font-bold text-xs transition shadow-xs cursor-pointer shrink-0">
              Configure Service <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Enlarged KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {card.count}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  {card.note}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spacious Attendance Sync Feeds & Real-Time Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-Time Live Feed Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                  Live Attendance &amp; Gate-Lock Sync
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  First-In, Last-Out logic with 10-minute double-swipe debounce protection
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Face-Scan Webhook Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 font-bold">Team Member</th>
                    <th className="pb-3 font-bold">Biometric ID</th>
                    <th className="pb-3 font-bold">Punch Source</th>
                    <th className="pb-3 font-bold">Event &amp; Timestamp</th>
                    <th className="pb-3 font-bold">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="py-4">
                      <div className="font-bold text-slate-900">David Chen</div>
                      <div className="text-[11px] text-slate-400">Software Engineer</div>
                    </td>
                    <td className="py-4 font-mono font-semibold text-slate-600">BIO-209</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md">
                        <QrCode className="w-3.5 h-3.5" /> Face Scan Gate
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-700">
                      09:12:18 AM <span className="text-emerald-600 font-bold">(First-In)</span>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        On Time (Shift Grace OK)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="py-4">
                      <div className="font-bold text-slate-900">Pooja Sharma</div>
                      <div className="text-[11px] text-slate-400">Account Executive</div>
                    </td>
                    <td className="py-4 font-mono font-semibold text-slate-600">BIO-182</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5" /> CRM GPS Visit
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-700">
                      09:38:40 AM <span className="text-emerald-600 font-bold">(First-In)</span>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                        Grace Late (+8m)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="py-4">
                      <div className="font-bold text-slate-900">Elena Rostova</div>
                      <div className="text-[11px] text-slate-400">Engineering Manager</div>
                    </td>
                    <td className="py-4 font-mono font-semibold text-slate-600">BIO-104</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md">
                        <QrCode className="w-3.5 h-3.5" /> Face Scan Gate
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-700">
                      08:58:02 AM <span className="text-emerald-600 font-bold">(First-In)</span>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        On Time (Shift Grace OK)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing recent punches &bull; Auto-refreshes every 30 seconds</span>
            <button className="font-bold text-[#eb5744] hover:underline cursor-pointer inline-flex items-center gap-1">
              View All Attendance Logs <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Security, Data Boundaries & Quick Action Queue */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 text-[#072b53]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Security &amp; Scope Boundary</h3>
                <p className="text-[11px] text-slate-500">Mark Anthony Ventures Cluster</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Authenticated Account:</span>
                <span className="text-slate-900 font-extrabold text-sm block">{user.name}</span>
                <span className="text-slate-500 text-[11px]">{user.email}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Enforced Data Boundary:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                  {roleConfig.scope} Scope
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{roleConfig.description}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium text-center">
              PostgreSQL Row-Level Security Enforced &bull; AES-256
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Pending Approvals Queue
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">David Chen (Leave)</div>
                  <div className="text-[11px] text-slate-500">Casual Leave &bull; Nov 28 - Nov 29</div>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer">
                    Approve
                  </button>
                  <button className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-300 cursor-pointer">
                    Reject
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Technical Scorecard</div>
                  <div className="text-[11px] text-slate-500">Candidate: Vikram Patel &bull; Tech Round</div>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-blue-700 text-white font-bold text-[11px] hover:bg-blue-800 cursor-pointer">
                  Evaluate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
