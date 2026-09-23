import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineStatusBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showBanner, setShowBanner] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  return (
    <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between transition-all duration-300 z-50 shrink-0 ${
      isOnline ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
    }`}>
      <div className="flex items-center space-x-2 mx-auto">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Connection restored. Local ERP state synchronized successfully.</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode Active — Core ERP data (students, attendance records, invoices) loaded securely from local cache. Changes will auto-sync when network is restored.</span>
          </>
        )}
      </div>
      <button 
        onClick={() => setShowBanner(false)}
        className="text-white/80 hover:text-white font-bold px-2 py-0.5 rounded ml-4 bg-black/15"
      >
        Dismiss
      </button>
    </div>
  );
};
