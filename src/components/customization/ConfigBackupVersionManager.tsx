import React, { useState } from 'react';
import { 
  FileCode, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Clock, 
  History, 
  Save, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';

export const ConfigBackupVersionManager: React.FC = () => {
  const { configSnapshots, store } = useERP();
  const [newSnapshotTitle, setNewSnapshotTitle] = useState('');
  const [newSnapshotDesc, setNewSnapshotDesc] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'SUCCESS' | 'ERROR' } | null>(null);

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotTitle) return;

    store.createConfigSnapshot(
      newSnapshotTitle,
      newSnapshotDesc || 'Manual checkpoint created before system configuration adjustments.'
    );
    setNewSnapshotTitle('');
    setNewSnapshotDesc('');
    setStatusMessage({ text: 'Configuration snapshot checkpoint recorded!', type: 'SUCCESS' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRollback = (id: string, title: string) => {
    if (confirm(`Are you sure you want to rollback the entire system configuration to "${title}"? Current unsaved adjustments will be overwritten.`)) {
      const ok = store.rollbackConfigSnapshot(id);
      if (ok) {
        setStatusMessage({ text: `Rolled back configuration to "${title}".`, type: 'SUCCESS' });
      } else {
        setStatusMessage({ text: 'Rollback failed. Snapshot payload was damaged or missing.', type: 'ERROR' });
      }
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleExportPackage = () => {
    const jsonStr = store.exportConfigurationPackage();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schoolerp-config-pkg-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Configuration JSON package downloaded.', type: 'SUCCESS' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportPackage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = store.importConfigurationPackage(content);
      if (res.success) {
        setStatusMessage({ text: res.message, type: 'SUCCESS' });
      } else {
        setStatusMessage({ text: res.message, type: 'ERROR' });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDomainReset = (scope: 'THEME' | 'NAV' | 'MODULES' | 'ALL') => {
    const label = scope === 'ALL' ? 'FULL FACTORY CUSTOMIZATION DEFAULTS' : `${scope} SETTINGS`;
    if (confirm(`Reset ${label} to certified default factory blueprint?`)) {
      store.resetConfiguration(scope);
      setStatusMessage({ text: `Reset ${label} completed.`, type: 'SUCCESS' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Configuration Snapshots, Versioning & Migrations</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Capture safe rollback checkpoints, export complete multi-campus schema packages, and apply verified JSON blueprints.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <label className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import Package JSON</span>
            <input type="file" accept=".json" onChange={handleImportPackage} className="hidden" />
          </label>

          <button
            onClick={handleExportPackage}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Package</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
          statusMessage.type === 'SUCCESS' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {statusMessage.type === 'SUCCESS' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Create Snapshot & Reset Triggers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Snapshot Creator Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Create Configuration Checkpoint Snapshot
          </h3>

          <form onSubmit={handleCreateSnapshot} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Snapshot Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pre-CBSE Annual Setup 2025-26, Custom Fee Fields Deployed"
                value={newSnapshotTitle}
                onChange={(e) => setNewSnapshotTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description / Release Notes</label>
              <textarea
                rows={2}
                placeholder="Describe recent changes included in this version..."
                value={newSnapshotDesc}
                onChange={(e) => setNewSnapshotDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-xs flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Snapshot (v{configSnapshots.length + 1})</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Domain Factory Reset Box */}
        <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Scoped Factory Reset Triggers</h3>
          <p className="text-xs text-slate-700">
            Selectively reset individual customization sub-systems without losing student attendance and transaction data.
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleDomainReset('THEME')}
              className="w-full px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-between"
            >
              <span>Reset Design Theme & Colors</span>
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => handleDomainReset('NAV')}
              className="w-full px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-between"
            >
              <span>Reset Sidebar Navigation Menu</span>
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => handleDomainReset('MODULES')}
              className="w-full px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-between"
            >
              <span>Reset Modules & Feature Flags</span>
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => handleDomainReset('ALL')}
              className="w-full px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold rounded-lg flex items-center justify-between mt-2"
            >
              <span>Reset ALL Customizations to Defaults</span>
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Version Snapshots Timeline History */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-teal-600" />
            <span>Version Snapshot History ({configSnapshots.length})</span>
          </div>
          <span>Rollback Controls</span>
        </div>

        <div className="divide-y divide-slate-100">
          {configSnapshots.map((snap) => (
            <div key={snap.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono-tech text-xs font-bold">
                    v{snap.version}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">{snap.title}</h4>
                </div>
                <p className="text-[11px] text-slate-700">{snap.description}</p>
                <div className="text-[10px] text-slate-700 font-mono-tech">
                  Captured: {snap.createdAt} by {snap.createdBy}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {snap.canRollback && (
                  <button
                    onClick={() => handleRollback(snap.id, snap.title)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Rollback to v{snap.version}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
