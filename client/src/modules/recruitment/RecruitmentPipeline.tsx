import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Calendar,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  Building2,
  RefreshCw,
  Eye,
  Award,
} from 'lucide-react';
import { useAuth } from '../auth';
import { recruitmentApi } from './recruitment.api';
import type {
  Candidate,
  CandidateStatus,
  RecruitmentStats,
  CreateCandidatePayload,
  EvaluateRoundPayload,
  RecruitmentDepartment,
} from './types';
import { STATUS_CONFIG } from './types';
import { CandidateCard } from './components/CandidateCard';
import { CandidateDrawer } from './components/CandidateDrawer';
import { AddCandidateModal } from './components/AddCandidateModal';
import { EvaluateRoundModal } from './components/EvaluateRoundModal';

const PIPELINE_COLUMNS: CandidateStatus[] = [
  'REGISTERED',
  'HR_ROUND',
  'MR_ROUND',
  'SELECTED',
  'REJECTED_HR',
  'REJECTED_MR',
];

export function RecruitmentPipeline() {
  const { user } = useAuth();
  const isTeamLeader = user?.role === 'TEAM_LEADER';
  const todayStr = new Date().toISOString().split('T')[0];

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<RecruitmentStats | null>(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedDept, setSelectedDept] = useState<'ALL' | RecruitmentDepartment>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');

  // Modals
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);
  const [evaluateCandidate, setEvaluateCandidate] = useState<Candidate | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate, isTeamLeader, user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const dateParam = selectedDate === 'ALL' ? undefined : selectedDate;
      const tlParams = isTeamLeader && user
        ? { teamLeaderId: user.id, teamLeaderName: user.name }
        : undefined;

      const [candsData, statsData] = await Promise.all([
        recruitmentApi.getCandidates({ visitDate: dateParam, ...tlParams }),
        recruitmentApi.getStats({ visitDate: dateParam, ...tlParams }),
      ]);
      setCandidates(candsData || []);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load recruitment data from database:', err);
      setLoadError(err?.message || 'Failed to connect to Neon PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesDept = selectedDept === 'ALL' || c.department === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      const tlName =
        c.teamLeaderName ||
        c.tags?.find((t) => t.startsWith('TL:'))?.replace('TL:', '');

      const matchesSearch =
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (tlName && tlName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTeamLeader =
        !isTeamLeader ||
        c.teamLeaderId === user?.id ||
        (tlName &&
          user?.name &&
          tlName.trim().toLowerCase().includes(user.name.trim().toLowerCase())) ||
        (c.tags &&
          user?.name &&
          c.tags.some((t) => t.toLowerCase().includes(user.name.toLowerCase())));

      return matchesDept && matchesStatus && matchesSearch && matchesTeamLeader;
    });
  }, [candidates, selectedDept, selectedStatus, searchQuery, isTeamLeader, user]);

  // Derived / Display Stats: Ensure stats accurately reflect visible candidates when scoped to a Team Leader
  const displayStats = useMemo(() => {
    if (!stats) return null;
    if (isTeamLeader) {
      const total = filteredCandidates.length;
      const digitalCount = filteredCandidates.filter((c) => c.department === 'DIGITAL').length;
      const salesCount = filteredCandidates.filter((c) => c.department === 'SALES').length;
      const registeredCount = filteredCandidates.filter((c) => c.status === 'REGISTERED').length;
      const hrRoundCount = filteredCandidates.filter((c) => c.status === 'HR_ROUND').length;
      const mrRoundCount = filteredCandidates.filter((c) => c.status === 'MR_ROUND').length;
      const selectedCount = filteredCandidates.filter((c) => c.status === 'SELECTED').length;
      const rejectedAtHrCount = filteredCandidates.filter((c) => c.status === 'REJECTED_HR').length;
      const rejectedAtMrCount = filteredCandidates.filter((c) => c.status === 'REJECTED_MR').length;
      const totalRejected = rejectedAtHrCount + rejectedAtMrCount;

      return {
        ...stats,
        totalWalkIns: total,
        departments: {
          digital: digitalCount,
          sales: salesCount,
        },
        stages: {
          registered: registeredCount,
          inHrRound: hrRoundCount,
          inMrRound: mrRoundCount,
          selected: selectedCount,
        },
        rejections: {
          rejectedAtHr: rejectedAtHrCount,
          rejectedAtMr: rejectedAtMrCount,
          totalRejected,
        },
        selectionRate: total > 0 ? Number(((selectedCount / total) * 100).toFixed(1)) : 0,
      };
    }
    return stats;
  }, [stats, isTeamLeader, filteredCandidates]);

  // Handle Register Candidate - Synchronously pushes to DB and reloads live data
  const handleCreateCandidate = async (payload: CreateCandidatePayload) => {
    try {
      await recruitmentApi.createCandidate(payload);
      await loadData();
    } catch (err: any) {
      alert(`Database Error: Could not create candidate. ${err?.message || ''}`);
    }
  };

  // Handle Round Evaluation (HR or MR) - Evaluates and syncs with DB immediately
  const handleEvaluateRound = async (candidateId: string, payload: EvaluateRoundPayload) => {
    try {
      const res = await recruitmentApi.evaluateRound(candidateId, payload);
      await loadData();
      if (drawerCandidate && drawerCandidate.id === candidateId && res?.candidate) {
        setDrawerCandidate(res.candidate);
      }
    } catch (err: any) {
      alert(`Database Error: Could not save round evaluation. ${err?.message || ''}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ====================================================
          TOP EXECUTIVE HEADER & ACTIONS
          ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#072b53]/10 dark:bg-amber-500/10 text-[#072b53] dark:text-amber-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Office Walk-In Recruitment Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking office walk-in candidates across <strong>Digital</strong> & <strong>Sales</strong> departments &bull; 2 Evaluation Rounds: <strong>HR Round</strong> and <strong>MR Round</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh Recruitment Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {!isTeamLeader && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Register Office Walk-In
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span><strong>Database Connection Notice:</strong> {loadError}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ====================================================
          WALK-IN VISIT DATE SELECTOR & ANALYTICS
          ==================================================== */}
      <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#072b53] dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Walk-In Date Filter:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDate === todayStr
                ? 'bg-[#072b53] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
            >
              Today ({todayStr})
            </button>

            <button
              onClick={() => setSelectedDate('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDate === 'ALL'
                ? 'bg-[#072b53] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
            >
              All-Time Records
            </button>

            <input
              type="date"
              value={selectedDate === 'ALL' ? '' : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || 'ALL')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* 5 Core Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Card 1: Total Walk-Ins */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
              Total Walk-Ins Came
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {displayStats?.totalWalkIns ?? filteredCandidates.length}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">Candidates</span>
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500 flex items-center gap-2">
              <span>Digital: <strong>{displayStats?.departments.digital ?? 0}</strong></span>
              <span>&bull;</span>
              <span>Sales: <strong>{displayStats?.departments.sales ?? 0}</strong></span>
            </div>
          </div>

          {/* Card 2: Candidates in HR Round */}
          <div className="p-3.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
            <span className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300 block">
              In HR Round
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-sky-900 dark:text-sky-100">
                {displayStats?.stages.inHrRound ?? 0}
              </span>
              <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                Round 1
              </span>
            </div>
            <p className="mt-1 text-[10px] text-sky-600 dark:text-sky-400">
              Screening & basic fit
            </p>
          </div>

          {/* Card 3: In MR Round */}
          <div className="p-3.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300 block">
              In MR Round
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                {displayStats?.stages.inMrRound ?? 0}
              </span>
              <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                Round 2
              </span>
            </div>
            <p className="mt-1 text-[10px] text-indigo-600 dark:text-indigo-400">
              Management interview
            </p>
          </div>

          {/* Card 4: Total Selected */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Selected / Hired
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                {displayStats?.stages.selected ?? 0}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {displayStats?.selectionRate ?? 0}% Rate
              </span>
            </div>
            <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              Cleared both rounds
            </p>
          </div>

          {/* Card 5: Rejections (HR vs MR) */}
          <div className="p-3.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300">
                Rejected ({displayStats?.rejections.totalRejected ?? 0})
              </span>
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="mt-2 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 dark:text-slate-300">At HR Round:</span>
                <strong className="font-bold text-rose-600">
                  {displayStats?.rejections.rejectedAtHr ?? 0}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 dark:text-slate-300">At MR Round:</span>
                <strong className="font-bold text-rose-700">
                  {displayStats?.rejections.rejectedAtMr ?? 0}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          FILTERS: DEPARTMENT (DIGITAL / SALES), SEARCH & VIEW
          ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, phone, role..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#072b53]"
            />
          </div>

          {/* Department Filter (Only Digital or Sales) */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#072b53]"
            >
              <option value="ALL">All Departments (Digital + Sales)</option>
              <option value="DIGITAL">Digital Department</option>
              <option value="SALES">Sales Department</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#072b53]"
            >
              <option value="ALL">All Pipeline Stages</option>
              <option value="REGISTERED">Walk-In Registered</option>
              <option value="HR_ROUND">1. In HR Round</option>
              <option value="MR_ROUND">2. In MR Round</option>
              <option value="SELECTED">Selected / Hired</option>
              <option value="REJECTED_HR">Rejected at HR Round</option>
              <option value="REJECTED_MR">Rejected at MR Round</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('KANBAN')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'KANBAN'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('LIST')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'LIST'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          PIPELINE VIEW: KANBAN OR TABLE
          ==================================================== */}
      {viewMode === 'KANBAN' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x select-none">
          {PIPELINE_COLUMNS.map((colStatus) => {
            const colCands = filteredCandidates.filter((c) => c.status === colStatus);
            const statusConfig = STATUS_CONFIG[colStatus];

            return (
              <div
                key={colStatus}
                className="w-80 shrink-0 rounded-lg bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-3 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${colStatus === 'SELECTED'
                        ? 'bg-emerald-500'
                        : colStatus === 'REJECTED_HR' || colStatus === 'REJECTED_MR'
                          ? 'bg-rose-500'
                          : colStatus === 'MR_ROUND'
                            ? 'bg-indigo-500'
                            : colStatus === 'HR_ROUND'
                              ? 'bg-sky-500'
                              : 'bg-[#072b53] dark:bg-amber-400'
                        }`}
                    />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {statusConfig.title}
                    </h3>
                  </div>

                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {colCands.length}
                  </span>
                </div>

                {/* Candidate Cards Column */}
                <div className="flex-1 overflow-y-auto space-y-3 p-1">
                  {colCands.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <p className="text-[11px] text-slate-400">No candidates in this stage</p>
                    </div>
                  ) : (
                    colCands.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        canEvaluate={!isTeamLeader}
                        showTeamLeader={!isTeamLeader}
                        onOpenDetails={setDrawerCandidate}
                        onEvaluateRound={setEvaluateCandidate}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabular List View */
        <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Dept</th>
                  <th className="px-5 py-3.5">Role Applied</th>
                  <th className="px-5 py-3.5">Visit Date</th>
                  <th className="px-5 py-3.5">Status & Decision</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCandidates.map((c) => {
                  const statusInfo = STATUS_CONFIG[c.status];
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setDrawerCandidate(c)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{c.fullName}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {c.phone} &bull; {c.email}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${c.department === 'DIGITAL'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                        >
                          {c.department}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {c.appliedRole}
                        </div>
                        <div className="text-[10px] text-slate-400">{c.experienceYears} yrs exp</div>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                        {c.visitDate?.split('T')[0] || c.visitDate}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                        >
                          {statusInfo.title}
                        </span>
                        {c.rejectionReason && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 truncate max-w-xs mt-0.5">
                            Reason: {c.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {isTeamLeader ||
                        c.status === 'SELECTED' ||
                        c.status === 'REJECTED_HR' ||
                        c.status === 'REJECTED_MR' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerCandidate(c);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            View Details
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEvaluateCandidate(c);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#072b53] hover:bg-[#0a3869] transition-colors cursor-pointer shadow-2xs"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            Evaluate {c.status === 'MR_ROUND' ? 'MR Round' : 'HR Round'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          MODALS & SLIDE-OVER INSPECTOR
          ==================================================== */}
      <CandidateDrawer
        candidate={drawerCandidate}
        isOpen={Boolean(drawerCandidate)}
        canEvaluate={!isTeamLeader}
        showTeamLeader={!isTeamLeader}
        onClose={() => setDrawerCandidate(null)}
        onEvaluateRound={(c) => {
          setDrawerCandidate(null);
          setEvaluateCandidate(c);
        }}
      />

      {evaluateCandidate && (
        <EvaluateRoundModal
          candidate={evaluateCandidate}
          isOpen={Boolean(evaluateCandidate)}
          onClose={() => setEvaluateCandidate(null)}
          onSubmit={handleEvaluateRound}
        />
      )}

      <AddCandidateModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateCandidate}
      />
    </div>
  );
}
