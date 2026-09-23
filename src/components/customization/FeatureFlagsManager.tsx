import React, { useState } from 'react';
import { 
  ToggleRight, 
  ToggleLeft, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';

export const FeatureFlagsManager: React.FC = () => {
  const { featureFlags, store } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'General', 'AI & Automation', 'Security', 'Hardware', 'Experimental'];

  const filteredFlags = featureFlags.filter(f => {
    const matchesSearch = 
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ToggleRight className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Institutional Feature Flags & Beta Capabilities</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Centrally enable, disable, and scope AI features, hardware listeners, and experimental system capabilities.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-tech">
            {featureFlags.filter(f => f.enabled).length} of {featureFlags.length} Flags Active
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search flag key or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Flags Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.map((flag) => {
          const isEnabled = flag.enabled;

          return (
            <div
              key={flag.key}
              className={`p-4.5 rounded-xl border transition-all ${
                isEnabled 
                  ? 'bg-white border-slate-200/90 shadow-xs' 
                  : 'bg-slate-50/70 border-slate-200/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{flag.label}</span>
                    <span className={`text-[10px] font-mono-tech px-2 py-0.5 rounded font-semibold ${
                      flag.category === 'AI & Automation' ? 'bg-purple-100 text-purple-700' :
                      flag.category === 'Security' ? 'bg-blue-100 text-blue-700' :
                      flag.category === 'Hardware' ? 'bg-amber-100 text-amber-700' :
                      flag.category === 'Experimental' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {flag.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-tech text-blue-600 block">{flag.key}</span>
                  <p className="text-xs text-slate-700 leading-relaxed pt-1">{flag.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => store.toggleFeatureFlag(flag.key)}
                  className={`p-1 shrink-0 transition-colors ${isEnabled ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-500'}`}
                  title={isEnabled ? 'Click to disable' : 'Click to enable'}
                >
                  {isEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700 font-mono-tech">
                <div className="flex items-center space-x-2">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">{flag.scope} SCOPE</span>
                  <span>Updated: {flag.updatedAt}</span>
                </div>
                <span className={`font-semibold ${isEnabled ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {isEnabled ? '● LIVE IN RUNTIME' : '○ INACTIVE'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
