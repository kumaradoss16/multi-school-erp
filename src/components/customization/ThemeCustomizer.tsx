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
  Layout,
  Type,
  Maximize2,
  Minimize2,
  Grid,
  Sparkle
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { useTheme } from '../../hooks/useTheme';

export const ThemeCustomizer: React.FC = () => {
  const { themes, store } = useERP();
  
  // Custom design-system layout states hook
  const {
    theme: mode,
    setTheme: setMode,
    sidebarStyle,
    setSidebarStyle,
    contentDensity,
    setContentDensity,
    borderRadius,
    setBorderRadius,
    fontSizeScale,
    setFontSizeScale,
    cardStyle,
    setCardStyle,
    colorTheme,
    setColorTheme
  } = useTheme();

  const [saveSuccess, setSaveSuccess] = useState(false);

  const presets = [
    { id: 'blue', name: 'Ocean Blue (Default)', primary: '#2563eb', secondary: '#1e293b', accent: '#10b981', sidebarBg: '#121c2d' },
    { id: 'emerald', name: 'Forest Emerald', primary: '#059669', secondary: '#0f172a', accent: '#3b82f6', sidebarBg: '#064e3b' },
    { id: 'violet', name: 'Royal Violet', primary: '#7c3aed', secondary: '#1e1b4b', accent: '#f43f5e', sidebarBg: '#1e1b4b' },
    { id: 'rose', name: 'Sunset Rose', primary: '#e11d48', secondary: '#31101d', accent: '#fbbf24', sidebarBg: '#2d0612' },
    { id: 'orange', name: 'Warm Orange', primary: '#ea580c', secondary: '#2d1610', accent: '#06b6d4', sidebarBg: '#3c1e15' },
    { id: 'slate', name: 'Corporate Slate', primary: '#475569', secondary: '#0f172a', accent: '#3b82f6', sidebarBg: '#1e293b' }
  ];

  const handleApplyPreset = (presetId: string) => {
    setColorTheme(presetId as any);
    // Find matching theme in store presets to load custom variables
    const matchingPreset = themes.find(t => t.id.includes(presetId));
    if (matchingPreset) {
      store.setActiveTheme(matchingPreset.id);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetToDefault = () => {
    setMode('light');
    setSidebarStyle('expanded');
    setContentDensity('comfortable');
    setBorderRadius('rounded');
    setFontSizeScale('medium');
    setCardStyle('bordered');
    setColorTheme('blue');
    store.resetConfiguration('THEME');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Design System & Theme Studio</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize typography scales, brand accent palettes, sidebar contrast, layouts and UI densities with instant live reactivity.
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
            onClick={() => {
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 1500);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            <span>{saveSuccess ? 'Preferences Saved!' : 'Apply Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Options Controller */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Group 1: Color Themes & Mode */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Theme Colors & Preferences</h3>
            </div>

            {/* Subgroup: Color Modes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Theme Palette Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'system', label: 'System Sync', icon: Monitor }
                ].map(opt => {
                  const Icon = opt.icon;
                  const active = mode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMode(opt.id as any)}
                      className={`px-3 py-2 border rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                        active 
                          ? 'border-blue-600 bg-blue-50/40 text-blue-700 font-bold' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subgroup: Curated Color Themes */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">Institutional Color Presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presets.map(p => {
                  const active = colorTheme === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                        active 
                          ? 'border-blue-600 bg-blue-50/30' 
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900 text-xs mb-2 block">{p.name}</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.primary }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.secondary }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.accent }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.sidebarBg }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Group 2: Layout & Display custom options */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Layout className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Workspace Layout & Scale</h3>
            </div>

            {/* Subgroup 2.1: Sidebar Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Sidebar Navigation Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'expanded', label: 'Expanded (Text)', desc: 'Standard width' },
                  { id: 'collapsed', label: 'Collapsed (Icons)', desc: 'Slim layout' },
                  { id: 'mini', label: 'Mini Sidebar', desc: 'Minimal footprint' }
                ].map(opt => {
                  const active = sidebarStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSidebarStyle(opt.id as any)}
                      className={`p-2 border rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition text-center ${
                        active 
                          ? 'border-blue-600 bg-blue-50/40 text-blue-700 font-bold' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subgroup 2.2: Content density & font scale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* Density */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Content Spacing Density</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'comfortable', label: 'Comfortable' },
                    { id: 'compact', label: 'Compact Spacing' }
                  ].map(opt => {
                    const active = contentDensity === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setContentDensity(opt.id as any)}
                        className={`px-3 py-2 border rounded-lg text-xs font-semibold text-center transition ${
                          active 
                            ? 'border-blue-600 bg-blue-50/40 text-blue-700' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Scaling */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Font Size Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'small', label: 'Small' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'large', label: 'Large' }
                  ].map(opt => {
                    const active = fontSizeScale === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setFontSizeScale(opt.id as any)}
                        className={`px-2 py-2 border rounded-lg text-xs font-semibold text-center transition ${
                          active 
                            ? 'border-blue-600 bg-blue-50/40 text-blue-700' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subgroup 2.3: Border Radius & Card Styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* Radius */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Corner Border Radius</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sharp', label: 'Sharp' },
                    { id: 'rounded', label: 'Rounded' },
                    { id: 'soft', label: 'Soft' }
                  ].map(opt => {
                    const active = borderRadius === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setBorderRadius(opt.id as any)}
                        className={`px-2 py-2 border rounded-lg text-xs font-semibold text-center transition ${
                          active 
                            ? 'border-blue-600 bg-blue-50/40 text-blue-700' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Style Variations */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Card Container Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'elevated', label: 'Elevated' },
                    { id: 'bordered', label: 'Bordered' },
                    { id: 'flat', label: 'Flat Tint' }
                  ].map(opt => {
                    const active = cardStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setCardStyle(opt.id as any)}
                        className={`px-1 py-2 border rounded-lg text-xs font-semibold text-center transition ${
                          active 
                            ? 'border-blue-600 bg-blue-50/40 text-blue-700' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Workstation UI Simulator */}
        <div className="lg:col-span-5 bg-slate-100 rounded-xl border border-slate-300 p-5 shadow-inner space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Workstation UI Simulator</h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
              Interactive Preview
            </span>
          </div>

          {/* Mini ERP Window */}
          <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-md">
            
            {/* Header bar */}
            <div className="h-8 bg-slate-900 px-3 flex items-center justify-between text-slate-300 text-[10px]">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 font-semibold text-white">Institutional Live Workstation</span>
              </div>
              <span className="font-mono-tech">v3.0.0</span>
            </div>

            {/* Layout simulator split */}
            <div className="flex h-64">
              
              {/* Sidebar Preview */}
              <div 
                className={`p-3 text-white flex flex-col justify-between shrink-0 transition-all duration-200 ${
                  sidebarStyle === 'expanded' ? 'w-36' : sidebarStyle === 'mini' ? 'w-12' : 'w-16'
                }`}
                style={{ 
                  backgroundColor: presets.find(p => p.id === colorTheme)?.sidebarBg || '#121c2d',
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRightWidth: '1px'
                }}
              >
                <div className="space-y-1">
                  <div className="p-1.5 rounded bg-white/10 font-bold text-[9px] flex items-center space-x-1.5">
                    <Sparkle className="w-3 h-3 text-blue-400" style={{ color: presets.find(p => p.id === colorTheme)?.primary }} />
                    {sidebarStyle === 'expanded' && <span className="truncate">Dashboard</span>}
                  </div>
                  <div className="p-1.5 rounded hover:bg-white/5 text-[9px] text-slate-300">
                    {sidebarStyle === 'expanded' ? 'Students' : '👤'}
                  </div>
                  <div className="p-1.5 rounded hover:bg-white/5 text-[9px] text-slate-300">
                    {sidebarStyle === 'expanded' ? 'Academics' : '📚'}
                  </div>
                  <div className="p-1.5 rounded hover:bg-white/5 text-[9px] text-slate-300">
                    {sidebarStyle === 'expanded' ? 'Settings' : '⚙️'}
                  </div>
                </div>

                {sidebarStyle === 'expanded' && (
                  <div className="text-[8px] text-slate-400 border-t border-white/10 pt-1 leading-tight">
                    Role: Principal
                  </div>
                )}
              </div>

              {/* Main Content Preview Area */}
              <div className="flex-1 p-3.5 bg-slate-50 space-y-3 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Delhi Public School
                    </h4>
                    <span className="text-[9px] text-slate-400">Term II Consolidated Overview</span>
                  </div>
                  <button 
                    className="px-2.5 py-1 text-white text-[9px] font-bold rounded shadow-xs"
                    style={{ backgroundColor: presets.find(p => p.id === colorTheme)?.primary || '#2563eb' }}
                  >
                    Action
                  </button>
                </div>

                {/* KPI Card */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block">Daily Attendance</span>
                    <span className="text-xs font-bold text-slate-900">95.4%</span>
                  </div>
                  <span 
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: presets.find(p => p.id === colorTheme)?.accent || '#10b981' }}
                  >
                    Target Met
                  </span>
                </div>

                {/* Card variation list simulator */}
                <div className="space-y-2">
                  <div className={`p-2.5 rounded-lg border bg-white ${
                    cardStyle === 'elevated' ? 'shadow-md border-transparent' : cardStyle === 'flat' ? 'border-transparent bg-slate-100' : 'border-slate-200'
                  }`}>
                    <span className="text-[9px] font-bold text-slate-800 block">Sample Course Card</span>
                    <span className="text-[8px] text-slate-500">Curriculum CBSE Class 10th Math</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guidance Info block */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-blue-900 text-xs space-y-1">
            <span className="font-bold block">💡 Real-Time Layout Application:</span>
            <p className="text-[11px] leading-relaxed">
              When layout preferences are chosen, they are saved inside <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">localStorage</code> and applied globally via class injection on the document root. This ensures that transitions, paddings, densities, card modes, and border curves are calculated dynamically without reload jitter!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
