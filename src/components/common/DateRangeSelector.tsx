import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Check, 
  Clock, 
  CalendarRange, 
  GraduationCap, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

export type RangePresetId = 
  | 'CURRENT_TERM'
  | 'TERM_1'
  | 'TERM_2'
  | 'TERM_3'
  | 'FULL_YEAR'
  | 'LAST_30_DAYS'
  | 'LAST_60_DAYS'
  | 'LAST_90_DAYS'
  | 'LAST_180_DAYS'
  | 'THIS_MONTH'
  | 'CUSTOM';

export interface DateRangeValue {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
  presetId: RangePresetId;
  termBadge?: string;
}

export interface AcademicTermConfig {
  id: RangePresetId;
  name: string;
  code: string;
  season: string;
  startDate: string;
  endDate: string;
  description: string;
}

// Canonical CBSE / K-12 Indian School Academic Terms (Current cycle 2024-2025 & Term boundaries)
export const ACADEMIC_TERMS: AcademicTermConfig[] = [
  {
    id: 'TERM_3',
    name: 'Term III (Final & Winter)',
    code: 'Term 3',
    season: 'Dec 2024 - Mar 2025',
    startDate: '2024-12-01',
    endDate: '2025-03-31',
    description: 'Final Examinations, Pre-Board Prep, Practical Assessments'
  },
  {
    id: 'TERM_2',
    name: 'Term II (Mid-Term & Autumn)',
    code: 'Term 2',
    season: 'Aug 2024 - Nov 2024',
    startDate: '2024-08-01',
    endDate: '2024-11-30',
    description: 'Mid-Term Examinations, Sports Meet, Cultural Festival'
  },
  {
    id: 'TERM_1',
    name: 'Term I (Foundation & Summer)',
    code: 'Term 1',
    season: 'Apr 2024 - Jul 2024',
    startDate: '2024-04-01',
    endDate: '2024-07-31',
    description: 'Academic Session Induction, Unit Test I, Summer Reopening'
  },
  {
    id: 'FULL_YEAR',
    name: 'Full Academic Year (2024-25)',
    code: 'AY 24-25',
    season: 'Apr 2024 - Mar 2025',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    description: 'Full 12-Month CBSE Session (220 Working Days)'
  }
];

export const getQuickPresets = () => {
  const today = new Date();
  const format = (d: Date) => d.toISOString().slice(0, 10);

  const d30 = new Date(today);
  d30.setDate(today.getDate() - 30);

  const d60 = new Date(today);
  d60.setDate(today.getDate() - 60);

  const d90 = new Date(today);
  d90.setDate(today.getDate() - 90);

  const d180 = new Date(today);
  d180.setDate(today.getDate() - 180);

  const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return [
    { id: 'LAST_30_DAYS' as RangePresetId, label: 'Last 30 Days', startDate: format(d30), endDate: format(today) },
    { id: 'LAST_60_DAYS' as RangePresetId, label: 'Last 60 Days', startDate: format(d60), endDate: format(today) },
    { id: 'LAST_90_DAYS' as RangePresetId, label: 'Last 90 Days', startDate: format(d90), endDate: format(today) },
    { id: 'LAST_180_DAYS' as RangePresetId, label: 'Last 180 Days (6M)', startDate: format(d180), endDate: format(today) },
    { id: 'THIS_MONTH' as RangePresetId, label: 'Current Month', startDate: format(firstDayThisMonth), endDate: format(today) },
  ];
};

interface DateRangeSelectorProps {
  value: DateRangeValue;
  onChange: (newRange: DateRangeValue) => void;
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'TERMS' | 'QUICK' | 'CUSTOM'>('TERMS');
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);
  const [customError, setCustomError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync custom inputs when value changes
  useEffect(() => {
    setCustomStart(value.startDate);
    setCustomEnd(value.endDate);
  }, [value]);

  const handleSelectTerm = (term: AcademicTermConfig) => {
    onChange({
      startDate: term.startDate,
      endDate: term.endDate,
      label: term.name,
      presetId: term.id,
      termBadge: term.code
    });
    setIsOpen(false);
  };

  const handleSelectQuick = (preset: { id: RangePresetId; label: string; startDate: string; endDate: string }) => {
    onChange({
      startDate: preset.startDate,
      endDate: preset.endDate,
      label: preset.label,
      presetId: preset.id
    });
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) {
      setCustomError('Please provide both start and end dates.');
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setCustomError('Start date cannot be after end date.');
      return;
    }
    setCustomError(null);

    const s = new Date(customStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const e = new Date(customEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    onChange({
      startDate: customStart,
      endDate: customEnd,
      label: `${s} - ${e}`,
      presetId: 'CUSTOM',
      termBadge: 'Custom Range'
    });
    setIsOpen(false);
  };

  const handleResetToDefault = () => {
    const defaultQuick = getQuickPresets()[3]; // Last 180 Days
    onChange({
      startDate: defaultQuick.startDate,
      endDate: defaultQuick.endDate,
      label: defaultQuick.label,
      presetId: defaultQuick.id
    });
    setIsOpen(false);
  };

  // Helper formatting for pill display
  const formattedRange = () => {
    const s = new Date(value.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(value.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    return `${s} – ${e}`;
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-2xs transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <CalendarRange className="w-4 h-4 text-emerald-600 shrink-0" />
        <div className="flex items-center space-x-1.5 truncate">
          <span className="text-slate-900 font-bold">{value.label}</span>
          <span className="text-[11px] text-slate-400 font-mono-tech">({formattedRange()})</span>
        </div>
        {value.termBadge && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100/80">
            {value.termBadge}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-xs">Select Date Range & Term</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl my-3 text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('TERMS')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition ${
                activeTab === 'TERMS' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3 h-3 text-emerald-600" />
              <span>Academic Terms</span>
            </button>
            <button
              onClick={() => setActiveTab('QUICK')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition ${
                activeTab === 'QUICK' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Quick Presets</span>
            </button>
            <button
              onClick={() => setActiveTab('CUSTOM')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition ${
                activeTab === 'CUSTOM' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3 h-3 text-amber-600" />
              <span>Custom Range</span>
            </button>
          </div>

          {/* Tab 1: Academic Terms List */}
          {activeTab === 'TERMS' && (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {ACADEMIC_TERMS.map((term) => {
                const isSelected = value.presetId === term.id;
                return (
                  <button
                    key={term.id}
                    onClick={() => handleSelectTerm(term)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-start justify-between ${
                      isSelected 
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs">{term.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-bold">
                          {term.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono-tech mt-0.5">{term.season}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{term.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: Quick Presets List */}
          {activeTab === 'QUICK' && (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {getQuickPresets().map((preset) => {
                const isSelected = value.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectQuick(preset)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-50/70 border-blue-300 text-blue-950' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs">{preset.label}</span>
                      <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">
                        {preset.startDate} to {preset.endDate}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 3: Custom Date Range Form */}
          {activeTab === 'CUSTOM' && (
            <div className="space-y-3 p-1">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono-tech outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono-tech outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {customError && (
                <p className="text-[11px] text-rose-600 font-semibold">{customError}</p>
              )}

              <button
                onClick={handleApplyCustom}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition flex items-center justify-center space-x-1.5"
              >
                <span>Apply Custom Range</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <button
              onClick={handleResetToDefault}
              className="text-slate-500 hover:text-slate-800 text-[11px] font-medium flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Range</span>
            </button>
            <span className="text-[10px] text-slate-400">
              Filtered for school attendance
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
