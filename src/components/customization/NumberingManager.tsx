import React, { useState } from 'react';
import { 
  Hash, 
  Save, 
  Check, 
  Sparkles
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { NumberingConfig } from '../../types';
import { ConfigurationService } from '../../services/configurationService';

export const NumberingManager: React.FC = () => {
  const { numberingConfigs, store } = useERP();
  const [selectedEntityId, setSelectedEntityId] = useState<string>(numberingConfigs[0]?.id || '');
  const [saveToast, setSaveToast] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const activeConfig = numberingConfigs.find(n => n.id === selectedEntityId) || numberingConfigs[0];
  const [workingConfig, setWorkingConfig] = useState<NumberingConfig>(activeConfig);

  React.useEffect(() => {
    if (activeConfig) {
      setWorkingConfig(activeConfig);
      setTestOutput(null);
    }
  }, [activeConfig]);

  const handleSave = () => {
    store.updateNumberingConfig(workingConfig);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleTestGenerate = () => {
    const { formattedNumber } = ConfigurationService.generateSequenceNumber(workingConfig);
    setTestOutput(formattedNumber);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-slate-900">Sequence & Numbering Engine</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Configure format templates, padding lengths, and academic year prefixes for student IDs, receipts, and invoices.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            {saveToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saveToast ? 'Pattern Saved!' : 'Save Sequence Pattern'}</span>
          </button>
        </div>
      </div>

      {/* Entity Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {numberingConfigs.map((cfg) => (
          <button
            key={cfg.id}
            onClick={() => setSelectedEntityId(cfg.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
              selectedEntityId === cfg.id
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cfg.name}</span>
            <span className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded ${
              selectedEntityId === cfg.id ? 'bg-cyan-700/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {cfg.prefix}
            </span>
          </button>
        ))}
      </div>

      {/* Split Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Sequence Rules */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Pattern Rule Settings: {workingConfig.name}
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prefix String</label>
              <input
                type="text"
                value={workingConfig.prefix}
                onChange={(e) => setWorkingConfig({ ...workingConfig, prefix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Suffix (Optional)</label>
              <input
                type="text"
                value={workingConfig.suffix || ''}
                onChange={(e) => setWorkingConfig({ ...workingConfig, suffix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zero Padding Digits</label>
              <select
                value={workingConfig.padding}
                onChange={(e) => setWorkingConfig({ ...workingConfig, padding: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              >
                <option value={3}>3 digits (e.g. 001)</option>
                <option value={4}>4 digits (e.g. 0001)</option>
                <option value={5}>5 digits (e.g. 00001)</option>
                <option value={6}>6 digits (e.g. 000001)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Sequence Counter</label>
              <input
                type="number"
                value={workingConfig.currentSequence}
                onChange={(e) => setWorkingConfig({ ...workingConfig, currentSequence: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={workingConfig.includeYear}
                onChange={(e) => setWorkingConfig({ ...workingConfig, includeYear: e.target.checked })}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="font-semibold text-slate-700">Include Year (2025)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={workingConfig.resetFrequency === 'YEARLY'}
                onChange={(e) => setWorkingConfig({ 
                  ...workingConfig, 
                  resetFrequency: e.target.checked ? 'YEARLY' : 'NEVER' 
                })}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="font-semibold text-slate-700">Auto-Reset Each Year</span>
            </label>
          </div>
        </div>

        {/* Right: Live Generator Test Simulator */}
        <div className="lg:col-span-5 bg-cyan-50/60 rounded-xl border border-cyan-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Sequence Number Simulator</h3>
          <p className="text-xs text-slate-600">
            Preview the exact alphanumeric string that will be assigned to newly created records.
          </p>

          <div className="p-4 bg-white rounded-xl border border-cyan-200 shadow-xs space-y-3 text-center">
            <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider block">
              Live Formatted Number
            </span>
            <div className="text-2xl font-mono-tech font-bold text-slate-900 py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
              {testOutput || `${workingConfig.prefix}-${workingConfig.includeYear ? '2025-' : ''}${String(workingConfig.currentSequence).padStart(workingConfig.padding, '0')}${workingConfig.suffix ? `-${workingConfig.suffix}` : ''}`}
            </div>

            <button
              type="button"
              onClick={handleTestGenerate}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all w-full flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Next Increment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
