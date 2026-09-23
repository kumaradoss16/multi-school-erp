import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  Wifi, 
  Shield, 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  UserX, 
  DollarSign, 
  Calendar, 
  Bell,
  Activity
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { ERPModule } from './Sidebar';

interface StatusBarProps {
  onOpenAlerts?: () => void;
  onSelectModule?: (module: ERPModule) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  onOpenAlerts,
  onSelectModule 
}) => {
  const { currentUser, lastBackupDate, auditLogs, notifications } = useERP();
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  // Filter high-priority or unread alerts for ticker
  const activeAlerts = notifications.filter(n => !n.read || n.urgency === 'CRITICAL' || n.urgency === 'WARNING');
  const alertPool = activeAlerts.length > 0 ? activeAlerts : notifications;

  // Auto-cycle ticker every 4.5 seconds
  useEffect(() => {
    if (alertPool.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAlertIndex(prev => (prev + 1) % alertPool.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [alertPool.length]);

  const currentAlert = alertPool[currentAlertIndex] || alertPool[0];

  const handlePrevAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentAlertIndex(prev => (prev - 1 + alertPool.length) % alertPool.length);
  };

  const handleNextAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentAlertIndex(prev => (prev + 1) % alertPool.length);
  };

  const handleTickerClick = () => {
    if (onOpenAlerts) {
      onOpenAlerts();
    } else if (currentAlert && onSelectModule) {
      const mod = currentAlert.module.toLowerCase();
      if (mod === 'attendance') onSelectModule('attendance');
      else if (mod === 'fees') onSelectModule('fees');
      else if (mod === 'examinations') onSelectModule('examinations');
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'ATTENDANCE':
        return <UserX className="w-3 h-3 text-red-400" />;
      case 'FEE':
        return <DollarSign className="w-3 h-3 text-amber-400" />;
      case 'EXAM':
        return <Calendar className="w-3 h-3 text-indigo-400" />;
      default:
        return <Bell className="w-3 h-3 text-blue-400" />;
    }
  };

  const criticalCount = notifications.filter(n => !n.read && (n.urgency === 'CRITICAL' || n.type === 'error')).length;
  const warningCount = notifications.filter(n => !n.read && (n.urgency === 'WARNING' || n.type === 'warning')).length;

  return (
    <footer 
      id="desktop-statusbar"
      className="h-7 bg-[#0b1329] text-slate-400 flex items-center justify-between px-3 text-[11px] font-mono-tech border-t border-slate-800/80 select-none shrink-0 z-20 gap-3"
    >
      {/* Left: Database & Real-Time Alert Ticker */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Database Status Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 shrink-0" title="Local ACID transactional database">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-400">DB:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Real-Time Live Alert Ticker */}
        {currentAlert ? (
          <div 
            onClick={handleTickerClick}
            className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700/60 cursor-pointer transition max-w-md sm:max-w-xl truncate group shadow-2xs"
            title="Click to inspect real-time alert center"
          >
            <div className="flex items-center space-x-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              {getAlertIcon(currentAlert.category || 'SYSTEM')}
              <span className={`text-[10px] font-bold uppercase ${
                currentAlert.urgency === 'CRITICAL' ? 'text-red-400' :
                currentAlert.urgency === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                [{currentAlert.category || currentAlert.module}]:
              </span>
            </div>

            <span className="truncate text-slate-200 font-medium group-hover:text-white transition">
              {currentAlert.title}
            </span>

            {/* Stepper buttons */}
            <div className="flex items-center space-x-0.5 ml-1 shrink-0">
              <button
                onClick={handlePrevAlert}
                className="hover:text-white p-0.5 text-slate-500 hover:bg-slate-700/50 rounded"
                title="Previous Alert"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-slate-500 font-mono-tech">
                {currentAlertIndex + 1}/{alertPool.length}
              </span>
              <button
                onClick={handleNextAlert}
                className="hover:text-white p-0.5 text-slate-500 hover:bg-slate-700/50 rounded"
                title="Next Alert"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>All systems nominal: No active alerts</span>
          </div>
        )}
      </div>

      {/* Right: Real-Time Engine Health, RBAC, Version */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Real-Time Event Monitor Button */}
        <button
          onClick={onOpenAlerts}
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md font-semibold transition cursor-pointer border ${
            criticalCount > 0 
              ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
              : warningCount > 0 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
          title="Open Real-Time Notification & Event Monitor"
        >
          <Activity className={`w-3 h-3 ${criticalCount > 0 ? 'animate-pulse text-red-400' : 'text-emerald-400'}`} />
          <span>
            {criticalCount > 0 
              ? `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}`
              : warningCount > 0 
                ? `${warningCount} Warning${warningCount > 1 ? 's' : ''}`
                : 'Events Monitored'}
          </span>
        </button>

        <span className="text-slate-700 hidden md:inline">|</span>

        {/* Backup Status */}
        <div className="hidden lg:flex items-center space-x-1.5" title="Latest verified snapshot">
          <HardDrive className="w-3 h-3 text-blue-400" />
          <span className="text-slate-400">Snapshot:</span>
          <span className="text-slate-200">{lastBackupDate}</span>
        </div>

        <span className="text-slate-700 hidden lg:inline">|</span>

        {/* Security / RBAC */}
        <div className="hidden xl:flex items-center space-x-1.5" title="Role-based access control enabled">
          <Shield className="w-3 h-3 text-indigo-400" />
          <span className="text-slate-400">RBAC:</span>
          <span className="text-indigo-300 font-semibold">{currentUser.role}</span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Version */}
        <div className="text-slate-400 font-semibold">
          SchoolERP <span className="text-blue-400">v1.0.4-x64</span>
        </div>
      </div>
    </footer>
  );
};
