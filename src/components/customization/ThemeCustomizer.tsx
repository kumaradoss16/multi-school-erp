import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Eye, 
  Monitor, 
  Moon, 
  Sun,
  Layout
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { ThemeConfig } from '../../types';

export const ThemeCustomizer: React.FC = () => {
  const { themes, activeThemeId, store } = useERP();
  const currentTheme = themes.find(t => t.id === activeThemeId) || themes[0];
  
  const [workingTheme, setWorkingTheme] = useState<ThemeConfig>({ ...currentTheme });
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (currentTheme) {
      setWorkingTheme({ ...currentTheme });
    }
  }, [currentTheme]);

  const handleColorChange = (key: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'sidebarBg' | 'sidebarTextColor', val: string) => {
    const updated: ThemeConfig = {
      ...workingTheme,
      [key]: val
    };
    setWorkingTheme(updated);
  };

  const handleApplyTheme = (theme: ThemeConfig) => {
    store.saveTheme(theme);
    store.setActiveTheme(theme.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveWorkingTheme = () => {
    store.saveTheme(workingTheme);
    store.setActiveTheme(workingTheme.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetToDefault = () => {
    store.resetConfiguration('THEME');
    const def = themes.find(t => t.isDefault) || themes[0];
    if (def) {
      setWorkingTheme({ ...def });
      store.setActiveTheme(def.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Design System & Theme Studio</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Customize typography scales, brand accent palettes, sidebar contrast, and UI corner radiuses with instant live reactivity.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveWorkingTheme}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            <span>{saveSuccess ? 'Theme Applied!' : 'Apply & Save Theme'}</span>
          </button>
        </div>
      </div>

      {/* Preset Cards Carousel */}
      <div>
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          Curated Design System Presets ({themes.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {themes.map((t) => {
            const isActive = t.id === workingTheme.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setWorkingTheme({ ...t });
                  handleApplyTheme(t);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">{t.name}</span>
                  {t.isDefault && (
                    <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 mb-3">
                  <div className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: t.primaryColor }} />
                  <div className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: t.secondaryColor }} />
                  <div className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: t.accentColor }} />
                  <div className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: t.sidebarBg }} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-tech">
                  <span>{t.mode}</span>
                  <span>{t.fontFamily}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customizer Controls & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Tokens Editor */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Design Tokens & Layout Properties
          </h3>

          {/* Color Tokens */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Brand Color Palette Tokens</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Primary Brand</span>
                  <span className="text-[10px] font-mono-tech text-slate-500">{workingTheme.primaryColor}</span>
                </div>
                <input
                  type="color"
                  value={workingTheme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Secondary Brand</span>
                  <span className="text-[10px] font-mono-tech text-slate-500">{workingTheme.secondaryColor}</span>
                </div>
                <input
                  type="color"
                  value={workingTheme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Accent Highlight</span>
                  <span className="text-[10px] font-mono-tech text-slate-500">{workingTheme.accentColor}</span>
                </div>
                <input
                  type="color"
                  value={workingTheme.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Sidebar Navigation</span>
                  <span className="text-[10px] font-mono-tech text-slate-500">{workingTheme.sidebarBg}</span>
                </div>
                <input
                  type="color"
                  value={workingTheme.sidebarBg}
                  onChange={(e) => handleColorChange('sidebarBg', e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Typography Scale */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Primary Typography Family</label>
            <select
              value={workingTheme.fontFamily}
              onChange={(e) => setWorkingTheme({ ...workingTheme, fontFamily: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean ERP Default)</option>
              <option value="Inter">Inter (High-density Workstation)</option>
              <option value="Segoe UI">Segoe UI (Enterprise Windows Native)</option>
              <option value="JetBrains Mono">JetBrains Mono (Technical / Engineering)</option>
              <option value="System">System Default UI Stack</option>
            </select>
          </div>

          {/* Corner Radius & Density */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Border Corner Radius</label>
              <select
                value={workingTheme.borderRadius}
                onChange={(e) => setWorkingTheme({ ...workingTheme, borderRadius: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="none">Sharp / 0px (No Rounding)</option>
                <option value="small">Subtle / 6px</option>
                <option value="medium">Modern / 12px (Recommended)</option>
                <option value="large">Card Rounded / 16px</option>
                <option value="pill">Pill Shape / 24px</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">UI Density Spacing</label>
              <select
                value={workingTheme.density}
                onChange={(e) => setWorkingTheme({ ...workingTheme, density: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="compact">Compact (Dense Data Tables)</option>
                <option value="comfortable">Comfortable (Balanced Standard)</option>
                <option value="spacious">Spacious (Accessible / Touch)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Simulator */}
        <div className="lg:col-span-6 bg-slate-100 rounded-xl border border-slate-300/80 p-5 shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Workstation UI Simulator</h3>
            </div>
            <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
              Interactive Preview
            </span>
          </div>

          {/* Mini ERP Window */}
          <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-md">
            {/* Header bar */}
            <div className="h-8 bg-slate-900 px-3 flex items-center justify-between text-slate-300 text-[10px]">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="ml-2 font-semibold text-white">Delhi Public School Workstation</span>
              </div>
              <span className="font-mono-tech">v2.5.0</span>
            </div>

            {/* Content split */}
            <div className="flex h-56">
              {/* Sidebar Preview */}
              <div 
                className="w-36 p-2.5 text-white flex flex-col justify-between shrink-0"
                style={{ backgroundColor: workingTheme.sidebarBg }}
              >
                <div className="space-y-1">
                  <div className="p-1.5 rounded bg-white/10 font-bold text-[10px] flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: workingTheme.accentColor }} />
                    <span>Dashboard</span>
                  </div>
                  <div className="p-1.5 rounded hover:bg-white/5 text-[10px] text-slate-300">Students</div>
                  <div className="p-1.5 rounded hover:bg-white/5 text-[10px] text-slate-300">Attendance</div>
                  <div className="p-1.5 rounded hover:bg-white/5 text-[10px] text-slate-300">Fees & Accounts</div>
                </div>

                <div className="text-[9px] text-slate-400 border-t border-white/10 pt-1">
                  Logged as: Admin
                </div>
              </div>

              {/* Main Preview Area */}
              <div className="flex-1 p-3 bg-slate-50 space-y-2.5 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs" style={{ fontFamily: workingTheme.fontFamily }}>
                      Academic Performance Overview
                    </h4>
                    <span className="text-[10px] text-slate-500">Term II Consolidated</span>
                  </div>
                  <button 
                    className="px-2.5 py-1 text-white text-[10px] font-bold rounded shadow-xs"
                    style={{ backgroundColor: workingTheme.primaryColor }}
                  >
                    Export
                  </button>
                </div>

                {/* KPI Card */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">Daily Attendance</span>
                    <span className="text-sm font-bold text-slate-900">94.8%</span>
                  </div>
                  <span 
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: workingTheme.accentColor }}
                  >
                    +3.2% Target
                  </span>
                </div>

                {/* Sample Action Button Strip */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    className="flex-1 py-1 text-[10px] font-bold text-white rounded text-center shadow-xs"
                    style={{ backgroundColor: workingTheme.primaryColor }}
                  >
                    Primary Action
                  </button>
                  <button
                    className="flex-1 py-1 text-[10px] font-bold text-white rounded text-center shadow-xs"
                    style={{ backgroundColor: workingTheme.secondaryColor }}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
