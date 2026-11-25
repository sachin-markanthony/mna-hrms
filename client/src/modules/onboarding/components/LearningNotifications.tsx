import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import type { InductionNotification } from '../types/induction.types';

interface LearningNotificationsProps {
  notifications: InductionNotification[];
  onMarkRead: (id: string) => void;
  onNavigateAction?: (route: string) => void;
}

export const LearningNotifications: React.FC<LearningNotificationsProps> = ({
  notifications,
  onMarkRead,
  onNavigateAction,
}) => {
  const getIcon = (type: InductionNotification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-[#8C6D37]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5DDD5] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0EAE1]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8C6D37]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37] block">
                Announcements
              </span>
              <h3 className="text-base font-bold text-[#2B1810]">
                Induction Reminders
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-stone-500">
            {notifications.filter((n) => !n.read).length} Pending
          </span>
        </div>

        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkRead(notif.id)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                notif.read
                  ? 'bg-[#FAF7F2] border-[#EFE7DE] opacity-80'
                  : 'bg-white border-[#D4AF37]/50 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-[#2B1810]">
                      {notif.title}
                    </span>
                    <span className="text-[9px] text-stone-400 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    {notif.message}
                  </p>
                  {notif.actionLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (notif.actionRoute && onNavigateAction) {
                          onNavigateAction(notif.actionRoute);
                        }
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#8C6D37] hover:underline"
                    >
                      <span>{notif.actionLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0EAE1] text-[10px] text-stone-400 text-center font-medium">
        L&amp;D Automated Reminders &bull; HR Induction Schedule
      </div>
    </div>
  );
};
