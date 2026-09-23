import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Receipt, 
  CalendarCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRight, 
  Calendar, 
  UserPlus, 
  Banknote, 
  Award, 
  ClipboardList, 
  CalendarDays, 
  FileSpreadsheet, 
  BookOpen, 
  Bus, 
  Building2, 
  BarChart3, 
  Settings, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Trophy,
  ShieldAlert,
  UserX,
  DollarSign,
  Activity
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { ERPModule } from '../layout/Sidebar';
import { AttendanceHeatmapChart } from '../common/AttendanceHeatmapChart';
import { AttendanceComparisonCard } from '../common/AttendanceComparisonCard';
import { PredictiveAttendanceCard } from '../common/PredictiveAttendanceCard';
import { AutoRefreshToggle } from '../dashboard/AutoRefreshToggle';

interface DashboardViewProps {
  onSelectModule: (module: ERPModule) => void;
  onOpenQuickAction: (action: string) => void;
  onOpenAlerts?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onSelectModule, 
  onOpenQuickAction,
  onOpenAlerts
}) => {
  const { 
    currentUser, 
    students, 
    staff, 
    classes, 
    invoices, 
    activities, 
    timetable, 
    notices, 
    attendanceSummary,
    notifications,
    refreshStudentAttendanceAndEngagement
  } = useERP();

  // Background auto-refresh state
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => 
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Background re-fetch function for student engagement & attendance data
  const handleRefreshData = () => {
    setIsSyncing(true);
    try {
      const result = refreshStudentAttendanceAndEngagement();
      setLastSyncedTime(result.timestamp);
      setSyncFeedback(`Re-synced attendance (${result.presentStudents.toLocaleString()} present, ${result.attendancePercent}%) & engagement data`);
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to re-fetch dashboard metrics:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

  // Real-time notification metrics for alert banner
  const criticalOrWarningAlerts = notifications.filter(n => !n.read && (n.urgency === 'CRITICAL' || n.urgency === 'WARNING'));
  const lowAttCount = notifications.filter(n => !n.read && n.category === 'ATTENDANCE').length;
  const feeOverdueCount = notifications.filter(n => !n.read && n.category === 'FEE').length;
  const examDeadlineCount = notifications.filter(n => !n.read && n.category === 'EXAM').length;

  // Hover state for interactive chart tooltip
  const [activeMonthTooltip, setActiveMonthTooltip] = useState<number | null>(null);

  // Total pending fees calculation from live database
  const totalPendingFees = invoices
    .filter(inv => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + inv.balance, 0);

  // Enrollment bar chart dataset (matching the exact visual numbers from screenshot)
  const enrollmentData = [
    { month: 'Jan', newAdm: 70, reAdm: 100, total: 170 },
    { month: 'Feb', newAdm: 90, reAdm: 115, total: 205 },
    { month: 'Mar', newAdm: 105, reAdm: 125, total: 230 },
    { month: 'Apr', newAdm: 110, reAdm: 130, total: 240 },
    { month: 'May', newAdm: 120, reAdm: 145, total: 265 },
    { month: 'Jun', newAdm: 135, reAdm: 160, total: 295 },
  ];

  return (
    <div id="dashboard-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Greeting, Date Badge & Background Auto-Refresh Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, {currentUser.name}! Here's what's happening at your school today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Background Auto-Refresh Toggle Control (Re-fetches data every 5m) */}
          <AutoRefreshToggle
            onRefresh={handleRefreshData}
            defaultIntervalSeconds={300}
            lastSyncedTime={lastSyncedTime}
            isSyncing={isSyncing}
          />

          {/* Date & Time Badge */}
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Monday, 28 April 2025</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono-tech text-slate-500">10:24 AM</span>
          </div>
        </div>
      </div>

      {/* Sync Flash Toast Banner when background re-fetch completes */}
      {syncFeedback && (
        <div 
          id="dashboard-sync-feedback-toast"
          className="bg-emerald-50 border border-emerald-200/90 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-semibold">{syncFeedback}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono-tech font-medium">
            Live Database Synced
          </span>
        </div>
      )}

      {/* Real-time Alerts Banner if any critical or warning notifications */}
      {criticalOrWarningAlerts.length > 0 && (
        <div className="bg-white border border-red-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Active Real-Time Alerts ({criticalOrWarningAlerts.length})
                </h3>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  Requires Attention
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
                {lowAttCount > 0 && (
                  <span className="flex items-center space-x-1 text-red-600 font-medium">
                    <UserX className="w-3.5 h-3.5" />
                    <span>{lowAttCount} Low Attendance (&lt;75%)</span>
                  </span>
                )}
                {feeOverdueCount > 0 && (
                  <span className="flex items-center space-x-1 text-amber-600 font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{feeOverdueCount} Overdue Fee Notice{feeOverdueCount > 1 ? 's' : ''}</span>
                  </span>
                )}
                {examDeadlineCount > 0 && (
                  <span className="flex items-center space-x-1 text-indigo-600 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{examDeadlineCount} Upcoming Exam Deadline{examDeadlineCount > 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => onOpenAlerts ? onOpenAlerts() : onSelectModule('attendance')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Open Alert Monitor</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Top 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div 
          onClick={() => onSelectModule('students')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#2563eb]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Students</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">1,248</h3>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>12%</span>
            <span className="text-[11px] font-normal text-slate-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Total Staff */}
        <div 
          onClick={() => onSelectModule('staff')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Staff</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">86</h3>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>5%</span>
            <span className="text-[11px] font-normal text-slate-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Total Classes */}
        <div 
          onClick={() => onSelectModule('classes')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Classes</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">24</h3>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-slate-500">
            <span className="mr-1">→</span>
            <span>0%</span>
            <span className="text-[11px] font-normal text-slate-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Pending Fees */}
        <div 
          onClick={() => onSelectModule('fees')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-red-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6 text-[#ef4444]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Fees</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">
                ₹ {totalPendingFees > 0 ? totalPendingFees.toLocaleString() : '2,45,000'}
              </h3>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-red-500">
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            <span>8%</span>
            <span className="text-[11px] font-normal text-slate-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Attendance Today */}
        <div 
          onClick={() => onSelectModule('attendance')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Attendance Today</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">92%</h3>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>3%</span>
            <span className="text-[11px] font-normal text-slate-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Enrollment Chart + Attendance Gauge + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student Enrollment Overview (Bar Chart) - 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-800 text-sm">Student Enrollment Overview</h3>
            <button 
              onClick={() => onSelectModule('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end space-x-3 text-[11px] text-slate-500 mb-2">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span>New Admissions</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>Re-Admissions</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
              <span>Total Enrolled</span>
            </div>
          </div>

          {/* SVG Bar Chart matching the reference image layout */}
          <div className="relative h-52 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 450 170" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="30" y1="10" x2="440" y2="10" stroke="#f1f5f9" strokeWidth="1" />
              <text x="24" y="14" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Plus Jakarta Sans">200</text>

              <line x1="30" y1="47" x2="440" y2="47" stroke="#f1f5f9" strokeWidth="1" />
              <text x="24" y="51" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Plus Jakarta Sans">150</text>

              <line x1="30" y1="85" x2="440" y2="85" stroke="#f1f5f9" strokeWidth="1" />
              <text x="24" y="89" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Plus Jakarta Sans">100</text>

              <line x1="30" y1="122" x2="440" y2="122" stroke="#f1f5f9" strokeWidth="1" />
              <text x="24" y="126" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Plus Jakarta Sans">50</text>

              <line x1="30" y1="145" x2="440" y2="145" stroke="#e2e8f0" strokeWidth="1" />
              <text x="24" y="148" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Plus Jakarta Sans">0</text>

              {/* Bars for each month */}
              {enrollmentData.map((d, idx) => {
                const groupX = 55 + idx * 64;
                const maxVal = 200;
                const chartHeight = 135;

                // Scale bar heights relative to maxVal
                const h1 = Math.min(chartHeight, (d.newAdm / maxVal) * chartHeight);
                const h2 = Math.min(chartHeight, (d.reAdm / maxVal) * chartHeight);
                const h3 = Math.min(chartHeight, (d.total / 300) * chartHeight); // scaled total for visual balance

                return (
                  <g 
                    key={d.month} 
                    className="cursor-pointer group"
                    onMouseEnter={() => setActiveMonthTooltip(idx)}
                    onMouseLeave={() => setActiveMonthTooltip(null)}
                  >
                    {/* Bar 1: New Admissions (Sky blue) */}
                    <rect
                      x={groupX}
                      y={145 - h1}
                      width="9"
                      height={h1}
                      rx="3"
                      fill="#38bdf8"
                      className="transition-all hover:opacity-85"
                    />
                    {/* Bar 2: Re-Admissions (Teal/Emerald) */}
                    <rect
                      x={groupX + 11}
                      y={145 - h2}
                      width="9"
                      height={h2}
                      rx="3"
                      fill="#10b981"
                      className="transition-all hover:opacity-85"
                    />
                    {/* Bar 3: Total Enrolled (Purple) */}
                    <rect
                      x={groupX + 22}
                      y={145 - h3}
                      width="9"
                      height={h3}
                      rx="3"
                      fill="#a855f7"
                      className="transition-all hover:opacity-85"
                    />
                    {/* Month Label */}
                    <text
                      x={groupX + 16}
                      y="160"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="500"
                      fill="#64748b"
                      fontFamily="Plus Jakarta Sans"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {activeMonthTooltip !== null && (
              <div 
                className="absolute top-2 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-10"
                style={{ left: `${14 + activeMonthTooltip * 14.5}%` }}
              >
                <div className="font-bold border-b border-slate-700 pb-0.5 mb-1">
                  {enrollmentData[activeMonthTooltip].month} Enrollment
                </div>
                <div className="flex justify-between gap-3 text-sky-400">
                  <span>New:</span>
                  <span className="font-bold">{enrollmentData[activeMonthTooltip].newAdm}</span>
                </div>
                <div className="flex justify-between gap-3 text-emerald-400">
                  <span>Re-Adm:</span>
                  <span className="font-bold">{enrollmentData[activeMonthTooltip].reAdm}</span>
                </div>
                <div className="flex justify-between gap-3 text-purple-400 font-bold border-t border-slate-700/60 pt-0.5 mt-0.5">
                  <span>Total:</span>
                  <span>{enrollmentData[activeMonthTooltip].total}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Overview (Donut Chart) - 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Attendance Overview</h3>
          </div>

          <div className="flex items-center justify-center my-3">
            {/* SVG Circular Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="9"
                />
                {/* Present Arc (92% -> strokeDasharray) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="9"
                  strokeDasharray="219 239"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Absent Arc (6.5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="9"
                  strokeDasharray="16 239"
                  strokeDashoffset="-221"
                  strokeLinecap="round"
                />
                {/* Leave Arc (1.5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="9"
                  strokeDasharray="4 239"
                  strokeDashoffset="-237"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">92%</span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Present</span>
              </div>
            </div>
          </div>

          {/* Counts & Legend List */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-slate-600 font-medium">Present</span>
              </div>
              <span className="font-bold text-slate-800">1,148</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-slate-600 font-medium">Absent</span>
              </div>
              <span className="font-bold text-slate-800">82</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-slate-600 font-medium">Leave</span>
              </div>
              <span className="font-bold text-slate-800">18</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (4x2 colorful buttons) - 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-sm">Quick Actions</h3>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                Hub
              </span>
            </div>
            <button 
              id="dashboard-quick-actions-view-all"
              onClick={() => onOpenQuickAction('all')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 px-2 py-1 rounded-lg transition flex items-center space-x-1 group"
              title="Open full quick actions directory"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 flex-1 items-center">
            {/* 1. Add Student */}
            <button
              onClick={() => onOpenQuickAction('add-student')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Add Student
              </span>
            </button>

            {/* 2. Add Staff */}
            <button
              onClick={() => onOpenQuickAction('add-staff')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Add Staff
              </span>
            </button>

            {/* 3. Take Attendance */}
            <button
              onClick={() => onSelectModule('attendance')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Take Attendance
              </span>
            </button>

            {/* 4. Collect Fees */}
            <button
              onClick={() => onOpenQuickAction('collect-fees')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/30 group-hover:scale-105 transition-transform">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Collect Fees
              </span>
            </button>

            {/* 5. Create Exam */}
            <button
              onClick={() => onOpenQuickAction('create-exam')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm shadow-red-500/30 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Create Exam
              </span>
            </button>

            {/* 6. Add Assignment */}
            <button
              onClick={() => onOpenQuickAction('add-assignment')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm shadow-teal-500/30 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Add Assignment
              </span>
            </button>

            {/* 7. Manage Timetable */}
            <button
              onClick={() => onSelectModule('timetable')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Manage Timetable
              </span>
            </button>

            {/* 8. Student Report */}
            <button
              onClick={() => onSelectModule('reports')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-full">
                Student Report
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Attendance Heatmap & Analytical Engine (D3.js) */}
      <AttendanceHeatmapChart 
        students={students} 
        onNavigateToAttendance={() => onSelectModule('attendance')} 
      />

      {/* Side-by-Side Academic Term & Timeframe Comparison (D3.js) */}
      <AttendanceComparisonCard
        students={students}
        onNavigateToAttendance={() => onSelectModule('attendance')}
      />

      {/* Predictive Analytics & Trend Projection Card */}
      <PredictiveAttendanceCard 
        students={students}
        onNavigateToAttendance={() => onSelectModule('attendance')}
      />

      {/* 4. Third Row: Recent Activities + Class Timetable + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activities - 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Recent Activities</h3>
            <button 
              onClick={() => onSelectModule('settings')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {activities.slice(0, 5).map((act, index) => {
              // Icon mapping based on activity type
              let Icon = UserCheck;
              let bg = 'bg-blue-50 text-blue-600';

              if (act.type === 'FEE') {
                Icon = Banknote;
                bg = 'bg-emerald-50 text-emerald-600';
              } else if (act.type === 'ATTENDANCE') {
                Icon = CheckCircle2;
                bg = 'bg-amber-50 text-amber-600';
              } else if (act.type === 'ASSIGNMENT') {
                Icon = FileText;
                bg = 'bg-indigo-50 text-indigo-600';
              } else if (act.type === 'EXAM') {
                Icon = Trophy;
                bg = 'bg-orange-50 text-orange-600';
              }

              return (
                <div key={act.id || index} className="flex items-start space-x-3 text-xs">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 leading-snug truncate">{act.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {act.timestamp} • <span className="text-slate-500 font-medium">{act.module}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Class Timetable - 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Class Timetable</h3>
            <button 
              onClick={() => onSelectModule('timetable')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View Full Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                  <th className="py-2 px-1">Period</th>
                  <th className="py-2 px-2">Time</th>
                  <th className="py-2 px-2">Class 10 (A)</th>
                  <th className="py-2 px-2">Class 9 (B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-2 px-1 font-semibold text-slate-900">1</td>
                  <td className="py-2 px-2 text-slate-500 font-mono-tech text-[10px]">08:00 - 08:45</td>
                  <td className="py-2 px-2 text-slate-800">Mathematics</td>
                  <td className="py-2 px-2 text-slate-800">English</td>
                </tr>
                <tr>
                  <td className="py-2 px-1 font-semibold text-slate-900">2</td>
                  <td className="py-2 px-2 text-slate-500 font-mono-tech text-[10px]">08:45 - 09:30</td>
                  <td className="py-2 px-2 text-slate-800">English</td>
                  <td className="py-2 px-2 text-slate-800">Science</td>
                </tr>
                <tr>
                  <td className="py-2 px-1 font-semibold text-slate-900">3</td>
                  <td className="py-2 px-2 text-slate-500 font-mono-tech text-[10px]">09:45 - 10:30</td>
                  <td className="py-2 px-2 text-slate-800">Science</td>
                  <td className="py-2 px-2 text-slate-800">Mathematics</td>
                </tr>
                <tr>
                  <td className="py-2 px-1 font-semibold text-slate-900">4</td>
                  <td className="py-2 px-2 text-slate-500 font-mono-tech text-[10px]">10:30 - 11:15</td>
                  <td className="py-2 px-2 text-slate-800">Social Science</td>
                  <td className="py-2 px-2 text-slate-800">Hindi</td>
                </tr>
                <tr>
                  <td className="py-2 px-1 font-semibold text-slate-900">5</td>
                  <td className="py-2 px-2 text-slate-500 font-mono-tech text-[10px]">11:30 - 12:15</td>
                  <td className="py-2 px-2 text-slate-800">Hindi</td>
                  <td className="py-2 px-2 text-slate-800">Social Science</td>
                </tr>
                <tr>
                  <td className="py-2 px-1 font-semibold text-slate-900">6</td>
                  <td className="py-2 px-2 text-slate-500 font-mono-tech text-[10px]">12:15 - 01:00</td>
                  <td className="py-2 px-2 text-slate-800">Computer</td>
                  <td className="py-2 px-2 text-slate-800">Computer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events & Notices - 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Upcoming Events & Notices</h3>
            <button 
              onClick={() => onSelectModule('examinations')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {notices.map((n, i) => {
              // Color badges for date blocks matching screenshot
              let dateBg = 'bg-blue-50 text-blue-600';
              if (n.dayMonth.includes('APR') && i === 1) dateBg = 'bg-emerald-50 text-emerald-600';
              if (n.dayMonth.includes('MAY') && i === 2) dateBg = 'bg-amber-50 text-amber-600';
              if (n.dayMonth.includes('MAY') && i === 3) dateBg = 'bg-red-50 text-red-600';

              const [day, month] = n.dayMonth.split(' ');

              return (
                <div key={n.id} className="flex items-start space-x-3 text-xs">
                  <div className={`w-11 h-11 rounded-xl ${dateBg} flex flex-col items-center justify-center shrink-0 border border-slate-200/40`}>
                    <span className="text-sm font-bold leading-none">{day}</span>
                    <span className="text-[9px] font-bold tracking-wider mt-0.5">{month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug truncate">{n.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Fourth Row: Modules & Features Carousel/Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Modules & Features</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {[
            { id: 'students', label: 'Student Management', icon: Users, color: 'text-blue-600 bg-blue-50' },
            { id: 'staff', label: 'Staff Management', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'classes', label: 'Class & Section', icon: GraduationCap, color: 'text-amber-600 bg-amber-50' },
            { id: 'admissions', label: 'Admissions', icon: UserPlus, color: 'text-sky-600 bg-sky-50' },
            { id: 'attendance', label: 'Attendance', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'fees', label: 'Fees & Payments', icon: Banknote, color: 'text-amber-600 bg-amber-50' },
            { id: 'examinations', label: 'Examinations', icon: Award, color: 'text-purple-600 bg-purple-50' },
            { id: 'assignments', label: 'Assignments', icon: ClipboardList, color: 'text-teal-600 bg-teal-50' },
            { id: 'timetable', label: 'Timetable', icon: CalendarDays, color: 'text-indigo-600 bg-indigo-50' },
            { id: 'library', label: 'Library', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
            { id: 'transport', label: 'Transport', icon: Bus, color: 'text-teal-600 bg-teal-50' },
            { id: 'hostel', label: 'Hostel', icon: Building2, color: 'text-cyan-600 bg-cyan-50' },
            { id: 'reports', label: 'Reports', icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
            { id: 'settings', label: 'Settings', icon: Settings, color: 'text-indigo-600 bg-indigo-50' },
          ].map(mod => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id as ERPModule)}
                className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-center group"
              >
                <div className={`w-10 h-10 rounded-full ${mod.color} flex items-center justify-center group-hover:scale-110 transition-transform mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  {mod.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
