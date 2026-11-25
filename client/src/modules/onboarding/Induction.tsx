import { useState } from 'react';
import { CheckCircle2, QrCode, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth';

export function Induction() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Personal Profile & Banking Information', done: true, type: 'Form' },
    { id: 2, title: 'Upload Offline KYC Scans (PAN, Aadhaar) for HR Verification', done: true, type: 'KYC' },
    { id: 3, title: 'Download & Save Unique Employee QR Identity Code', done: false, type: 'QR' },
    { id: 4, title: 'Review Code of Conduct & IT Security Policies', done: false, type: 'Policy' },
    { id: 5, title: 'Watch Welcome & Core Values Orientation Video', done: false, type: 'Video' },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Induction &amp; Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 1 Module 5 &bull; New Joiner Training &amp; Checklist Tracking
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Progress: {progressPercent}% Completed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Checklist */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            New Joiner Milestone Checklist
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Complete the tasks below to finalize your HR clearance.
          </p>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
                  task.done
                    ? 'bg-slate-50 border-slate-200 text-slate-500'
                    : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      task.done
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {task.done && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      task.done ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {task.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Employee Unique QR Code & Policy Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs text-center">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#eb5744] flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Your Unique Employee QR</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Permanent QR code for gate access, training check-in &amp; portal identity.
            </p>

            <div className="w-36 h-36 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 p-2">
              <QrCode className="w-24 h-24 text-slate-800" />
              <span className="font-mono text-[10px] text-slate-500 mt-1">
                {user?.id ? `MNA-${user.id}` : 'MNA-EMP-001'}
              </span>
            </div>

            <button className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer">
              Download Official QR Badge
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-orange-600" /> Policy Library
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <a href="#policy" className="block hover:text-[#eb5744] transition">
                &bull; Mark Anthony Ventures Employee Handbook 2026
              </a>
              <a href="#security" className="block hover:text-[#eb5744] transition">
                &bull; Confidentiality &amp; Information Security Policy
              </a>
              <a href="#leave" className="block hover:text-[#eb5744] transition">
                &bull; Leave &amp; Shift Grace Period Guidelines
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Induction;
