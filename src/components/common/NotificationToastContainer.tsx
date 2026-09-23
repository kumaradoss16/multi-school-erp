import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  ExternalLink, 
  UserX, 
  DollarSign, 
  Calendar, 
  Bell, 
  CheckCircle2 
} from 'lucide-react';
import { notificationEngine, ToastItem } from '../../services/notificationEngine';
import { ERPModule } from '../layout/Sidebar';

interface NotificationToastContainerProps {
  onSelectModule: (module: ERPModule) => void;
  onSelectStudent?: (studentId: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  onSelectModule,
  onSelectStudent
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = notificationEngine.subscribeToasts((newToasts) => {
      setToasts(newToasts);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div 
      id="realtime-toast-container"
      className="fixed top-18 right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const notif = toast.notification;
        const isCritical = notif.urgency === 'CRITICAL' || notif.type === 'error';
        const isWarning = notif.urgency === 'WARNING' || notif.type === 'warning';

        const getCategoryIcon = () => {
          if (notif.category === 'ATTENDANCE') return <UserX className="w-4 h-4 text-red-600" />;
          if (notif.category === 'FEE') return <DollarSign className="w-4 h-4 text-amber-600" />;
          if (notif.category === 'EXAM') return <Calendar className="w-4 h-4 text-indigo-600" />;
          return <Bell className="w-4 h-4 text-blue-600" />;
        };

        const getBgBorder = () => {
          if (isCritical) return 'border-red-500/80 bg-white ring-2 ring-red-500/20';
          if (isWarning) return 'border-amber-500/80 bg-white ring-2 ring-amber-500/20';
          return 'border-blue-500/80 bg-white ring-2 ring-blue-500/20';
        };

        const handleToastClick = () => {
          notificationEngine.dismissToast(toast.id);
          const mod = notif.module.toLowerCase();
          if (mod === 'attendance') {
            onSelectModule('attendance');
            if (notif.targetId && onSelectStudent) {
              onSelectStudent(notif.targetId);
            }
          } else if (mod === 'fees') {
            onSelectModule('fees');
          } else if (mod === 'examinations') {
            onSelectModule('examinations');
          } else if (mod === 'students') {
            onSelectModule('students');
            if (notif.targetId && onSelectStudent) {
              onSelectStudent(notif.targetId);
            }
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto shadow-xl rounded-2xl border p-3.5 transition-all duration-200 transform translate-y-0 opacity-100 flex flex-col space-y-1.5 ${getBgBorder()}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${
                  isCritical ? 'bg-red-50' : isWarning ? 'bg-amber-50' : 'bg-blue-50'
                }`}>
                  {getCategoryIcon()}
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                    isCritical ? 'bg-red-100 text-red-800' :
                    isWarning ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {notif.category || 'ALERT'} • {notif.urgency}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5">{notif.time}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notificationEngine.dismissToast(toast.id);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div 
              onClick={handleToastClick}
              className="cursor-pointer group"
            >
              <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
                {notif.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                {notif.message}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
              <span className="text-slate-400 font-mono-tech">{notif.module} Module</span>
              <button
                onClick={handleToastClick}
                className="font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span>View & Resolve</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
