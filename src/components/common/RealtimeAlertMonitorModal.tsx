import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  UserX, 
  DollarSign, 
  Calendar, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Play, 
  CheckCheck, 
  ShieldAlert, 
  ExternalLink,
  Trash2,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { notificationEngine } from '../../services/notificationEngine';
import { soundManager } from '../../services/notificationAudio';
import { ERPModule } from '../layout/Sidebar';
import { NotificationCategory, AppNotification } from '../../types';

interface RealtimeAlertMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ERPModule) => void;
  onSelectStudent?: (studentId: string) => void;
}

export const RealtimeAlertMonitorModal: React.FC<RealtimeAlertMonitorModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onSelectStudent
}) => {
  const { notifications, students, invoices, exams, store, currentUser } = useERP();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.isSoundEnabled());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time metrics
  const lowAttendanceStudents = students.filter(s => s.attendancePercent < 75);
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');
  const totalOverdueAmount = overdueInvoices.reduce((acc, i) => acc + i.balance, 0);
  const upcomingExams = exams.filter(e => e.status === 'UPCOMING');

  const filteredNotifications = notifications.filter(n => {
    if (selectedCategory === 'ALL') return true;
    return n.category === selectedCategory;
  });

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundManager.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundManager.playAlertChime('INFO');
    }
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const result = notificationEngine.runDiagnosticScan(true);
      setIsScanning(false);
      setScanMessage(`Scan complete: ${result.totalGenerated} new alert(s) identified.`);
      setTimeout(() => setScanMessage(null), 4000);
    }, 600);
  };

  const handleActionClick = (notif: AppNotification) => {
    store.markNotificationAsRead(notif.id);
    onClose();
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Institutional Real-Time Alert Monitor</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono-tech border border-emerald-500/30">
                  LIVE ENGINE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring biometric attendance gates, accounts receivable, and examination schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Category Telemetry Cards */}
        <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Low Attendance Card */}
          <div 
            onClick={() => setSelectedCategory('ATTENDANCE')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              selectedCategory === 'ATTENDANCE'
                ? 'bg-red-50/70 border-red-400 ring-2 ring-red-400/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-red-100 text-red-700">
                  <UserX className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Low Attendance</span>
              </div>
              <span className="text-lg font-bold text-red-600 font-mono-tech">
                {lowAttendanceStudents.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {lowAttendanceStudents.length > 0 
                ? `${lowAttendanceStudents[0]?.firstName} (${lowAttendanceStudents[0]?.attendancePercent}%) & others below 75%`
                : 'All scholars compliant with CBSE criteria'}
            </p>
          </div>

          {/* 2. Fee Overdue Card */}
          <div 
            onClick={() => setSelectedCategory('FEE')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              selectedCategory === 'FEE'
                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Overdue Fees</span>
              </div>
              <span className="text-lg font-bold text-amber-600 font-mono-tech">
                ₹{totalOverdueAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {overdueInvoices.length} overdue invoices requiring settlement notices
            </p>
          </div>

          {/* 3. Exam Deadlines Card */}
          <div 
            onClick={() => setSelectedCategory('EXAM')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              selectedCategory === 'EXAM'
                ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-400/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Exam Deadlines</span>
              </div>
              <span className="text-lg font-bold text-indigo-600 font-mono-tech">
                {upcomingExams.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {upcomingExams[0]?.name || 'Next exam cycle'} in preparation
            </p>
          </div>
        </div>

        {/* Simulation Bar */}
        <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Play className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Real-Time Event:</span>
            </span>
            <button
              onClick={() => notificationEngine.simulateLowAttendanceAlert()}
              className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-slate-200 hover:border-red-300 rounded-lg text-[11px] font-bold shadow-2xs transition"
            >
              + Low Attendance
            </button>
            <button
              onClick={() => notificationEngine.simulateFeeOverdueAlert()}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 hover:border-amber-300 rounded-lg text-[11px] font-bold shadow-2xs transition"
            >
              + Fee Overdue
            </button>
            <button
              onClick={() => notificationEngine.simulateExamDeadlineAlert()}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-bold shadow-2xs transition"
            >
              + Exam Cutoff
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {scanMessage && (
              <span className="text-emerald-700 font-medium text-[11px] animate-in fade-in">
                {scanMessage}
              </span>
            )}
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Run Diagnostic Scan</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation & Batch Actions */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            {['ALL', 'ATTENDANCE', 'FEE', 'EXAM'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Alerts' : cat}
                <span className="ml-1.5 opacity-80 text-[10px]">
                  ({cat === 'ALL' ? notifications.length : notifications.filter(n => n.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => store.markAllAsRead(currentUser.name)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => store.clearReadNotifications()}
              className="text-xs text-slate-500 hover:text-red-600 font-medium flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear read</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No active alerts in this category</p>
              <p className="text-xs text-slate-400 mt-0.5">All monitored systems are operating within safe parameters.</p>
            </div>
          ) : (
            filteredNotifications.map(notif => {
              const isCritical = notif.urgency === 'CRITICAL' || notif.type === 'error';
              const isWarning = notif.urgency === 'WARNING' || notif.type === 'warning';

              return (
                <div 
                  key={notif.id}
                  className={`p-3.5 rounded-2xl transition hover:bg-slate-50 flex items-start space-x-3.5 ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    notif.category === 'ATTENDANCE' ? 'bg-red-100 text-red-700' :
                    notif.category === 'FEE' ? 'bg-amber-100 text-amber-700' :
                    notif.category === 'EXAM' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {notif.category === 'ATTENDANCE' && <UserX className="w-4 h-4" />}
                    {notif.category === 'FEE' && <DollarSign className="w-4 h-4" />}
                    {notif.category === 'EXAM' && <Calendar className="w-4 h-4" />}
                    {notif.category !== 'ATTENDANCE' && notif.category !== 'FEE' && notif.category !== 'EXAM' && <Bell className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCritical ? 'bg-red-100 text-red-800' :
                          isWarning ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {notif.urgency}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono-tech">{notif.time}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {notif.module} Module
                        </span>
                        {!notif.read && (
                          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                            Unread
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => store.dismissNotification(notif.id)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-100"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleActionClick(notif)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center space-x-1"
                        >
                          <span>Open in {notif.module}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Automatic continuous surveillance enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
