import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronDown, 
  CheckCheck, 
  User, 
  ShieldAlert, 
  LogOut, 
  ExternalLink,
  UserX,
  DollarSign,
  Calendar,
  Activity,
  RefreshCw,
  Trash2,
  Sliders,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { ERPModule } from './Sidebar';
import { notificationEngine } from '../../services/notificationEngine';
import { soundManager } from '../../services/notificationAudio';
import { AppNotification } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onSelectModule: (module: ERPModule) => void;
  onOpenAlerts?: () => void;
  onSelectStudent?: (studentId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onOpenSearch, 
  onSelectModule,
  onOpenAlerts,
  onSelectStudent
}) => {
  const { currentUser, notifications, store } = useERP();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());

  const visibleNotifications = store.getVisibleNotifications(currentUser.role, currentUser.name);
  const unreadCount = visibleNotifications.filter(n => (n.status === 'unread' || (!n.status && !n.read)) && (n.status as string) !== 'resolved').length;
  const criticalCount = visibleNotifications.filter(n => (n.status === 'unread' || (!n.status && !n.read)) && (n.status as string) !== 'resolved' && (n.urgency === 'CRITICAL' || n.type === 'error')).length;

  const filteredNotifications = visibleNotifications.filter(n => {
    if ((n.status as string) === 'resolved' || (n.status as string) === 'dismissed') return false;
    if (activeCategoryFilter === 'ALL') return true;
    return n.category === activeCategoryFilter;
  });

  const handleScan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScanning(true);
    setTimeout(() => {
      notificationEngine.runDiagnosticScan(true);
      setIsScanning(false);
    }, 500);
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    soundManager.setSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundManager.playAlertChime('INFO');
    }
  };

  const handleItemClick = (notif: AppNotification) => {
    store.markNotificationAsRead(notif.id, currentUser.name);
    setShowNotifications(false);
    const mod = notif.module.toLowerCase();
    if (mod === 'admissions') onSelectModule('admissions');
    else if (mod === 'fees') onSelectModule('fees');
    else if (mod === 'examinations') onSelectModule('examinations');
    else if (mod === 'frontoffice') onSelectModule('frontoffice');
    else if (mod === 'academics') onSelectModule('academics');
    else if (mod === 'welfare') onSelectModule('welfare');
    else if (mod === 'inventory') onSelectModule('inventory');
    else if (mod === 'integrations') onSelectModule('integrations');
    else if (mod === 'staff') onSelectModule('staff');
    else if (mod === 'attendance') {
      onSelectModule('attendance');
      if (notif.targetId && onSelectStudent) {
        onSelectStudent(notif.targetId);
      }
    } else if (mod === 'students') {
      onSelectModule('students');
      if (notif.targetId && onSelectStudent) {
        onSelectStudent(notif.targetId);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ATTENDANCE':
        return <UserX className="w-3.5 h-3.5 text-red-600" />;
      case 'FEE':
        return <DollarSign className="w-3.5 h-3.5 text-amber-600" />;
      case 'EXAM':
        return <Calendar className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-20 shrink-0 shadow-xs">
      {/* Left: Hamburger + Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div 
          onClick={onOpenSearch}
          className="flex-1 flex items-center bg-[#f1f5f9] hover:bg-[#e2e8f0]/80 rounded-xl px-4 py-2 text-slate-500 cursor-pointer transition border border-transparent hover:border-slate-300"
        >
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <span className="text-sm font-medium text-slate-400">
            Search scholars, invoices, faculty or exams...
          </span>
          <div className="ml-auto hidden sm:flex items-center space-x-1">
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs font-mono-tech">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center space-x-5">
        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={`p-2 rounded-xl relative transition ${
              showNotifications 
                ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Real-Time Notification & Event Center"
          >
            <Bell className={`w-5 h-5 ${criticalCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`} />
            {unreadCount > 0 && (
              <span className={`absolute top-1 right-1 min-w-4 h-4 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white ${
                criticalCount > 0 ? 'bg-red-600 animate-bounce' : 'bg-blue-600'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 sm:w-110 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col">
              {/* Header */}
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">Real-Time Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} active
                    </span>
                  )}
                  {criticalCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      {criticalCount} critical
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleToggleSound}
                    title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleScan}
                    title="Scan all institutional tables for alerts"
                    disabled={isScanning}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => store.markAllAsRead(currentUser.name)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-semibold pl-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>All read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center space-x-1 overflow-x-auto text-[11px]">
                {[
                  { id: 'ALL', label: 'All Alerts' },
                  { id: 'ATTENDANCE', label: '🚨 Attendance (<75%)' },
                  { id: 'FEE', label: '💰 Fees Overdue' },
                  { id: 'EXAM', label: '📅 Exam Deadlines' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                      activeCategoryFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <ShieldAlert className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                    <p className="font-semibold text-slate-600">No alerts in this category</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Thresholds are within optimal parameters.</p>
                  </div>
                ) : (
                  filteredNotifications.map(notif => {
                    const isCritical = notif.urgency === 'CRITICAL' || notif.type === 'error';
                    const isWarning = notif.urgency === 'WARNING' || notif.type === 'warning';

                    return (
                      <div 
                        key={notif.id}
                        onClick={() => handleItemClick(notif)}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer flex items-start space-x-3 transition group ${
                          !notif.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          notif.category === 'ATTENDANCE' ? 'bg-red-100' :
                          notif.category === 'FEE' ? 'bg-amber-100' :
                          notif.category === 'EXAM' ? 'bg-indigo-100' : 'bg-blue-100'
                        }`}>
                          {getCategoryIcon(notif.category)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 truncate">
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                isCritical ? 'bg-red-100 text-red-800' :
                                isWarning ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {notif.urgency}
                              </span>
                              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition">
                                {notif.title}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1 font-mono-tech">{notif.time}</span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>

                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            <span className="inline-block text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                              {notif.module} Module
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  store.markNotificationAsResolved(notif.id, currentUser.name);
                                }}
                                className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold px-1.5 py-0.5 bg-emerald-50 rounded"
                                title="Mark as resolved"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  store.dismissNotification(notif.id);
                                }}
                                className="text-[10px] text-slate-400 hover:text-red-600 p-0.5"
                                title="Dismiss notification"
                              >
                                Dismiss
                              </button>
                              <span className="text-[10px] text-blue-600 font-bold flex items-center space-x-0.5 group-hover:underline">
                                <span>Inspect</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Bar */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (onOpenAlerts) onOpenAlerts();
                  }}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Open Full Alert Monitor</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      notificationEngine.simulateLowAttendanceAlert();
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                    title="Simulate student attendance drop for testing"
                  >
                    + Sim Attendance
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => {
                      notificationEngine.simulateFeeOverdueAlert();
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                    title="Simulate overdue fee alert for testing"
                  >
                    + Sim Fee
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Tile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-semibold text-sm text-slate-800 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-xs text-slate-500">
                {currentUser.roleLabel}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{currentUser.roleLabel}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectModule('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Institution Profile</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono-tech">Settings</span>
                </button>
                <button
                  onClick={() => {
                    onSelectModule('reports');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Security Audit Log</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono-tech">Audit</span>
                </button>
                {onOpenAlerts && (
                  <button
                    onClick={() => {
                      onOpenAlerts();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 flex items-center justify-between font-semibold"
                  >
                    <span>Real-Time Alert Monitor</span>
                    <Activity className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    store.setCurrentUserRole('SUPER_ADMIN');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>Switch Role (Admin / Principal / Accounts)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
