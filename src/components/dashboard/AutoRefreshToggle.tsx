import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RotateCw, 
  Clock, 
  Check, 
  ChevronDown, 
  Wifi, 
  WifiOff,
  Sparkles
} from 'lucide-react';

interface AutoRefreshToggleProps {
  onRefresh: () => void;
  defaultIntervalSeconds?: number;
  lastSyncedTime?: string;
  isSyncing?: boolean;
}

const STORAGE_KEY_ENABLED = 'school_erp_dashboard_autorefresh_enabled';
const STORAGE_KEY_INTERVAL = 'school_erp_dashboard_autorefresh_interval';

export const AutoRefreshToggle: React.FC<AutoRefreshToggleProps> = ({
  onRefresh,
  defaultIntervalSeconds = 300, // 5 minutes default
  lastSyncedTime,
  isSyncing = false
}) => {
  // Load persisted toggle status & interval or fallback to defaults
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [intervalSeconds, setIntervalSeconds] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INTERVAL);
      return stored ? parseInt(stored, 10) : defaultIntervalSeconds;
    } catch {
      return defaultIntervalSeconds;
    }
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(intervalSeconds);
  const [showCadenceMenu, setShowCadenceMenu] = useState<boolean>(false);
  const [justSynced, setJustSynced] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(isEnabled));
    } catch (e) {
      console.warn('Failed to persist auto-refresh status', e);
    }
  }, [isEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INTERVAL, intervalSeconds.toString());
    } catch (e) {
      console.warn('Failed to persist interval', e);
    }
  }, [intervalSeconds]);

  // Close cadence menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowCadenceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Execute refresh handler with flash feedback
  const executeRefresh = useCallback(() => {
    onRefresh();
    setJustSynced(true);
    setSecondsRemaining(intervalSeconds);
    const timer = setTimeout(() => setJustSynced(false), 2500);
    return () => clearTimeout(timer);
  }, [onRefresh, intervalSeconds]);

  // Main Background Interval Timer (Counts down every second)
  useEffect(() => {
    if (!isEnabled) return;

    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          executeRefresh();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isEnabled, intervalSeconds, executeRefresh]);

  // Reset seconds remaining when interval duration changes
  const handleSelectInterval = (newSeconds: number) => {
    setIntervalSeconds(newSeconds);
    setSecondsRemaining(newSeconds);
    setShowCadenceMenu(false);
  };

  // Toggle switch handler
  const handleToggle = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    if (nextState) {
      setSecondsRemaining(intervalSeconds);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getIntervalLabel = (secs: number) => {
    if (secs === 60) return '1 min';
    if (secs === 180) return '3 mins';
    if (secs === 300) return '5 mins (Standard)';
    if (secs === 600) return '10 mins';
    return `${Math.round(secs / 60)} mins`;
  };

  return (
    <div 
      id="dashboard-autorefresh-container"
      className="flex flex-wrap items-center gap-2 bg-white border border-slate-200/90 rounded-2xl p-1.5 px-3 shadow-2xs text-xs"
    >
      {/* 1. Toggle Switch & Status */}
      <div className="flex items-center space-x-2.5 pr-2 border-r border-slate-100">
        <button
          id="dashboard-autorefresh-toggle"
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={handleToggle}
          title={isEnabled ? "Click to pause background auto-refresh" : "Click to enable 5-minute background auto-refresh"}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
            isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <span className="sr-only">Toggle Background Auto-Refresh</span>
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>

        <div className="flex items-center space-x-1.5">
          {isEnabled ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
          )}

          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-[11px] leading-tight">
              Auto-Refresh
            </span>
            <span className="text-[10px] text-slate-500 leading-tight">
              {isEnabled ? (
                <span className="text-emerald-700 font-medium">Active ({Math.round(intervalSeconds / 60)}m)</span>
              ) : (
                <span className="text-slate-400">Paused</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Live Countdown & Sync Status */}
      <div className="flex items-center space-x-2">
        {isEnabled ? (
          <div 
            id="dashboard-autorefresh-countdown-badge"
            className="flex items-center space-x-1 bg-emerald-50/80 border border-emerald-100 text-emerald-800 px-2 py-1 rounded-xl text-[11px] font-mono-tech font-bold"
            title="Next background data sync in"
          >
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        ) : (
          <div 
            className="flex items-center space-x-1 bg-slate-100 text-slate-500 px-2 py-1 rounded-xl text-[11px] font-medium"
            title="Auto-refresh is currently paused"
          >
            <WifiOff className="w-3 h-3 text-slate-400" />
            <span>Manual Mode</span>
          </div>
        )}

        {/* Cadence Selection Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            id="dashboard-autorefresh-cadence-btn"
            onClick={() => setShowCadenceMenu(!showCadenceMenu)}
            className="flex items-center space-x-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2 py-1 rounded-xl transition"
            title="Change auto-refresh frequency"
          >
            <span>{Math.round(intervalSeconds / 60)}m</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showCadenceMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Refresh Frequency
              </div>
              {[
                { label: 'Every 1 minute', secs: 60 },
                { label: 'Every 3 minutes', secs: 180 },
                { label: 'Every 5 minutes (Default)', secs: 300 },
                { label: 'Every 10 minutes', secs: 600 }
              ].map(opt => (
                <button
                  key={opt.secs}
                  onClick={() => handleSelectInterval(opt.secs)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition text-[11px] ${
                    intervalSeconds === opt.secs ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {intervalSeconds === opt.secs && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Manual Refresh Now Button */}
        <button
          id="dashboard-manual-refresh-btn"
          onClick={executeRefresh}
          disabled={isSyncing}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl transition text-xs font-semibold ${
            justSynced 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
          } ${isSyncing ? 'opacity-80 cursor-not-allowed' : ''}`}
          title="Re-fetch student engagement & attendance data immediately"
        >
          <RotateCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : justSynced ? 'Synced ✓' : 'Refresh Now'}</span>
        </button>
      </div>

      {/* Sync Timestamp / Flash Feedback */}
      {lastSyncedTime && (
        <span className="text-[10px] text-slate-400 hidden xl:inline-block pl-1 font-mono-tech">
          Synced: {lastSyncedTime}
        </span>
      )}
    </div>
  );
};
