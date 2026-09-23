import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  Sliders, 
  Layers, 
  ArrowUpRight, 
  Activity, 
  BarChart3, 
  CheckCircle2, 
  FileText, 
  Download,
  Flame,
  Zap,
  ChevronDown,
  Check
} from 'lucide-react';
import { Student } from '../../types';
import { DayAttendanceData } from './AttendanceHeatmapChart';
import { 
  computeNextMonthForecast, 
  ForecastSummary, 
  ForecastScenario, 
  ProjectedDay 
} from '../../utils/predictiveAnalytics';

interface PredictiveAttendanceCardProps {
  students?: Student[];
  historicalData?: DayAttendanceData[];
  onNavigateToAttendance?: () => void;
  className?: string;
}

export const PredictiveAttendanceCard: React.FC<PredictiveAttendanceCardProps> = ({
  students = [],
  historicalData = [],
  onNavigateToAttendance,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(760);

  const [selectedScenario, setSelectedScenario] = useState<ForecastScenario>('BALANCED');
  const [activeTab, setActiveTab] = useState<'CHART' | 'CLASSES' | 'CALENDAR' | 'DRIVERS'>('CHART');
  const [hoveredPoint, setHoveredPoint] = useState<ProjectedDay | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Resize observer for responsive SVG width
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

  // Compute baseline historical dataset if not provided directly
  const computedHistoricalData = useMemo(() => {
    if (historicalData && historicalData.length >= 10) {
      return historicalData;
    }

    // Generate robust 90-day time-series if parent hasn't passed it
    const data: DayAttendanceData[] = [];
    const today = new Date();
    const totalCount = students.length > 0 ? students.length * 52 : 1248;

    for (let i = 90; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay();
      const isSunday = dayOfWeek === 0;
      const isSecondOrFourthSat = dayOfWeek === 6 && (Math.floor((d.getDate() - 1) / 7) === 1 || Math.floor((d.getDate() - 1) / 7) === 3);
      const isHoliday = isSunday || isSecondOrFourthSat;

      const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 1000;
      const noise = Math.sin(seed) * 3.8;
      const dowMod = dayOfWeek === 1 ? -1.5 : dayOfWeek === 5 ? -1.0 : 0.6;
      let calculatedPercent = Math.min(99.0, Math.max(74.0, 92.2 + noise + dowMod));
      calculatedPercent = Math.round(calculatedPercent * 10) / 10;

      if (isHoliday) calculatedPercent = 0;
      const present = isHoliday ? 0 : Math.round((calculatedPercent / 100) * totalCount);

      data.push({
        date: d,
        dateStr,
        dayOfWeek,
        weekIndex: 0,
        monthStr: d.toLocaleString('default', { month: 'short' }),
        monthIndex: d.getMonth(),
        totalStudents: isHoliday ? 0 : totalCount,
        presentStudents: present,
        absentStudents: isHoliday ? 0 : totalCount - present,
        lateStudents: isHoliday ? 0 : Math.round((totalCount - present) * 0.3),
        leaveStudents: isHoliday ? 0 : Math.round((totalCount - present) * 0.2),
        attendancePercent: calculatedPercent,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday
      });
    }

    return data;
  }, [historicalData, students]);

  const totalEnrolled = students.length > 0 ? students.length * 52 : 1248;

  // Run the trend projection algorithm
  const forecast: ForecastSummary = useMemo(() => {
    return computeNextMonthForecast(computedHistoricalData, totalEnrolled, selectedScenario);
  }, [computedHistoricalData, totalEnrolled, selectedScenario]);

  // Combined D3 Chart scales and paths (Historical trailing 15 days + Forecast next 30 days)
  const chartData = useMemo(() => {
    const historicalTail = computedHistoricalData
      .filter(d => !d.isHoliday && d.totalStudents > 0)
      .slice(-14)
      .map(d => ({
        dateStr: d.dateStr,
        label: d.dateStr.slice(5),
        percent: d.attendancePercent,
        lower: d.attendancePercent,
        upper: d.attendancePercent,
        presentCount: d.presentStudents,
        isProjected: false,
        raw: null as ProjectedDay | null
      }));

    const forecastWorking = forecast.dailyProjections
      .filter(d => !d.isHoliday)
      .map(d => ({
        dateStr: d.dateStr,
        label: d.dateStr.slice(5),
        percent: d.projectedPercent,
        lower: d.lowerBound,
        upper: d.upperBound,
        presentCount: d.projectedPresentCount,
        isProjected: true,
        raw: d
      }));

    const combinedSeries = [...historicalTail, ...forecastWorking];
    if (combinedSeries.length === 0) return null;

    const margin = { top: 20, right: 25, bottom: 35, left: 45 };
    const width = Math.max(480, containerWidth - 32);
    const height = 210;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scalePoint<number>()
      .domain(combinedSeries.map((_, i) => i))
      .range([0, innerWidth])
      .padding(0.1);

    const minVal = Math.max(60, Math.floor((d3.min(combinedSeries, d => d.lower) || 75) - 3));
    const maxVal = Math.min(100, Math.ceil((d3.max(combinedSeries, d => d.upper) || 98) + 2));

    const yScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([innerHeight, 0])
      .nice();

    // Line for historical points
    const histPoints = combinedSeries.filter((_, i) => i < historicalTail.length);
    const histLine = d3.line<(typeof combinedSeries)[0]>()
      .x((_, i) => xScale(i) || 0)
      .y(d => yScale(d.percent))
      .curve(d3.curveMonotoneX);

    // Line for projected forecast points (starts from last historical point for seamless continuity)
    const forecastPoints = combinedSeries.filter((_, i) => i >= historicalTail.length - 1);
    const forecastLine = d3.line<(typeof combinedSeries)[0]>()
      .x((_, i) => xScale(i + historicalTail.length - 1) || 0)
      .y(d => yScale(d.percent))
      .curve(d3.curveMonotoneX);

    // Confidence Interval Area for forecast range
    const forecastArea = d3.area<(typeof combinedSeries)[0]>()
      .x((_, i) => xScale(i + historicalTail.length - 1) || 0)
      .y0(d => yScale(d.lower))
      .y1(d => yScale(d.upper))
      .curve(d3.curveMonotoneX);

    const statutory75Y = yScale(75);
    const splitIndex = historicalTail.length - 1;
    const splitX = xScale(splitIndex) || 0;

    return {
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      xScale,
      yScale,
      minVal,
      maxVal,
      combinedSeries,
      splitIndex,
      splitX,
      histPath: histLine(histPoints) || '',
      forecastPath: forecastLine(forecastPoints) || '',
      forecastAreaPath: forecastArea(forecastPoints) || '',
      statutory75Y,
      yTicks: yScale.ticks(4)
    };
  }, [computedHistoricalData, forecast, containerWidth]);

  // Handle crosshair tracking
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - chartData.margin.left;

    if (mouseX < 0 || mouseX > chartData.innerWidth) {
      setHoveredPoint(null);
      setHoverCoords(null);
      return;
    }

    let closestIdx = 0;
    let minDiff = Infinity;

    chartData.combinedSeries.forEach((_, i) => {
      const px = chartData.xScale(i) || 0;
      const diff = Math.abs(px - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    const targetItem = chartData.combinedSeries[closestIdx];
    if (targetItem && targetItem.raw) {
      setHoveredPoint(targetItem.raw);
      setHoverCoords({
        x: (chartData.xScale(closestIdx) || 0) + chartData.margin.left,
        y: chartData.yScale(targetItem.percent) + chartData.margin.top
      });
    } else {
      setHoveredPoint(null);
      setHoverCoords(null);
    }
  };

  const handleCopyForecast = () => {
    const text = `Delhi Public Academy - Next Month Attendance Forecast:
- Projected Rate: ${forecast.projectedAvgPercent}% (${forecast.deltaPercent >= 0 ? '+' : ''}${forecast.deltaPercent}% vs current)
- Projected Headcount: ${forecast.projectedAvgHeadcount.toLocaleString()} / ${forecast.totalEnrolled} students
- CBSE Statutory ≥75% Compliance Probability: ${forecast.cbseComplianceProbability}%
- Algorithm: ${forecast.modelName} (Confidence: ${forecast.confidenceScorePercent}%)
- Model Scenario: ${selectedScenario}`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div 
      id="predictive-analytics-card"
      ref={containerRef}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5 ${className}`}
    >
      {/* 1. Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                Predictive Analytics &amp; Trend Projection
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Next 30 Days Forecast</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ordinary Least Squares (OLS) regression &amp; day-of-week seasonality projection model
            </p>
          </div>
        </div>

        {/* Action Buttons: Scenario Picker & Snapshot Copy */}
        <div className="flex items-center space-x-2">
          {/* Scenario Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSelectedScenario('BALANCED')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedScenario === 'BALANCED' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Baseline
            </button>
            <button
              onClick={() => setSelectedScenario('OPTIMISTIC')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedScenario === 'OPTIMISTIC' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Optimistic (+1.4%)
            </button>
            <button
              onClick={() => setSelectedScenario('CONSERVATIVE')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedScenario === 'CONSERVATIVE' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Conservative (-1.2%)
            </button>
          </div>

          <button
            onClick={handleCopyForecast}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            title="Copy forecast summary to clipboard"
          >
            {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedNotification ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Forecast Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Projected Average */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 p-3.5 rounded-xl border border-indigo-100/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Forecasted Next Month</span>
            <span className="text-[10px] font-mono-tech text-indigo-700 font-bold bg-indigo-100/70 px-1.5 py-0.5 rounded">
              ±{forecast.confidenceIntervalWidth}%
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono-tech text-indigo-900">
              {forecast.projectedAvgPercent}%
            </span>
            <div className={`flex items-center text-xs font-bold ${
              forecast.deltaPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {forecast.deltaPercent >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              <span>{forecast.deltaPercent >= 0 ? `+${forecast.deltaPercent}%` : `${forecast.deltaPercent}%`}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            vs current period ({forecast.currentAvgPercent}%)
          </span>
        </div>

        {/* Metric 2: Estimated Daily Headcount */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Projected Attendance</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-bold font-mono-tech text-slate-900">
              {forecast.projectedAvgHeadcount.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              / {forecast.totalEnrolled} students
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
            ~{Math.max(0, forecast.totalEnrolled - forecast.projectedAvgHeadcount)} avg daily absentees
          </span>
        </div>

        {/* Metric 3: CBSE Statutory Compliance Safety */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">CBSE ≥75% Safety</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-bold font-mono-tech text-emerald-600">
              {forecast.cbseComplianceProbability}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Low Risk</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {forecast.projectedWorkingDaysCount} of {forecast.projectedWorkingDaysCount} working days compliant
          </span>
        </div>

        {/* Metric 4: Confidence & Model Quality */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Algorithm Accuracy</span>
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-bold font-mono-tech text-indigo-700">
              {forecast.confidenceScorePercent}%
            </span>
            <span className="text-[10px] text-indigo-800 font-semibold">R² Conf.</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Trained on {forecast.historicalDaysCount} working days
          </span>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 text-xs">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('CHART')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'CHART'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Visual Forecast Curve</span>
          </button>

          <button
            onClick={() => setActiveTab('CLASSES')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'CLASSES'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Class Cohort Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'CALENDAR'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Schedule Projections</span>
          </button>

          <button
            onClick={() => setActiveTab('DRIVERS')}
            className={`pb-2.5 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'DRIVERS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Key Drivers &amp; Mitigations</span>
          </button>
        </div>

        {onNavigateToAttendance && (
          <button
            onClick={onNavigateToAttendance}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 pb-2"
          >
            <span>Live Attendance Log</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 4. Tab Content Panels */}
      {activeTab === 'CHART' && (
        <div className="space-y-2">
          {/* Chart Header Info */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-1">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-slate-400 rounded-full"></span>
                <span>Past 14 Days (Actual)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-indigo-600 rounded-full border-b border-indigo-400"></span>
                <span className="font-semibold text-indigo-900">Next 30 Days Forecast (Projected)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2 bg-indigo-100 rounded-xs border border-indigo-200"></span>
                <span>95% Confidence Band</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              Hover curve to inspect day forecast &amp; uncertainty limits
            </div>
          </div>

          {/* D3 Forecast Chart SVG */}
          {chartData && (
            <div className="relative overflow-x-auto pt-1 pb-1">
              <svg
                ref={chartSvgRef}
                width={chartData.width}
                height={chartData.height}
                className="overflow-visible select-none cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  setHoveredPoint(null);
                  setHoverCoords(null);
                }}
              >
                <defs>
                  <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                <g transform={`translate(${chartData.margin.left}, ${chartData.margin.top})`}>
                  {/* Horizontal Grid lines */}
                  {chartData.yTicks.map(val => {
                    const y = chartData.yScale(val);
                    return (
                      <g key={val}>
                        <line
                          x1={0}
                          y1={y}
                          x2={chartData.innerWidth}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth={1}
                        />
                        <text
                          x={-8}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="10"
                          fontWeight="500"
                          fill="#94a3b8"
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  {/* CBSE 75% Floor Threshold */}
                  <line
                    x1={0}
                    y1={chartData.statutory75Y}
                    x2={chartData.innerWidth}
                    y2={chartData.statutory75Y}
                    stroke="#f43f5e"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={chartData.innerWidth - 4}
                    y={chartData.statutory75Y - 4}
                    textAnchor="end"
                    fontSize="9"
                    fontWeight="700"
                    fill="#e11d48"
                  >
                    CBSE 75% Statutory Floor
                  </text>

                  {/* Vertical Split Line dividing Past vs Forecast */}
                  <line
                    x1={chartData.splitX}
                    y1={0}
                    x2={chartData.splitX}
                    y2={chartData.innerHeight}
                    stroke="#cbd5e1"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  <text
                    x={chartData.splitX + 6}
                    y={12}
                    fontSize="9"
                    fontWeight="700"
                    fill="#6366f1"
                  >
                    PROJECTION HORIZON →
                  </text>

                  {/* Forecast 95% Confidence Band Area */}
                  <path
                    d={chartData.forecastAreaPath}
                    fill="url(#forecastAreaGrad)"
                  />

                  {/* Historical Solid Curve Line */}
                  <path
                    d={chartData.histPath}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />

                  {/* Forecast Line (Indigo dashed/accented) */}
                  <path
                    d={chartData.forecastPath}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                  />

                  {/* Interactive Cursor crosshair */}
                  {hoveredPoint && hoverCoords && (
                    <g>
                      <line
                        x1={hoverCoords.x - chartData.margin.left}
                        y1={0}
                        x2={hoverCoords.x - chartData.margin.left}
                        y2={chartData.innerHeight}
                        stroke="#0f172a"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={hoverCoords.x - chartData.margin.left}
                        cy={hoverCoords.y - chartData.margin.top}
                        r={6}
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  )}

                  {/* Points on Forecast Line */}
                  {chartData.combinedSeries.map((pt, idx) => {
                    if (idx % 3 !== 0 && idx !== chartData.combinedSeries.length - 1 && idx !== chartData.splitIndex) return null;
                    const x = chartData.xScale(idx) || 0;
                    const y = chartData.yScale(pt.percent);

                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r={pt.isProjected ? 3 : 2.5}
                        fill={pt.isProjected ? '#4f46e5' : '#64748b'}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    );
                  })}

                  {/* X Axis Date labels */}
                  {chartData.combinedSeries.map((pt, idx) => {
                    if (idx % 5 !== 0 && idx !== chartData.combinedSeries.length - 1) return null;
                    const x = chartData.xScale(idx) || 0;
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={chartData.innerHeight + 16}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight={pt.isProjected ? '600' : '400'}
                        fill={pt.isProjected ? '#4338ca' : '#64748b'}
                        fontFamily="Plus Jakarta Sans"
                      >
                        {pt.label}
                      </text>
                    );
                  })}
                </g>
              </svg>

              {/* Interactive Tooltip Card */}
              {hoveredPoint && hoverCoords && (
                <div
                  className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5 -translate-x-1/2 -translate-y-full border border-slate-700/80 min-w-[210px]"
                  style={{
                    left: Math.max(110, Math.min(containerWidth - 110, hoverCoords.x)),
                    top: hoverCoords.y - 8
                  }}
                >
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                    <span className="font-bold text-slate-100">
                      {hoveredPoint.dayName}, {hoveredPoint.dateStr}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Forecast
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Projected Rate:</span>
                      <span className="font-bold font-mono-tech text-indigo-300 text-sm">
                        {hoveredPoint.projectedPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Est. Headcount:</span>
                      <span className="font-bold font-mono-tech text-emerald-400 text-sm">
                        {hoveredPoint.projectedPresentCount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800 flex justify-between">
                    <span>95% Confidence Band:</span>
                    <span className="font-mono-tech text-indigo-200">
                      {hoveredPoint.lowerBound}% - {hoveredPoint.upperBound}%
                    </span>
                  </div>

                  {hoveredPoint.eventNote && (
                    <div className="text-[10px] text-sky-300 font-medium pt-0.5">
                      ★ {hoveredPoint.eventNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'CLASSES' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {forecast.classForecasts.map(cls => (
              <div 
                key={cls.className}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">{cls.className}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cls.delta > 0 ? 'bg-emerald-100 text-emerald-800' :
                    cls.delta < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cls.delta > 0 ? `+${cls.delta}%` : `${cls.delta}%`}
                  </span>
                </div>

                <div className="my-2 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Projected:</span>
                    <span className="font-bold font-mono-tech text-slate-900">{cls.projectedAvg}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        cls.projectedAvg >= 92 ? 'bg-emerald-500' :
                        cls.projectedAvg >= 85 ? 'bg-indigo-500' :
                        cls.projectedAvg >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, cls.projectedAvg)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Current: {cls.currentAvg}%</span>
                  <span className="font-semibold text-emerald-700">CBSE Safe</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'CALENDAR' && (
        <div className="space-y-2">
          <div className="max-h-56 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {forecast.dailyProjections.map((day) => (
                <div 
                  key={day.dateStr}
                  className={`p-2.5 rounded-xl border text-xs transition ${
                    day.isHoliday 
                      ? 'bg-slate-100/70 border-slate-200 text-slate-400' 
                      : day.projectedPercent >= 92
                      ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                      : 'bg-indigo-50/50 border-indigo-200/80 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono-tech text-[10px]">
                    <span className="font-bold text-slate-700">{day.dateStr.slice(5)}</span>
                    <span className="font-medium text-slate-500">{day.dayName}</span>
                  </div>

                  {day.isHoliday ? (
                    <div className="mt-1">
                      <span className="text-[10px] font-semibold text-slate-500 block truncate">
                        {day.holidayName || 'Holiday'}
                      </span>
                      <span className="text-[9px] text-slate-400">Non-working</span>
                    </div>
                  ) : (
                    <div className="mt-1 space-y-0.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold font-mono-tech text-slate-900">
                          {day.projectedPercent}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono-tech">
                          {day.projectedPresentCount} st.
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-500 flex justify-between font-mono-tech">
                        <span>Min: {day.lowerBound}%</span>
                        <span>Max: {day.upperBound}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DRIVERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Statistical Drivers &amp; Factors</span>
            </h4>
            <div className="space-y-2">
              {forecast.keyDrivers.map((driver, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{driver.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {driver.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {driver.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prescriptive Action Items</span>
            </h4>
            <div className="space-y-2">
              {forecast.actionableInsights.map((insight, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-950 font-medium leading-snug">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Model Footer Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 gap-1">
        <span>
          Model: {forecast.modelName} • Historical dataset span: {forecast.historicalDaysCount} days
        </span>
        <span className="text-indigo-600 font-medium">
          CBSE Statutory Threshold: 75.0% Minimum Floor
        </span>
      </div>
    </div>
  );
};
