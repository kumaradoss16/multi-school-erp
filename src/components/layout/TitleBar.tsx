import React, { useState } from 'react';
import { Minus, Square, X, Shield, RefreshCw, Sun, Moon, Laptop } from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { useTheme } from '../../hooks/useTheme';
import { Role } from '../../types';

interface TitleBarProps {
  onSearchClick: () => void;
  activeModule: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onSearchClick, activeModule }) => {
  const { currentUser, schoolProfile, store } = useERP();
  const { theme, setTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-3.5 h-3.5" />;
    if (theme === 'dark') return <Moon className="w-3.5 h-3.5" />;
    return <Laptop className="w-3.5 h-3.5" />;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleMinimize = () => {
    // Desktop simulation feedback
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-12 right-6 bg-slate-800 text-white text-xs px-3 py-2 rounded shadow-lg z-50 animate-bounce';
    toast.innerText = 'Application window minimized to taskbar';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleClose = () => {
    if (confirm('Exit SchoolERP Desktop? Unsaved local changes will remain in local database.')) {
      window.location.reload();
    }
  };

  const roles: { role: Role; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin (Full Access)' },
    { role: 'ADMIN', label: 'School Admin' },
    { role: 'PRINCIPAL', label: 'Principal' },
    { role: 'TEACHER', label: 'Teacher / Faculty' },
    { role: 'ACCOUNTANT', label: 'Accounts Officer' },
    { role: 'LIBRARIAN', label: 'Librarian' },
    { role: 'RECEPTIONIST', label: 'Receptionist' },
  ];

  return (
    <div id="desktop-titlebar" className="h-8 bg-[#1e293b] text-slate-300 flex items-center justify-between px-3 select-none text-xs border-b border-slate-700/60 z-50">
      {/* Left: App Title and System Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 font-semibold text-white tracking-wide">
          <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            S
          </div>
          <span>SchoolERP Desktop</span>
        </div>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400 font-mono-tech text-[11px]">{schoolProfile.academicYear}</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300 capitalize font-medium">{activeModule}</span>
      </div>

      {/* Center: Quick Role Switcher (Simulating multi-user ERP RBAC) */}
      <div className="relative">
        <button 
          onClick={() => setShowRoleSelector(!showRoleSelector)}
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Switch Active User Role to preview RBAC security"
        >
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-[11px] font-medium">Role: {currentUser.roleLabel}</span>
          <RefreshCw className="w-2.5 h-2.5 text-slate-400" />
        </button>

        {showRoleSelector && (
          <div className="absolute top-7 left-1/2 -translate-x-1/2 w-56 bg-slate-800 border border-slate-700 rounded shadow-xl py-1 z-50">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              Switch Active Role
            </div>
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => {
                  store.setCurrentUserRole(r.role);
                  setShowRoleSelector(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between ${
                  currentUser.role === r.role ? 'text-blue-400 font-semibold bg-slate-750' : 'text-slate-300'
                }`}
              >
                <span>{r.label}</span>
                {currentUser.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center space-x-1">
        <button 
          onClick={toggleTheme}
          className="w-7 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
          title={`Switch Theme (Current: ${theme})`}
        >
          {getThemeIcon()}
        </button>
        <button 
          onClick={handleMinimize}
          className="w-7 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={toggleFullscreen}
          className="w-7 h-6 flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
          title={isFullscreen ? "Restore" : "Maximize"}
        >
          <Square className="w-3 h-3" />
        </button>
        <button 
          onClick={handleClose}
          className="w-7 h-6 flex items-center justify-center hover:bg-red-600 rounded text-slate-400 hover:text-white transition"
          title="Close SchoolERP"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
