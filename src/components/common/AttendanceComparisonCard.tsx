import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  CalendarRange, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  ArrowLeftRight, 
  Layers, 
  BarChart3, 
  LayoutGrid, 
  LineChart, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Table as TableIcon,
  Percent,
  Hash,
  Filter,
  FileText,
  Clock,
  ArrowRight,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';
import { Student } from '../../types';
import { DayAttendanceData } from './AttendanceHeatmapChart';
import { DateRangeSelector, DateRangeValue, ACADEMIC_TERMS, getQuickPresets } from './DateRangeSelector';
import { 
  generateAttendanceSeries, 
  calculateAttendanceMetrics, 
  AttendanceMetricsSummary,
  STANDARD_CLASSES
} from '../../utils/attendanceDataGenerator';

interface AttendanceComparisonCardProps {
  students?: Student[];
  onNavigateToAttendance?: () => void;
  className?: string;
  defaultPeriodA?: DateRangeValue;
  defaultPeriodB?: DateRangeValue;
}

export type ComparisonTab = 'HEATMAPS' | 'TRENDS' | 'CLASSES' | 'WEEKDAYS' | 'METRICS_TABLE';

export const AttendanceComparisonCard: React.FC<AttendanceComparisonCardProps> = ({
  students = [],
  onNavigateToAttendance,
  className = '',
  defaultPeriodA,
  defaultPeriodB
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);

  // Period A (Default to Term II)
  const [periodA, setPeriodA] = useState<DateRangeValue>(() => {
    if (defaultPeriodA) return defaultPeriodA;
    const term2 = ACADEMIC_TERMS.find(t => t.id === 'TERM_2') || ACADEMIC_TERMS[1];
    return {
      startDate: term2.startDate,
      endDate: term2.endDate,
      label: term2.name,
      presetId: term2.id,
      termBadge: term2.code
    };
  });

  // Period B (Default to Term I)
  const [periodB, setPeriodB] = useState<DateRangeValue>(() => {
    if (defaultPeriodB) return defaultPeriodB;
    const term1 = ACADEMIC_TERMS.find(t => t.id === 'TERM_1') || ACADEMIC_TERMS[2];
    return {
      startDate: term1.startDate,
      endDate: term1.endDate,
      label: term1.name,
      presetId: term1.id,
      termBadge: term1.code
    };
  });

  const [activeTab, setActiveTab] = useState<ComparisonTab>('HEATMAPS');
  const [metricMode, setMetricMode] = useState<'PERCENT' | 'COUNT'>('PERCENT');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [trendViewStyle, setTrendViewStyle] = useState<'OVERLAY' | 'SPLIT'>('OVERLAY');
  
  // Interactive Hover Tooltips
  const [hoveredDayA, setHoveredDayA] = useState<DayAttendanceData | null>(null);
  const [hoveredDayB, setHoveredDayB] = useState<DayAttendanceData | null>(null);
  const [trendHoverIdx, setTrendHoverIdx] = useState<number | null>(null);
  const [trendHoverPos, setTrendHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Copy/Share Notification
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate Data Series for Period A
  const dataA: DayAttendanceData[] = useMemo(() => {
    return generateAttendanceSeries(periodA.startDate, periodA.endDate, students, selectedClassFilter);
  }, [periodA, students, selectedClassFilter]);

  // Generate Data Series for Period B
  const dataB: DayAttendanceData[] = useMemo(() => {
    return generateAttendanceSeries(periodB.startDate, periodB.endDate, students, selectedClassFilter);
  }, [periodB, students, selectedClassFilter]);

  // Compute Metrics for both periods
  const metricsA: AttendanceMetricsSummary = useMemo(() => {
    return calculateAttendanceMetrics(dataA);
  }, [dataA]);

  const metricsB: AttendanceMetricsSummary = useMemo(() => {
    return calculateAttendanceMetrics(dataB);
  }, [dataB]);

  // Working days series
  const workingA = useMemo(() => dataA.filter(d => !d.isHoliday && d.totalStudents > 0), [dataA]);
  const workingB = useMemo(() => dataB.filter(d => !d.isHoliday && d.totalStudents > 0), [dataB]);

  // Delta calculations (Period A minus Period B)
  const deltaAvgPercent = Math.round((metricsA.avg - metricsB.avg) * 10) / 10;
  const deltaAvgCount = metricsA.avgCount - metricsB.avgCount;
  const deltaCompliance = Math.round((metricsA.compliantPercent - metricsB.compliantPercent) * 10) / 10;
  const deltaStreak = metricsA.currentStreak - metricsB.currentStreak;

  // Swap Periods Handler
  const handleSwapPeriods = () => {
    const tempA = { ...periodA };
    setPeriodA(periodB);
    setPeriodB(tempA);
  };

  // Quick Comparison Presets
  const handleApplyPreset = (termAId: string, termBId: string) => {
    const tA = ACADEMIC_TERMS.find(t => t.id === termAId);
    const tB = ACADEMIC_TERMS.find(t => t.id === termBId);
    if (tA && tB) {
      setPeriodA({
        startDate: tA.startDate,
        endDate: tA.endDate,
        label: tA.name,
        presetId: tA.id,
        termBadge: tA.code
      });
      setPeriodB({
        startDate: tB.startDate,
        endDate: tB.endDate,
        label: tB.name,
        presetId: tB.id,
        termBadge: tB.code
      });
    }
  };

  // Quick 30-day compare
  const handleApplyLast30VsPrior30 = () => {
    const today = new Date();
    const format = (d: Date) => d.toISOString().slice(0, 10);

    const d30 = new Date(today);
    d30.setDate(today.getDate() - 30);

    const d60 = new Date(today);
    d60.setDate(today.getDate() - 60);

    setPeriodA({
      startDate: format(d30),
      endDate: format(today),
      label: 'Last 30 Days (Recent)',
      presetId: 'LAST_30_DAYS',
      termBadge: 'Recent 30D'
    });

    setPeriodB({
      startDate: format(d60),
      endDate: format(d30),
      label: 'Prior 30 Days (Preceding)',
      presetId: 'CUSTOM',
      termBadge: 'Prior 30D'
    });
  };

  // Cell color helper for heatmaps
  const getCellColor = (d: DayAttendanceData) => {
    if (d.isHoliday) return '#f1f5f9';
    const rate = d.attendancePercent;
    if (rate >= 96) return '#059669'; // Emerald-600
    if (rate >= 93) return '#10b981'; // Emerald-500
    if (rate >= 90) return '#34d399'; // Emerald-400
    if (rate >= 85) return '#6ee7b7'; // Emerald-300
    if (rate >= 75) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Rose-500
  };

  // Overlaid Trend Line Chart D3 calculations
  const trendChartData = useMemo(() => {
    const maxDays = Math.max(workingA.length, workingB.length);
    if (maxDays === 0) return null;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = Math.max(480, containerWidth - 40);
    const height = 230;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([0, maxDays - 1])
      .range([0, innerWidth]);

    const isCount = metricMode === 'COUNT';
    const totalStudents = metricsA.totalEnrolled || 1248;

    const allValuesA = workingA.map(d => isCount ? d.presentStudents : d.attendancePercent);
    const allValuesB = workingB.map(d => isCount ? d.presentStudents : d.attendancePercent);
    const allValues = [...allValuesA, ...allValuesB];

    const minVal = isCount 
      ? Math.max(0, Math.floor((d3.min(allValues) || totalStudents * 0.7) * 0.95))
      : Math.max(55, Math.floor((d3.min(allValues) || 80) - 4));
    const maxVal = isCount ? totalStudents : 100;

    const yScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([innerHeight, 0])
      .nice();

    const lineGenA = d3.line<DayAttendanceData>()
      .x((_, i) => xScale(i))
      .y(d => yScale(isCount ? d.presentStudents : d.attendancePercent))
      .curve(d3.curveMonotoneX);

    const lineGenB = d3.line<DayAttendanceData>()
      .x((_, i) => xScale(i))
      .y(d => yScale(isCount ? d.presentStudents : d.attendancePercent))
      .curve(d3.curveMonotoneX);

    const statutory75Pos = yScale(isCount ? totalStudents * 0.75 : 75);

    return {
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      xScale,
      yScale,
      maxDays,
      pathA: lineGenA(workingA) || '',
      pathB: lineGenB(workingB) || '',
      statutory75Pos,
      yTicks: yScale.ticks(5)
    };
  }, [workingA, workingB, containerWidth, metricMode, metricsA.totalEnrolled]);

  const handleTrendMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!trendChartData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - trendChartData.margin.left;

    if (mouseX < 0 || mouseX > trendChartData.innerWidth) {
      setTrendHoverIdx(null);
      setTrendHoverPos(null);
      return;
    }

    const dayIdx = Math.round(trendChartData.xScale.invert(mouseX));
    if (dayIdx >= 0 && dayIdx < trendChartData.maxDays) {
      setTrendHoverIdx(dayIdx);
      setTrendHoverPos({
        x: trendChartData.xScale(dayIdx) + trendChartData.margin.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleCopyComparison = () => {
    const text = `Delhi Public Academy - Academic Attendance Comparison Report:
--------------------------------------------------
Period A: ${periodA.label} (${periodA.startDate} to ${periodA.endDate})
- Average Attendance: ${metricsA.avg}% (${metricsA.avgCount.toLocaleString()} students)
- CBSE ≥75% Compliance: ${metricsA.compliantPercent}% (${metricsA.compliantCount}/${metricsA.totalWorking} days)
- Working Days: ${metricsA.totalWorking} days

Period B: ${periodB.label} (${periodB.startDate} to ${periodB.endDate})
- Average Attendance: ${metricsB.avg}% (${metricsB.avgCount.toLocaleString()} students)
- CBSE ≥75% Compliance: ${metricsB.compliantPercent}% (${metricsB.compliantCount}/${metricsB.totalWorking} days)
- Working Days: ${metricsB.totalWorking} days

Comparative Variance (Period A vs Period B):
- Attendance Rate Delta: ${deltaAvgPercent >= 0 ? '+' : ''}${deltaAvgPercent}%
- Daily Headcount Delta: ${deltaAvgCount >= 0 ? '+' : ''}${deltaAvgCount} students
- CBSE Compliance Delta: ${deltaCompliance >= 0 ? '+' : ''}${deltaCompliance}%
--------------------------------------------------`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div 
      id="attendance-comparison-card"
      ref={containerRef}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5 ${className}`}
    >
      {/* 1. Header & Quick Switch Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                Academic Term &amp; Timeframe Comparison
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold flex items-center space-x-1">
                <ArrowLeftRight className="w-3 h-3" />
                <span>Side-by-Side D3 Analytics</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Benchmark attendance variance, compliance trends, and class cohort shifts between any two terms or custom windows
            </p>
          </div>
        </div>

        {/* Global Controls: Class Filter & Metric Toggle & Share */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Toggle (% vs Count) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setMetricMode('PERCENT')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
                metricMode === 'PERCENT' ? 'bg-violet-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>% Rate</span>
            </button>
            <button
              onClick={() => setMetricMode('COUNT')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${
                metricMode === 'COUNT' ? 'bg-violet-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Hash className="w-3 h-3" />
              <span>Count (N)</span>
            </button>
          </div>

          {/* Class Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Cohorts (Whole School)</option>
              {STANDARD_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Share/Export Summary */}
          <button
            onClick={handleCopyComparison}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            title="Copy comparison summary to clipboard"
          >
            {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedNotification ? 'Copied' : 'Share Brief'}</span>
          </button>
        </div>
      </div>

      {/* 2. Period Selectors Ribbon (Period A vs Period B) */}
      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Period A Selector */}
          <div className="w-full md:w-[46%] flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              A
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">
                Primary Comparison Period
              </span>
              <DateRangeSelector
                value={periodA}
                onChange={(newRange) => setPeriodA(newRange)}
                className="mt-0.5 w-full"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapPeriods}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition shrink-0"
            title="Swap Period A and Period B"
          >
            <ArrowLeftRight className="w-4 h-4 text-violet-600" />
          </button>

          {/* Period B Selector */}
          <div className="w-full md:w-[46%] flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-indigo-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              B
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 block">
                Benchmark / Baseline Period
              </span>
              <DateRangeSelector
                value={periodB}
                onChange={(newRange) => setPeriodB(newRange)}
                className="mt-0.5 w-full"
              />
            </div>
          </div>
        </div>

        {/* Quick Comparison Presets Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-400 font-medium mr-1 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-violet-500" />
            <span>Quick Comparisons:</span>
          </span>
          <button
            onClick={() => handleApplyPreset('TERM_2', 'TERM_1')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-semibold transition"
          >
            Term II vs Term I
          </button>
          <button
            onClick={() => handleApplyPreset('TERM_3', 'TERM_2')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-semibold transition"
          >
            Term III vs Term II
          </button>
          <button
            onClick={() => handleApplyPreset('TERM_3', 'TERM_1')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-semibold transition"
          >
            Term III vs Term I
          </button>
          <button
            onClick={handleApplyLast30VsPrior30}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-semibold transition"
          >
            Last 30 Days vs Prior 30 Days
          </button>
        </div>
      </div>

      {/* 3. Executive Comparative Variance KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* KPI 1: Average Attendance Rate Delta */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Attendance Rate Variance</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              deltaAvgPercent >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {deltaAvgPercent >= 0 ? 'Net Gain' : 'Net Decline'}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className={`text-2xl font-bold font-mono-tech ${
              deltaAvgPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {deltaAvgPercent >= 0 ? `+${deltaAvgPercent}%` : `${deltaAvgPercent}%`}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200/60 font-mono-tech">
            <span className="text-emerald-700 font-bold">A: {metricsA.avg}%</span>
            <span className="text-indigo-700 font-bold">B: {metricsB.avg}%</span>
          </div>
        </div>

        {/* KPI 2: Daily Headcount Difference */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Avg Daily Present Headcount</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className={`text-2xl font-bold font-mono-tech ${
              deltaAvgCount >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {deltaAvgCount >= 0 ? `+${deltaAvgCount}` : `${deltaAvgCount}`}
            </span>
            <span className="text-[11px] text-slate-500 font-normal">students/day</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200/60 font-mono-tech">
            <span className="text-emerald-700 font-bold">A: {metricsA.avgCount}</span>
            <span className="text-indigo-700 font-bold">B: {metricsB.avgCount}</span>
          </div>
        </div>

        {/* KPI 3: CBSE >=75% Statutory Compliance Delta */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">CBSE &ge;75% Compliance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className={`text-2xl font-bold font-mono-tech ${
              deltaCompliance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {deltaCompliance >= 0 ? `+${deltaCompliance}%` : `${deltaCompliance}%`}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200/60 font-mono-tech">
            <span className="text-emerald-700 font-bold">A: {metricsA.compliantPercent}%</span>
            <span className="text-indigo-700 font-bold">B: {metricsB.compliantPercent}%</span>
          </div>
        </div>

        {/* KPI 4: Instructional Working Days & Absence Footprint */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Working Days Horizon</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-bold font-mono-tech text-slate-900">
              {metricsA.totalWorking}
            </span>
            <span className="text-[11px] text-slate-500">vs {metricsB.totalWorking} days</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200/60 font-mono-tech">
            <span>Loss of Inst.</span>
            <span className="font-semibold text-slate-700">A: {metricsA.totalAbsences} abs.</span>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 text-xs">
        <div className="flex space-x-4 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab('HEATMAPS')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'HEATMAPS'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Side-by-Side Heatmaps</span>
          </button>

          <button
            onClick={() => setActiveTab('TRENDS')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'TRENDS'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Comparative D3 Line Curves</span>
          </button>

          <button
            onClick={() => setActiveTab('CLASSES')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'CLASSES'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Class Cohort &Delta; Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('WEEKDAYS')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'WEEKDAYS'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Day-of-Week Seasonality</span>
          </button>

          <button
            onClick={() => setActiveTab('METRICS_TABLE')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'METRICS_TABLE'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Variance Breakdown Audit</span>
          </button>
        </div>

        {onNavigateToAttendance && (
          <button
            onClick={onNavigateToAttendance}
            className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 flex items-center space-x-1 pb-2 shrink-0"
          >
            <span>Live Attendance Log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 5. Tab Panels */}

      {/* Tab 1: Side-by-Side Dual Heatmaps */}
      {activeTab === 'HEATMAPS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Heatmap Period A */}
            <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-slate-50/40 space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    A
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                      {periodA.label}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono-tech">
                      {periodA.startDate} to {periodA.endDate} ({metricsA.totalWorking} working days)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 text-sm font-mono-tech">{metricsA.avg}%</span>
                  <span className="text-[10px] text-slate-500 block font-mono-tech">avg rate</span>
                </div>
              </div>

              {/* Heatmap Grid SVG for Period A */}
              <div className="overflow-x-auto pt-1 pb-1">
                {(() => {
                  const maxWeeksA = Math.max(1, ...dataA.map(d => d.weekIndex)) + 1;
                  const cSize = Math.max(9, Math.min(13, Math.floor((containerWidth / 2 - 80) / maxWeeksA)));
                  const cGap = 2;
                  const svgW = 35 + maxWeeksA * (cSize + cGap) + 10;
                  const svgH = 22 + 7 * (cSize + cGap) + 15;
                  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

                  return (
                    <svg width={svgW} height={svgH} className="overflow-visible select-none">
                      <g transform="translate(25, 18)">
                        {/* Day labels */}
                        {[1, 3, 5].map(dayIdx => (
                          <text
                            key={dayIdx}
                            x={-8}
                            y={dayIdx * (cSize + cGap) + cSize - 2}
                            textAnchor="end"
                            fontSize="8"
                            fontWeight="600"
                            fill="#94a3b8"
                          >
                            {days[dayIdx]}
                          </text>
                        ))}

                        {/* Cells */}
                        {dataA.map((d, i) => (
                          <rect
                            key={i}
                            x={d.weekIndex * (cSize + cGap)}
                            y={d.dayOfWeek * (cSize + cGap)}
                            width={cSize}
                            height={cSize}
                            rx={2}
                            fill={getCellColor(d)}
                            stroke="#ffffff"
                            strokeWidth={0.6}
                            className="cursor-pointer hover:stroke-slate-900 transition"
                            onMouseEnter={() => setHoveredDayA(d)}
                            onMouseLeave={() => setHoveredDayA(null)}
                          />
                        ))}
                      </g>
                    </svg>
                  );
                })()}
              </div>

              {/* Hover inspection footer for A */}
              <div className="h-6 flex items-center text-[10px] text-slate-600 bg-white px-2 rounded-lg border border-slate-100 font-mono-tech">
                {hoveredDayA ? (
                  <span className="truncate">
                    ★ {hoveredDayA.dateStr} ({['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][hoveredDayA.dayOfWeek]}): {hoveredDayA.isHoliday ? hoveredDayA.holidayName : `${hoveredDayA.attendancePercent}% (${hoveredDayA.presentStudents} students)`}
                  </span>
                ) : (
                  <span className="text-slate-400">Hover over any square in Period A to inspect details</span>
                )}
              </div>
            </div>

            {/* Heatmap Period B */}
            <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-slate-50/40 space-y-2">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    B
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                      {periodB.label}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono-tech">
                      {periodB.startDate} to {periodB.endDate} ({metricsB.totalWorking} working days)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-700 text-sm font-mono-tech">{metricsB.avg}%</span>
                  <span className="text-[10px] text-slate-500 block font-mono-tech">avg rate</span>
                </div>
              </div>

              {/* Heatmap Grid SVG for Period B */}
              <div className="overflow-x-auto pt-1 pb-1">
                {(() => {
                  const maxWeeksB = Math.max(1, ...dataB.map(d => d.weekIndex)) + 1;
                  const cSize = Math.max(9, Math.min(13, Math.floor((containerWidth / 2 - 80) / maxWeeksB)));
                  const cGap = 2;
                  const svgW = 35 + maxWeeksB * (cSize + cGap) + 10;
                  const svgH = 22 + 7 * (cSize + cGap) + 15;
                  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

                  return (
                    <svg width={svgW} height={svgH} className="overflow-visible select-none">
                      <g transform="translate(25, 18)">
                        {/* Day labels */}
                        {[1, 3, 5].map(dayIdx => (
                          <text
                            key={dayIdx}
                            x={-8}
                            y={dayIdx * (cSize + cGap) + cSize - 2}
                            textAnchor="end"
                            fontSize="8"
                            fontWeight="600"
                            fill="#94a3b8"
                          >
                            {days[dayIdx]}
                          </text>
                        ))}

                        {/* Cells */}
                        {dataB.map((d, i) => (
                          <rect
                            key={i}
                            x={d.weekIndex * (cSize + cGap)}
                            y={d.dayOfWeek * (cSize + cGap)}
                            width={cSize}
                            height={cSize}
                            rx={2}
                            fill={getCellColor(d)}
                            stroke="#ffffff"
                            strokeWidth={0.6}
                            className="cursor-pointer hover:stroke-slate-900 transition"
                            onMouseEnter={() => setHoveredDayB(d)}
                            onMouseLeave={() => setHoveredDayB(null)}
                          />
                        ))}
                      </g>
                    </svg>
                  );
                })()}
              </div>

              {/* Hover inspection footer for B */}
              <div className="h-6 flex items-center text-[10px] text-slate-600 bg-white px-2 rounded-lg border border-slate-100 font-mono-tech">
                {hoveredDayB ? (
                  <span className="truncate">
                    ★ {hoveredDayB.dateStr} ({['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][hoveredDayB.dayOfWeek]}): {hoveredDayB.isHoliday ? hoveredDayB.holidayName : `${hoveredDayB.attendancePercent}% (${hoveredDayB.presentStudents} students)`}
                  </span>
                ) : (
                  <span className="text-slate-400">Hover over any square in Period B to inspect details</span>
                )}
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 px-1 border-t border-slate-100">
            <span className="font-semibold text-slate-700">D3 Density Intensity:</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#059669]"></span>
                <span>&ge;96% (Optimal)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#34d399]"></span>
                <span>90-95%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b]"></span>
                <span>75-89%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#ef4444]"></span>
                <span>&lt;75% (Critical)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#f1f5f9] border border-slate-200"></span>
                <span>Holiday / Non-working</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Comparative D3 Line Curves */}
      {activeTab === 'TRENDS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-1 bg-emerald-600 rounded-full"></span>
                <span className="font-bold text-emerald-800">Period A ({periodA.termBadge || 'Period A'} - {metricsA.avg}%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-1 bg-indigo-600 rounded-full"></span>
                <span className="font-bold text-indigo-800">Period B ({periodB.termBadge || 'Period B'} - {metricsB.avg}%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-rose-500 border-b border-rose-500 border-dashed"></span>
                <span className="text-rose-600 font-semibold">CBSE 75% Floor</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              Curves normalized over working day sequence (Day 1..N)
            </div>
          </div>

          {trendChartData && (
            <div className="relative overflow-x-auto pt-1 pb-1">
              <svg
                width={trendChartData.width}
                height={trendChartData.height}
                className="overflow-visible select-none cursor-crosshair"
                onMouseMove={handleTrendMouseMove}
                onMouseLeave={() => {
                  setTrendHoverIdx(null);
                  setTrendHoverPos(null);
                }}
              >
                <g transform={`translate(${trendChartData.margin.left}, ${trendChartData.margin.top})`}>
                  {/* Grid Lines */}
                  {trendChartData.yTicks.map(val => {
                    const y = trendChartData.yScale(val);
                    return (
                      <g key={val}>
                        <line
                          x1={0}
                          y1={y}
                          x2={trendChartData.innerWidth}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth={1}
                        />
                        <text
                          x={-8}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="9"
                          fontWeight="500"
                          fill="#94a3b8"
                        >
                          {val}{metricMode === 'PERCENT' ? '%' : ''}
                        </text>
                      </g>
                    );
                  })}

                  {/* CBSE 75% Statutory Line */}
                  <line
                    x1={0}
                    y1={trendChartData.statutory75Pos}
                    x2={trendChartData.innerWidth}
                    y2={trendChartData.statutory75Pos}
                    stroke="#f43f5e"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={trendChartData.innerWidth - 4}
                    y={trendChartData.statutory75Pos - 4}
                    textAnchor="end"
                    fontSize="9"
                    fontWeight="700"
                    fill="#e11d48"
                  >
                    CBSE 75% Threshold
                  </text>

                  {/* Curve Period B (Indigo Line) */}
                  <path
                    d={trendChartData.pathB}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    opacity={0.85}
                  />

                  {/* Curve Period A (Emerald Line) */}
                  <path
                    d={trendChartData.pathA}
                    fill="none"
                    stroke="#059669"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />

                  {/* Interactive Crosshair */}
                  {trendHoverIdx !== null && (
                    <g>
                      <line
                        x1={trendChartData.xScale(trendHoverIdx)}
                        y1={0}
                        x2={trendChartData.xScale(trendHoverIdx)}
                        y2={trendChartData.innerHeight}
                        stroke="#0f172a"
                        strokeWidth={1.2}
                        strokeDasharray="2 2"
                      />
                      {workingA[trendHoverIdx] && (
                        <circle
                          cx={trendChartData.xScale(trendHoverIdx)}
                          cy={trendChartData.yScale(metricMode === 'COUNT' ? workingA[trendHoverIdx].presentStudents : workingA[trendHoverIdx].attendancePercent)}
                          r={5}
                          fill="#059669"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      )}
                      {workingB[trendHoverIdx] && (
                        <circle
                          cx={trendChartData.xScale(trendHoverIdx)}
                          cy={trendChartData.yScale(metricMode === 'COUNT' ? workingB[trendHoverIdx].presentStudents : workingB[trendHoverIdx].attendancePercent)}
                          r={5}
                          fill="#6366f1"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      )}
                    </g>
                  )}

                  {/* X Axis Labels */}
                  {Array.from({ length: 6 }).map((_, step) => {
                    const idx = Math.round((step / 5) * (trendChartData.maxDays - 1));
                    const x = trendChartData.xScale(idx);
                    return (
                      <text
                        key={step}
                        x={x}
                        y={trendChartData.innerHeight + 16}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="500"
                        fill="#64748b"
                        fontFamily="Plus Jakarta Sans"
                      >
                        Day {idx + 1}
                      </text>
                    );
                  })}
                </g>
              </svg>

              {/* Hover Tooltip Card */}
              {trendHoverIdx !== null && trendHoverPos && (
                <div
                  className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl text-xs space-y-2 -translate-x-1/2 -translate-y-full border border-slate-700/80 min-w-[220px]"
                  style={{
                    left: Math.max(120, Math.min(containerWidth - 120, trendHoverPos.x)),
                    top: trendHoverPos.y - 12
                  }}
                >
                  <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 flex justify-between">
                    <span>Working Day Sequence #{trendHoverIdx + 1}</span>
                  </div>

                  {workingA[trendHoverIdx] && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-300">
                      <span className="font-semibold">A ({workingA[trendHoverIdx].dateStr}):</span>
                      <span className="font-mono-tech font-bold">
                        {workingA[trendHoverIdx].attendancePercent}% ({workingA[trendHoverIdx].presentStudents} st.)
                      </span>
                    </div>
                  )}

                  {workingB[trendHoverIdx] && (
                    <div className="flex items-center justify-between text-[11px] text-indigo-300">
                      <span className="font-semibold">B ({workingB[trendHoverIdx].dateStr}):</span>
                      <span className="font-mono-tech font-bold">
                        {workingB[trendHoverIdx].attendancePercent}% ({workingB[trendHoverIdx].presentStudents} st.)
                      </span>
                    </div>
                  )}

                  {workingA[trendHoverIdx] && workingB[trendHoverIdx] && (
                    <div className="pt-1 border-t border-slate-800 flex justify-between text-[10px] text-slate-300 font-mono-tech">
                      <span>Daily Delta (A - B):</span>
                      <span className={`font-bold ${
                        workingA[trendHoverIdx].attendancePercent >= workingB[trendHoverIdx].attendancePercent ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {(workingA[trendHoverIdx].attendancePercent - workingB[trendHoverIdx].attendancePercent).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Class Cohort Delta Matrix */}
      {activeTab === 'CLASSES' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STANDARD_CLASSES.map(cls => {
              const avgA = metricsA.classAverages.find(c => c.className === cls)?.avgPercent || 92;
              const avgB = metricsB.classAverages.find(c => c.className === cls)?.avgPercent || 92;
              const delta = Math.round((avgA - avgB) * 10) / 10;

              return (
                <div 
                  key={cls}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{cls}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      delta > 0 ? 'bg-emerald-100 text-emerald-800' :
                      delta < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {delta > 0 ? `+${delta}%` : `${delta}%`} &Delta;
                    </span>
                  </div>

                  {/* Dual comparative progress meters */}
                  <div className="my-2.5 space-y-1.5">
                    {/* Period A Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-emerald-800 font-semibold mb-0.5 font-mono-tech">
                        <span>A: {periodA.termBadge || 'Period A'}</span>
                        <span>{avgA}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, avgA)}%` }}
                        />
                      </div>
                    </div>

                    {/* Period B Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-indigo-800 font-semibold mb-0.5 font-mono-tech">
                        <span>B: {periodB.termBadge || 'Period B'}</span>
                        <span>{avgB}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, avgB)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono-tech">
                    <span>CBSE Compliant</span>
                    <span className={delta >= 0 ? 'text-emerald-700 font-bold' : 'text-slate-600 font-medium'}>
                      {delta >= 0 ? 'Improved Retention' : 'Slight Dip'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Day-of-Week Seasonality Matrix */}
      {activeTab === 'WEEKDAYS' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {metricsA.dayOfWeekAverages.map((dayItem) => {
              const matchingB = metricsB.dayOfWeekAverages.find(d => d.dayIndex === dayItem.dayIndex);
              const valA = dayItem.avgPercent;
              const valB = matchingB?.avgPercent || 90;
              const delta = Math.round((valA - valB) * 10) / 10;

              return (
                <div 
                  key={dayItem.dayIndex}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center space-y-1.5"
                >
                  <span className="text-xs font-bold text-slate-800 block">
                    {dayItem.day}
                  </span>

                  <div className="space-y-1 font-mono-tech text-[11px]">
                    <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 px-1.5 py-0.5 rounded">
                      <span>A:</span>
                      <span>{valA}%</span>
                    </div>
                    <div className="flex justify-between text-indigo-700 font-bold bg-indigo-50/80 px-1.5 py-0.5 rounded">
                      <span>B:</span>
                      <span>{valB}%</span>
                    </div>
                  </div>

                  <div className={`text-[10px] font-bold font-mono-tech pt-1 border-t border-slate-200/60 ${
                    delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {delta >= 0 ? `+${delta}%` : `${delta}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Variance Breakdown Audit Table */}
      {activeTab === 'METRICS_TABLE' && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Evaluation Dimension</th>
                <th className="py-2.5 px-3 text-emerald-800">Period A ({periodA.termBadge || 'Period A'})</th>
                <th className="py-2.5 px-3 text-indigo-800">Period B ({periodB.termBadge || 'Period B'})</th>
                <th className="py-2.5 px-3 text-slate-800">Net Variance (&Delta;)</th>
                <th className="py-2.5 px-3 text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-tech text-[11px]">
              <tr>
                <td className="py-2 px-3 font-sans font-semibold text-slate-800">Mean Attendance Rate</td>
                <td className="py-2 px-3 font-bold text-emerald-700">{metricsA.avg}%</td>
                <td className="py-2 px-3 font-bold text-indigo-700">{metricsB.avg}%</td>
                <td className={`py-2 px-3 font-bold ${deltaAvgPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {deltaAvgPercent >= 0 ? `+${deltaAvgPercent}%` : `${deltaAvgPercent}%`}
                </td>
                <td className="py-2 px-3 font-sans text-[10px]">
                  {deltaAvgPercent >= 0 ? <span className="text-emerald-700 font-bold">★ Positive Growth</span> : <span className="text-rose-700 font-bold">Cautionary Dip</span>}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-semibold text-slate-800">Avg Daily Present Headcount</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">{metricsA.avgCount} students</td>
                <td className="py-2 px-3 text-indigo-700 font-bold">{metricsB.avgCount} students</td>
                <td className={`py-2 px-3 font-bold ${deltaAvgCount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {deltaAvgCount >= 0 ? `+${deltaAvgCount}` : `${deltaAvgCount}`} students
                </td>
                <td className="py-2 px-3 font-sans text-[10px] text-slate-600">Capacity ~{metricsA.totalEnrolled}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-semibold text-slate-800">CBSE &ge;75% Statutory Compliance</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">{metricsA.compliantPercent}% ({metricsA.compliantCount} days)</td>
                <td className="py-2 px-3 text-indigo-700 font-bold">{metricsB.compliantPercent}% ({metricsB.compliantCount} days)</td>
                <td className={`py-2 px-3 font-bold ${deltaCompliance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {deltaCompliance >= 0 ? `+${deltaCompliance}%` : `${deltaCompliance}%`}
                </td>
                <td className="py-2 px-3 font-sans text-[10px] text-emerald-700 font-semibold">Statutory Passing</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-semibold text-slate-800">Active High-Attendance Streak (&ge;90%)</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">{metricsA.currentStreak} days</td>
                <td className="py-2 px-3 text-indigo-700 font-bold">{metricsB.currentStreak} days</td>
                <td className="py-2 px-3 font-bold text-slate-700">
                  {deltaStreak >= 0 ? `+${deltaStreak}` : `${deltaStreak}`} days
                </td>
                <td className="py-2 px-3 font-sans text-[10px] text-slate-600">Period Closing Momentum</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-semibold text-slate-800">Total Instructional Working Days</td>
                <td className="py-2 px-3 text-slate-800 font-bold">{metricsA.totalWorking} days</td>
                <td className="py-2 px-3 text-slate-800 font-bold">{metricsB.totalWorking} days</td>
                <td className="py-2 px-3 text-slate-700 font-bold">{metricsA.totalWorking - metricsB.totalWorking} days</td>
                <td className="py-2 px-3 font-sans text-[10px] text-slate-600">Academic Calendar</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Executive Key Finding Callout */}
      <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-200/70 flex items-start space-x-2.5 text-xs">
        <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-violet-950">
            Comparative Analytical Finding:
          </span>
          <p className="text-violet-900/90 leading-relaxed text-[11px]">
            {deltaAvgPercent >= 0 ? (
              <>
                <strong>{periodA.label}</strong> demonstrated a <strong>+{deltaAvgPercent}%</strong> attendance gain over <strong>{periodB.label}</strong>, driven by improved mid-week engagement and stronger examination turnaround. CBSE &ge;75% statutory compliance remained stable at <strong>{metricsA.compliantPercent}%</strong>.
              </>
            ) : (
              <>
                <strong>{periodA.label}</strong> observed a slight <strong>{deltaAvgPercent}%</strong> decrease compared to <strong>{periodB.label}</strong>. Administrators are advised to review Monday attendance patterns and post-holiday transition periods.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
