import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Info, 
  Filter, 
  Download, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  CalendarDays,
  Flame,
  Award,
  BarChart2,
  X,
  LineChart,
  LayoutGrid,
  CalendarRange,
  Percent,
  Hash,
  Activity,
  FileText,
  Table,
  Check,
  ChevronDown,
  Printer,
  GitCompare
} from 'lucide-react';
import { Student } from '../../types';
import { DateRangeSelector, DateRangeValue, getQuickPresets, ACADEMIC_TERMS } from './DateRangeSelector';
import { exportAttendanceToPDF, exportAttendanceToCSV } from '../../utils/attendanceExport';
import { AttendanceComparisonCard } from './AttendanceComparisonCard';

export interface DayAttendanceData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  weekIndex: number;
  monthStr: string; // e.g. "Apr"
  monthIndex: number;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  leaveStudents: number;
  attendancePercent: number;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  eventType?: 'NORMAL' | 'EXAM' | 'SPORTS' | 'ANNUAL_DAY' | 'PTM' | 'RAIN_ALERT';
  eventTitle?: string;
  classBreakdowns?: {
    className: string;
    total: number;
    present: number;
    percent: number;
  }[];
}

interface AttendanceHeatmapChartProps {
  students: Student[];
  onNavigateToAttendance?: () => void;
  initialDateRange?: DateRangeValue;
}

export const AttendanceHeatmapChart: React.FC<AttendanceHeatmapChartProps> = ({
  students,
  onNavigateToAttendance,
  initialDateRange
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trendSvgRef = useRef<SVGSVGElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const [activeViewMode, setActiveViewMode] = useState<'HEATMAP' | 'TREND' | 'COMPARE'>('HEATMAP');
  // Metric Display Mode (On Demand: Percentage vs Exact Student Count)
  const [metricMode, setMetricMode] = useState<'PERCENT' | 'COUNT'>('PERCENT');

  // Export dropdown & status states
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Date Range State supporting Academic Terms, Quick Presets & Custom Timeframes
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    if (initialDateRange) return initialDateRange;
    const presets = getQuickPresets();
    return {
      startDate: presets[3].startDate, // Last 180 Days
      endDate: presets[3].endDate,
      label: presets[3].label,
      presetId: presets[3].id,
      termBadge: '6M Window'
    };
  });

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  
  // Interactive Hover Tooltip States for Heatmap & Line Chart
  const [hoveredDay, setHoveredDay] = useState<DayAttendanceData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; placeBelow: boolean } | null>(null);

  const [trendHoverPoint, setTrendHoverPoint] = useState<DayAttendanceData | null>(null);
  const [trendHoverCoords, setTrendHoverCoords] = useState<{ x: number; y: number; placeBelow: boolean } | null>(null);

  const [selectedDayDetail, setSelectedDayDetail] = useState<DayAttendanceData | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const [cardWidth, setCardWidth] = useState<number>(900);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Resize observer to ensure responsive crisp rendering
  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          const w = Math.floor(entry.contentRect.width);
          setCardWidth(w);
          setContainerWidth(Math.max(600, w - 40));
        }
      }
    });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate historical daily dataset strictly constrained to selected date range
  const historicalData: DayAttendanceData[] = useMemo(() => {
    const startDate = new Date(dateRange.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRange.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return [];
    }

    const baseStudentCount = selectedClassFilter === 'ALL' 
      ? (students.length > 0 ? students.length * 52 : 1248)
      : (students.filter(s => s.className === selectedClassFilter).length > 0 
          ? students.filter(s => s.className === selectedClassFilter).length * 8
          : 40);

    const data: DayAttendanceData[] = [];

    // Distinct predefined school events and holidays in academic calendar
    const specialDates: Record<string, { holiday?: string; eventType?: DayAttendanceData['eventType']; title?: string; impact?: number }> = {
      '2025-01-26': { holiday: 'Republic Day Celebrations', eventType: 'ANNUAL_DAY', title: 'Republic Day Flag Hoisting & Parade' },
      '2025-03-14': { holiday: 'Holi Festival', eventType: 'NORMAL', title: 'Holi Holiday' },
      '2025-03-15': { holiday: 'Post-Holi Break', eventType: 'NORMAL', title: 'Institutional Holiday' },
      '2025-04-14': { holiday: 'Dr. B.R. Ambedkar Jayanti', eventType: 'NORMAL', title: 'Public Holiday' },
      '2025-04-18': { holiday: 'Good Friday', eventType: 'NORMAL', title: 'Good Friday Holiday' },
      '2024-10-02': { holiday: 'Gandhi Jayanti', eventType: 'NORMAL', title: 'National Holiday' },
      '2024-10-31': { holiday: 'Diwali Break', eventType: 'NORMAL', title: 'Diwali Festival Holiday' },
      '2024-11-01': { holiday: 'Govardhan Puja', eventType: 'NORMAL', title: 'Diwali Break' },
      '2024-12-25': { holiday: 'Christmas Day', eventType: 'NORMAL', title: 'Winter Holiday' },
      '2024-08-15': { holiday: 'Independence Day', eventType: 'ANNUAL_DAY', title: 'Independence Day Flag Ceremony' },
      '2024-05-01': { holiday: 'Maharashtra Day / Labour Day', eventType: 'NORMAL', title: 'Institutional Holiday' },
      // Exam and special dates
      '2025-03-03': { eventType: 'EXAM', title: 'Annual Final Term Examinations Commence', impact: 6 },
      '2025-03-05': { eventType: 'EXAM', title: 'Mathematics Board Practice Exam', impact: 5 },
      '2025-03-10': { eventType: 'EXAM', title: 'Science & Physics Assessment', impact: 4 },
      '2025-02-14': { eventType: 'SPORTS', title: 'Annual Inter-House Athletics Meet', impact: 3 },
      '2025-02-15': { eventType: 'SPORTS', title: 'Sports Gala & Championship Finals', impact: 4 },
      '2025-01-18': { eventType: 'PTM', title: 'Term II Parent-Teacher Conference', impact: 2 },
      '2024-11-20': { eventType: 'ANNUAL_DAY', title: 'Grand Annual Day Function & Cultural Night', impact: 5 },
      '2024-10-15': { eventType: 'EXAM', title: 'Mid-Term Comprehensive Exam Series', impact: 5 },
      '2024-09-15': { eventType: 'RAIN_ALERT', title: 'Heavy Monsoon Advisory in District', impact: -14 },
      '2024-07-22': { eventType: 'EXAM', title: 'Unit Test I Diagnostic Assessment', impact: 4 },
      '2024-04-10': { eventType: 'NORMAL', title: 'Academic Session Induction & Orientation', impact: 2 },
    };

    const classesList = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

    // Iterate through dates from startDate to endDate
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const d = new Date(cur);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
      const isSunday = dayOfWeek === 0;
      const isSecondOrFourthSat = dayOfWeek === 6 && (Math.floor((d.getDate() - 1) / 7) === 1 || Math.floor((d.getDate() - 1) / 7) === 3);
      const special = specialDates[dateStr];
      const isHoliday = isSunday || isSecondOrFourthSat || Boolean(special?.holiday);

      // Base attendance calculation with natural pseudorandom variation and seasonal fluctuations
      const daySeed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 1000;
      const pseudoNoise = (Math.sin(daySeed) * 4.5); // -4.5% to +4.5%
      const dayOfWeekMod = dayOfWeek === 1 ? -1.8 : dayOfWeek === 5 ? -1.2 : 0.8; // Mon/Fri slight dip
      const eventBonus = special?.impact || 0;

      let calculatedPercent = Math.min(99.4, Math.max(72.0, 92.5 + pseudoNoise + dayOfWeekMod + eventBonus));
      calculatedPercent = Math.round(calculatedPercent * 10) / 10;

      if (isHoliday) {
        calculatedPercent = 0;
      }

      const total = isHoliday ? 0 : baseStudentCount;
      const present = isHoliday ? 0 : Math.round((calculatedPercent / 100) * total);
      const absentDiff = total - present;
      const late = isHoliday ? 0 : Math.round(absentDiff * 0.35);
      const leave = isHoliday ? 0 : Math.round(absentDiff * 0.25);
      const unexcusedAbsent = Math.max(0, absentDiff - late - leave);

      // Class-wise simulated breakdown
      const classBreakdowns = isHoliday ? [] : classesList.map(cls => {
        const classTotal = Math.round(total / classesList.length);
        const clsNoise = (Math.cos(daySeed + cls.length) * 3);
        const clsPercent = Math.min(100, Math.max(68, Math.round((calculatedPercent + clsNoise) * 10) / 10));
        return {
          className: cls,
          total: classTotal,
          present: Math.round((clsPercent / 100) * classTotal),
          percent: clsPercent
        };
      });

      data.push({
        date: d,
        dateStr,
        dayOfWeek,
        weekIndex: 0, // computed below
        monthStr: d.toLocaleString('default', { month: 'short' }),
        monthIndex: d.getMonth(),
        totalStudents: total,
        presentStudents: present,
        absentStudents: unexcusedAbsent,
        lateStudents: late,
        leaveStudents: leave,
        attendancePercent: isHoliday ? 0 : calculatedPercent,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday,
        holidayName: special?.holiday || (isSunday ? 'Sunday Holiday' : isSecondOrFourthSat ? 'Second Saturday' : undefined),
        eventType: special?.eventType || 'NORMAL',
        eventTitle: special?.title,
        classBreakdowns
      });

      // Advance by 1 day
      cur.setDate(cur.getDate() + 1);
    }

    // Align into calendar week indices (columns)
    if (data.length > 0) {
      const firstDate = data[0].date;
      const firstSunday = new Date(firstDate);
      firstSunday.setDate(firstDate.getDate() - firstDate.getDay());

      data.forEach(item => {
        const diffTime = item.date.getTime() - firstSunday.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        item.weekIndex = Math.floor(diffDays / 7);
      });
    }

    return data;
  }, [dateRange, selectedClassFilter, students]);

  // Working days only for analytics and trendline
  const workingDaysSeries = useMemo(() => {
    return historicalData.filter(d => !d.isHoliday && d.totalStudents > 0);
  }, [historicalData]);

  // Aggregate statistics for the selected timeframe
  const metrics = useMemo(() => {
    if (workingDaysSeries.length === 0) {
      return { 
        avg: 92, 
        avgCount: 1148,
        maxDay: null, 
        minDay: null, 
        compliantPercent: 100, 
        compliantCount: 0, 
        totalWorking: 0, 
        currentStreak: 0,
        totalEnrolled: 1248
      };
    }

    const avg = Math.round((d3.mean(workingDaysSeries, d => d.attendancePercent) || 92) * 10) / 10;
    const avgCount = Math.round(d3.mean(workingDaysSeries, d => d.presentStudents) || 1148);
    const maxDay = workingDaysSeries.reduce((prev, curr) => (curr.attendancePercent > prev.attendancePercent ? curr : prev), workingDaysSeries[0]);
    const minDay = workingDaysSeries.reduce((prev, curr) => (curr.attendancePercent < prev.attendancePercent ? curr : prev), workingDaysSeries[0]);
    const compliantCount = workingDaysSeries.filter(d => d.attendancePercent >= 75).length;
    const compliantPercent = Math.round((compliantCount / workingDaysSeries.length) * 100);
    const totalEnrolled = workingDaysSeries[0]?.totalStudents || 1248;

    // Current active attendance streak (days with >= 90% attendance)
    let currentStreak = 0;
    for (let i = workingDaysSeries.length - 1; i >= 0; i--) {
      if (workingDaysSeries[i].attendancePercent >= 90) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      avg,
      avgCount,
      maxDay,
      minDay,
      compliantPercent,
      compliantCount,
      totalWorking: workingDaysSeries.length,
      currentStreak,
      totalEnrolled
    };
  }, [workingDaysSeries]);

  // D3 Color Scale for Heatmap cells
  const getColor = (d: DayAttendanceData) => {
    if (d.isHoliday) {
      return '#f1f5f9'; // Slate-100 for holidays / weekend
    }
    const rate = d.attendancePercent;
    if (rate >= 96) return '#059669'; // Emerald-600
    if (rate >= 93) return '#10b981'; // Emerald-500
    if (rate >= 90) return '#34d399'; // Emerald-400
    if (rate >= 85) return '#6ee7b7'; // Emerald-300
    if (rate >= 75) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Rose-500 (Critical <75%)
  };

  // Dimensions & Grid Configuration for Heatmap
  const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxWeeks = useMemo(() => {
    if (historicalData.length === 0) return 26;
    return Math.max(...historicalData.map(d => d.weekIndex)) + 1;
  }, [historicalData]);

  // Dynamic cell sizing based on container width
  const leftMargin = 38;
  const topMargin = 28;
  const bottomMargin = 20;
  const availableWidth = containerWidth - leftMargin - 20;
  const cellSize = Math.max(10, Math.min(17, Math.floor(availableWidth / maxWeeks) - 3));
  const cellGap = 3;
  const totalSvgWidth = Math.max(containerWidth - 30, leftMargin + maxWeeks * (cellSize + cellGap) + 15);
  const totalSvgHeight = topMargin + 7 * (cellSize + cellGap) + bottomMargin;

  // Month label positions (where month changes in week index with min spacing to prevent overlaps)
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIdx: number }[] = [];
    let lastWeekIdx = -999;
    let lastMonth = -1;

    historicalData.forEach(d => {
      if (d.monthIndex !== lastMonth) {
        // If first month in series or at least 3 weeks away from previous label
        if (labels.length === 0) {
          labels.push({ label: d.monthStr, weekIdx: d.weekIndex });
          lastWeekIdx = d.weekIndex;
          lastMonth = d.monthIndex;
        } else if (d.weekIndex - lastWeekIdx >= 3) {
          labels.push({ label: d.monthStr, weekIdx: d.weekIndex });
          lastWeekIdx = d.weekIndex;
          lastMonth = d.monthIndex;
        } else if (labels.length === 1 && d.weekIndex - lastWeekIdx < 3) {
          // If the starting month had fewer than 3 weeks before month rollover, prioritize the first full month
          labels[0] = { label: d.monthStr, weekIdx: d.weekIndex };
          lastWeekIdx = d.weekIndex;
          lastMonth = d.monthIndex;
        }
      }
    });

    return labels;
  }, [historicalData]);

  // D3 Line Chart Paths & Scales (for Trendline view)
  const lineChartData = useMemo(() => {
    const data = workingDaysSeries;
    if (data.length === 0) return null;

    const margin = { top: 20, right: 30, bottom: 40, left: 55 };
    const width = Math.max(500, containerWidth - 40);
    const height = 240;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scalePoint<number>()
      .domain(data.map((_, i) => i))
      .range([0, innerWidth])
      .padding(0.2);

    const totalStudents = data[0]?.totalStudents || 1248;

    // Determine Y-scale based on metricMode (Percentage vs Student Count)
    const isCountMode = metricMode === 'COUNT';
    const yMin = isCountMode 
      ? Math.max(0, Math.floor((d3.min(data, d => d.presentStudents) || totalStudents * 0.7) * 0.9))
      : Math.max(50, Math.floor((d3.min(data, d => d.attendancePercent) || 80) - 5));
    const yMax = isCountMode ? totalStudents : 100;

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0])
      .nice();

    const getValue = (d: DayAttendanceData) => isCountMode ? d.presentStudents : d.attendancePercent;

    const lineGenerator = d3.line<DayAttendanceData>()
      .x((_, i) => xScale(i) || 0)
      .y(d => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3.area<DayAttendanceData>()
      .x((_, i) => xScale(i) || 0)
      .y0(innerHeight)
      .y1(d => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);

    // 7-day moving average calculation
    const movingAvgData = data.map((d, idx) => {
      const start = Math.max(0, idx - 6);
      const window = data.slice(start, idx + 1);
      const avg = isCountMode 
        ? Math.round(d3.mean(window, item => item.presentStudents) || d.presentStudents)
        : Math.round((d3.mean(window, item => item.attendancePercent) || d.attendancePercent) * 10) / 10;
      return { ...d, movingAvg: avg, index: idx };
    });

    const maLineGenerator = d3.line<{ movingAvg: number; index: number }>()
      .x(d => xScale(d.index) || 0)
      .y(d => yScale(d.movingAvg))
      .curve(d3.curveMonotoneX);

    const y75Threshold = isCountMode ? totalStudents * 0.75 : 75;

    return {
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      xScale,
      yScale,
      isCountMode,
      linePath: lineGenerator(data) || '',
      areaPath: areaGenerator(data) || '',
      maLinePath: maLineGenerator(movingAvgData) || '',
      points: data.map((d, i) => ({
        data: d,
        x: xScale(i) || 0,
        y: yScale(getValue(d)),
        val: getValue(d)
      })),
      yTicks: yScale.ticks(5),
      y75Pos: yScale(y75Threshold)
    };
  }, [workingDaysSeries, containerWidth, metricMode]);

  // Interactive mouse tracking over the D3 line chart
  const handleLineChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!lineChartData || !cardRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - lineChartData.margin.left;

    if (mouseX < 0 || mouseX > lineChartData.innerWidth) {
      setTrendHoverPoint(null);
      setTrendHoverCoords(null);
      return;
    }

    // Find nearest point
    let closest = lineChartData.points[0];
    let minDiff = Infinity;
    for (const pt of lineChartData.points) {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }

    if (closest) {
      setTrendHoverPoint(closest.data);
      const pointCardX = rect.left - cardRect.left + lineChartData.margin.left + closest.x;
      const pointCardY = rect.top - cardRect.top + lineChartData.margin.top + closest.y;
      const placeBelow = pointCardY < 290;

      setTrendHoverCoords({
        x: pointCardX,
        y: placeBelow ? pointCardY + 12 : pointCardY - 12,
        placeBelow
      });
    }
  };

  const handleLineChartMouseLeave = () => {
    setTrendHoverPoint(null);
    setTrendHoverCoords(null);
  };

  // Trigger Formal PDF Export
  const handleExportPDF = () => {
    try {
      setShowExportMenu(false);
      setExportFeedback('Generating official PDF record...');
      exportAttendanceToPDF({
        data: historicalData,
        metrics,
        dateRange,
        classFilter: selectedClassFilter,
        institutionName: 'Delhi Public Academy & Senior Secondary School'
      });
      setTimeout(() => setExportFeedback('PDF downloaded successfully!'), 600);
      setTimeout(() => setExportFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setExportFeedback('Error generating PDF report.');
      setTimeout(() => setExportFeedback(null), 3500);
    }
  };

  // Trigger CSV Export
  const handleExportCSV = () => {
    try {
      setShowExportMenu(false);
      setExportFeedback('Exporting CSV time-series...');
      exportAttendanceToCSV({
        data: historicalData,
        dateRange,
        classFilter: selectedClassFilter
      });
      setTimeout(() => setExportFeedback('CSV file downloaded!'), 600);
      setTimeout(() => setExportFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setExportFeedback('Error exporting CSV.');
      setTimeout(() => setExportFeedback(null), 3500);
    }
  };

  return (
    <div 
      ref={cardRef} 
      id="attendance-heatmap-card" 
      className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-5"
    >
      {/* 1. Header & Range Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/80">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                Attendance Heatmap & Trends
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                D3.js Granular Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover over any day or chart point to inspect exact student counts and attendance percentages
            </p>
          </div>
        </div>

        {/* Action Controls: View Mode, Metric Toggle, Date Range Selector & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle (Heatmap vs Line Chart vs Compare Terms) */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              id="heatmap-view-mode-heatmap"
              onClick={() => setActiveViewMode('HEATMAP')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition ${activeViewMode === 'HEATMAP' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Heatmap</span>
            </button>
            <button
              id="heatmap-view-mode-trend"
              onClick={() => setActiveViewMode('TREND')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition ${activeViewMode === 'TREND' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>D3 Line Chart</span>
            </button>
            <button
              id="heatmap-view-mode-compare"
              onClick={() => setActiveViewMode('COMPARE')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition ${activeViewMode === 'COMPARE' ? 'bg-white text-violet-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              <GitCompare className="w-3.5 h-3.5 text-violet-600" />
              <span>Compare Terms</span>
            </button>
          </div>

          {/* On-Demand Metric Toggle (% Rate vs Exact Student Count) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              id="heatmap-metric-toggle-percent"
              onClick={() => setMetricMode('PERCENT')}
              title="Display metrics and tooltips as attendance percentages"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${metricMode === 'PERCENT' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              <Percent className="w-3 h-3" />
              <span>% Rate</span>
            </button>
            <button
              id="heatmap-metric-toggle-count"
              onClick={() => setMetricMode('COUNT')}
              title="Display metrics and tooltips as exact student headcounts"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition ${metricMode === 'COUNT' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              <Hash className="w-3 h-3" />
              <span>Count (N)</span>
            </button>
          </div>

          {/* Dedicated Date Range & Academic Term Selector */}
          <DateRangeSelector
            value={dateRange}
            onChange={(newRange) => setDateRange(newRange)}
          />

          {/* Class Cohort Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-800 cursor-pointer"
            >
              <option value="ALL">All School (1,248 Students)</option>
              <option value="Class 10">Class 10 (Senior Sec)</option>
              <option value="Class 9">Class 9 (High School)</option>
              <option value="Class 8">Class 8 (Middle)</option>
              <option value="Class 11">Class 11 (Commerce & Sci)</option>
              <option value="Class 12">Class 12 (Board Prep)</option>
            </select>
          </div>

          {/* Formal Record Export Dropdown (PDF & CSV) */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              id="heatmap-export-record-button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs"
              title="Export official attendance record as PDF or CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Record</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {/* Export Options Menu */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                    Record Export Formats
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {dateRange.label} • {historicalData.length} records
                  </span>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-start space-x-2.5 p-2 rounded-xl hover:bg-emerald-50/80 text-left transition group"
                >
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 group-hover:text-emerald-900 block">
                      Official PDF Report (.pdf)
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block">
                      CBSE-formatted statutory audit document with institutional seal & metrics
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-start space-x-2.5 p-2 rounded-xl hover:bg-emerald-50/80 text-left transition group"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 shrink-0">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 group-hover:text-emerald-900 block">
                      Data Spreadsheet (.csv)
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block">
                      Raw day-by-day tabular data for Excel, Sheets, or ERP archives
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Status Feedback Banner */}
      {exportFeedback && (
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{exportFeedback}</span>
        </div>
      )}

      {/* 2. Key Analytical Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">Period Average</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-bold font-mono-tech text-emerald-600">
              {metricMode === 'PERCENT' ? `${metrics.avg}%` : `${metrics.avgCount.toLocaleString()} Students`}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">↑ 1.4%</span>
          </div>
          <span className="text-[10px] text-slate-400">{metrics.totalWorking} Academic Days</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">CBSE Compliance</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-bold font-mono-tech text-slate-900">{metrics.compliantPercent}%</span>
            <span className="text-[10px] text-slate-500 font-medium">≥75% rate</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">{metrics.compliantCount} of {metrics.totalWorking} days compliant</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">Peak Attendance</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-bold font-mono-tech text-blue-600">
              {metricMode === 'PERCENT' 
                ? `${metrics.maxDay?.attendancePercent || 98}%`
                : `${metrics.maxDay?.presentStudents.toLocaleString() || '1,220'} Students`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-tech">{metrics.maxDay?.dateStr ? metrics.maxDay.dateStr.slice(5) : '03-10'}</span>
          </div>
          <span className="text-[10px] text-slate-500 truncate block">{metrics.maxDay?.eventTitle || 'Exam Assessment Day'}</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">Lowest Day</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-bold font-mono-tech text-amber-600">
              {metricMode === 'PERCENT'
                ? `${metrics.minDay?.attendancePercent || 74}%`
                : `${metrics.minDay?.presentStudents.toLocaleString() || '920'} Students`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-tech">{metrics.minDay?.dateStr ? metrics.minDay.dateStr.slice(5) : '09-15'}</span>
          </div>
          <span className="text-[10px] text-slate-500 truncate block">{metrics.minDay?.eventTitle || 'Inclement Weather'}</span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-[11px] text-slate-500 font-medium flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>90%+ Streak</span>
          </span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-bold font-mono-tech text-amber-600">{metrics.currentStreak}</span>
            <span className="text-[10px] text-slate-600 font-medium">consecutive days</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">High Engagement Period</span>
        </div>
      </div>

      {/* Active Timeframe Indicator Banner */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Active Date Scope:</span>
          <span className="font-bold text-slate-800">{dateRange.label}</span>
          <span className="text-slate-400 font-mono-tech text-[11px]">({dateRange.startDate} to {dateRange.endDate})</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <span>{historicalData.length} Calendar Days • {workingDaysSeries.length} Instructional Days</span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            PDF &amp; CSV Ready
          </span>
        </div>
      </div>

      {/* 3. VISUALIZATION CANVAS */}
      {activeViewMode === 'COMPARE' ? (
        /* ==================== C. SIDE-BY-SIDE TERM COMPARISON ==================== */
        <AttendanceComparisonCard
          students={students}
          onNavigateToAttendance={onNavigateToAttendance}
          defaultPeriodA={dateRange}
          className="!p-0 !border-0 !shadow-none"
        />
      ) : activeViewMode === 'HEATMAP' ? (
        /* ==================== A. D3 CALENDAR HEATMAP ==================== */
        <div ref={containerRef} className="relative overflow-x-auto pt-2 pb-2">
          <svg
            width={totalSvgWidth}
            height={totalSvgHeight}
            className="select-none overflow-visible"
          >
            {/* Month Labels on Top */}
            <g transform={`translate(${leftMargin}, 14)`}>
              {monthLabels.map((m, idx) => (
                <text
                  key={`m-${idx}-${m.label}`}
                  x={m.weekIdx * (cellSize + cellGap)}
                  y={0}
                  fontSize="11"
                  fontWeight="600"
                  fill="#475569"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {m.label}
                </text>
              ))}
            </g>

            {/* Day of Week Labels on Left (Mon, Wed, Fri) */}
            <g transform={`translate(0, ${topMargin})`}>
              {daysOfWeekLabels.map((dayName, dayIdx) => {
                if (dayIdx !== 1 && dayIdx !== 3 && dayIdx !== 5) return null;
                return (
                  <text
                    key={`day-${dayIdx}`}
                    x={leftMargin - 8}
                    y={dayIdx * (cellSize + cellGap) + cellSize - 3}
                    textAnchor="end"
                    fontSize="10"
                    fontWeight="500"
                    fill="#94a3b8"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {dayName}
                  </text>
                );
              })}
            </g>

            {/* Calendar Heatmap Rectangles with Hover Precision */}
            <g transform={`translate(${leftMargin}, ${topMargin})`}>
              {historicalData.map((d) => {
                const x = d.weekIndex * (cellSize + cellGap);
                const y = d.dayOfWeek * (cellSize + cellGap);
                const isHovered = hoveredDay?.dateStr === d.dateStr;
                const isSelected = selectedDayDetail?.dateStr === d.dateStr;
                const hasSpecialEvent = Boolean(d.eventTitle);

                return (
                  <g key={d.dateStr}>
                    <rect
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={3}
                      fill={getColor(d)}
                      stroke={isSelected ? '#0f172a' : isHovered ? '#1e293b' : hasSpecialEvent ? '#0284c7' : '#ffffff'}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : hasSpecialEvent ? 1.5 : 0.8}
                      className="cursor-pointer transition-all duration-150"
                      style={{
                        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                        transformOrigin: `${x + cellSize / 2}px ${y + cellSize / 2}px`,
                        filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        const cellRect = e.currentTarget.getBoundingClientRect();
                        const cardRect = cardRef.current?.getBoundingClientRect();
                        if (cardRect) {
                          const x = cellRect.left - cardRect.left + cellSize / 2;
                          const y = cellRect.top - cardRect.top;
                          const placeBelow = y < 270;
                          setTooltipPos({
                            x,
                            y: placeBelow ? y + cellSize + 10 : y - 8,
                            placeBelow
                          });
                        }
                        setHoveredDay(d);
                      }}
                      onMouseLeave={() => {
                        setHoveredDay(null);
                        setTooltipPos(null);
                      }}
                      onClick={() => {
                        setSelectedDayDetail(d);
                      }}
                    />
                    {/* Subtle marker dot for special school event days */}
                    {hasSpecialEvent && !d.isHoliday && (
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2}
                        r={cellSize > 13 ? 2 : 1.5}
                        fill="#ffffff"
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      ) : (
        /* ==================== B. D3 TRENDLINE CHART WITH HOVER CROSSHAIR ==================== */
        <div className="relative overflow-x-auto pt-2 pb-2">
          {lineChartData && (
            <div className="relative">
              <svg
                ref={trendSvgRef}
                width={lineChartData.width}
                height={lineChartData.height}
                className="overflow-visible select-none cursor-crosshair"
                onMouseMove={handleLineChartMouseMove}
                onMouseLeave={handleLineChartMouseLeave}
              >
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <g transform={`translate(${lineChartData.margin.left}, ${lineChartData.margin.top})`}>
                  {/* Grid Lines (Horizontal) */}
                  {lineChartData.yTicks.map(tickVal => {
                    const y = lineChartData.yScale(tickVal);
                    return (
                      <g key={tickVal}>
                        <line
                          x1={0}
                          y1={y}
                          x2={lineChartData.innerWidth}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth={1}
                        />
                        <text
                          x={-10}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="10"
                          fontWeight="500"
                          fill="#94a3b8"
                          fontFamily="Plus Jakarta Sans"
                        >
                          {lineChartData.isCountMode ? tickVal.toLocaleString() : `${tickVal}%`}
                        </text>
                      </g>
                    );
                  })}

                  {/* 75% CBSE Statutory Benchmark Line */}
                  <line
                    x1={0}
                    y1={lineChartData.y75Pos}
                    x2={lineChartData.innerWidth}
                    y2={lineChartData.y75Pos}
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={lineChartData.innerWidth - 6}
                    y={lineChartData.y75Pos - 5}
                    textAnchor="end"
                    fontSize="9"
                    fontWeight="700"
                    fill="#e11d48"
                  >
                    {lineChartData.isCountMode ? 'CBSE 75% Floor' : 'CBSE 75% Statutory Floor'}
                  </text>

                  {/* Gradient Area under curve */}
                  <path
                    d={lineChartData.areaPath}
                    fill="url(#attendanceGradient)"
                  />

                  {/* 7-day Moving Average Line (Dashed Slate) */}
                  <path
                    d={lineChartData.maLinePath}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />

                  {/* Main Attendance Curve Line (Emerald) */}
                  <path
                    d={lineChartData.linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Vertical Cursor Guideline / Crosshair */}
                  {trendHoverPoint && trendHoverCoords && (
                    <g>
                      <line
                        x1={trendHoverCoords.x - lineChartData.margin.left}
                        y1={0}
                        x2={trendHoverCoords.x - lineChartData.margin.left}
                        y2={lineChartData.innerHeight}
                        stroke="#0f172a"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                      />
                      {/* Pulse Ring on hovered point */}
                      <circle
                        cx={trendHoverCoords.x - lineChartData.margin.left}
                        cy={trendHoverCoords.y - lineChartData.margin.top}
                        r={8}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={2}
                        className="animate-ping opacity-75"
                      />
                      <circle
                        cx={trendHoverCoords.x - lineChartData.margin.left}
                        cy={trendHoverCoords.y - lineChartData.margin.top}
                        r={5}
                        fill="#0f172a"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    </g>
                  )}

                  {/* Data Points */}
                  {lineChartData.points.map((pt, i) => {
                    const hasEvent = Boolean(pt.data.eventTitle);
                    const isDense = lineChartData.points.length > 60;
                    if (isDense && !hasEvent && i % 3 !== 0) return null;

                    return (
                      <g key={pt.data.dateStr} className="cursor-pointer group">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hasEvent ? 4.5 : isDense ? 2.5 : 3.5}
                          fill={hasEvent ? '#0284c7' : '#10b981'}
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          className="transition-all duration-150 group-hover:scale-150 group-hover:stroke-slate-900"
                          onClick={() => setSelectedDayDetail(pt.data)}
                        />
                      </g>
                    );
                  })}

                  {/* X Axis Date Labels */}
                  {lineChartData.points.map((pt, i) => {
                    const step = Math.max(3, Math.floor(lineChartData.points.length / 8));
                    if (i % step !== 0 && i !== lineChartData.points.length - 1) return null;
                    const dateFormatted = pt.data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <text
                        key={`x-${pt.data.dateStr}`}
                        x={pt.x}
                        y={lineChartData.innerHeight + 18}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="500"
                        fill="#64748b"
                        fontFamily="Plus Jakarta Sans"
                      >
                        {dateFormatted}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Interactive Floating Heatmap Tooltip (Rendered at Card Root to avoid overflow clipping) */}
      {activeViewMode === 'HEATMAP' && hoveredDay && tooltipPos && (
        <div
          className={`absolute z-50 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-2 -translate-x-1/2 ${
            tooltipPos.placeBelow ? 'translate-y-0' : '-translate-y-full'
          } border border-slate-700/80 min-w-[240px] max-w-[280px] animate-in fade-in zoom-in-95 duration-100`}
          style={{ 
            left: Math.max(140, Math.min(cardWidth - 140, tooltipPos.x)), 
            top: tooltipPos.y 
          }}
        >
          {/* Header: Date + Status Badge */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 gap-2">
            <div>
              <span className="font-bold text-slate-100 text-xs block">
                {hoveredDay.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-tech">
                {hoveredDay.dateStr}
              </span>
            </div>

            {hoveredDay.isHoliday ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                Holiday
              </span>
            ) : (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                hoveredDay.attendancePercent >= 90 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                hoveredDay.attendancePercent >= 75 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {metricMode === 'PERCENT' 
                  ? `${hoveredDay.attendancePercent}% Present` 
                  : `${hoveredDay.presentStudents} / ${hoveredDay.totalStudents} Present`}
              </span>
            )}
          </div>

          {hoveredDay.isHoliday ? (
            <div className="text-slate-300 text-[11px] py-1">
              <span className="font-semibold text-slate-200">{hoveredDay.holidayName || 'Weekend / Scheduled Holiday'}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Non-instructional school day</p>
            </div>
          ) : (
            <div className="space-y-1.5 text-[11px]">
              {/* Primary Headcount Grid */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Present Students:</span>
                  <span className="font-bold font-mono-tech text-emerald-400 text-xs">
                    {hoveredDay.presentStudents.toLocaleString()} <span className="text-[10px] font-normal text-emerald-300">({hoveredDay.attendancePercent}%)</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Absent (Unexcused):</span>
                  <span className="font-bold font-mono-tech text-rose-400 text-xs">
                    {hoveredDay.absentStudents} <span className="text-[10px] font-normal text-rose-300">({Math.round((hoveredDay.absentStudents / hoveredDay.totalStudents) * 1000) / 10}%)</span>
                  </span>
                </div>
                <div className="flex flex-col pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Late Arrivals:</span>
                  <span className="font-bold font-mono-tech text-amber-400 text-xs">
                    {hoveredDay.lateStudents} marked
                  </span>
                </div>
                <div className="flex flex-col pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Sanctioned Leave:</span>
                  <span className="font-bold font-mono-tech text-sky-400 text-xs">
                    {hoveredDay.leaveStudents} approved
                  </span>
                </div>
              </div>

              {hoveredDay.eventTitle && (
                <div className="pt-1.5 border-t border-slate-800 text-sky-300 text-[10px] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{hoveredDay.eventTitle}</span>
                </div>
              )}
            </div>
          )}
          <div className="text-[9px] text-slate-400 pt-1 italic text-center border-t border-slate-800/60">
            Click cell for class-by-class breakdown
          </div>
        </div>
      )}

      {/* Interactive Floating Line Chart Tooltip (Rendered at Card Root) */}
      {activeViewMode === 'TREND' && trendHoverPoint && trendHoverCoords && (
        <div 
          className={`absolute z-50 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 border border-slate-700/80 min-w-[220px] max-w-[260px] animate-in fade-in duration-100 -translate-x-1/2 ${
            trendHoverCoords.placeBelow ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{ 
            left: Math.max(140, Math.min(cardWidth - 140, trendHoverCoords.x)), 
            top: trendHoverCoords.y
          }}
        >
          <div className="font-bold text-slate-100 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
            <div>
              <span className="block">{trendHoverPoint.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-[10px] text-slate-400 font-mono-tech font-normal">{trendHoverPoint.dateStr}</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-mono-tech font-bold text-sm block">
                {metricMode === 'PERCENT' ? `${trendHoverPoint.attendancePercent}%` : `${trendHoverPoint.presentStudents} / ${trendHoverPoint.totalStudents}`}
              </span>
              <span className="text-[10px] text-slate-400">
                {metricMode === 'PERCENT' ? `${trendHoverPoint.presentStudents} Present` : `${trendHoverPoint.attendancePercent}% Rate`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
            <div className="flex justify-between text-slate-300">
              <span>Present:</span>
              <span className="font-bold text-emerald-400 font-mono-tech">{trendHoverPoint.presentStudents.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Absent:</span>
              <span className="font-bold text-rose-400 font-mono-tech">{trendHoverPoint.absentStudents}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Late:</span>
              <span className="font-bold text-amber-400 font-mono-tech">{trendHoverPoint.lateStudents}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Leave:</span>
              <span className="font-bold text-sky-400 font-mono-tech">{trendHoverPoint.leaveStudents}</span>
            </div>
          </div>

          {trendHoverPoint.eventTitle && (
            <div className="text-sky-300 text-[10px] pt-1 border-t border-slate-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{trendHoverPoint.eventTitle}</span>
            </div>
          )}

          <div className="text-[9px] text-slate-400 pt-0.5 italic text-center">
            Click point to view class breakdown
          </div>
        </div>
      )}

      {/* 4. Heatmap Legend & Color Scale */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium text-[11px]">Attendance Scale:</span>
          
          <div className="flex items-center space-x-1 text-[11px] text-slate-600">
            <span className="w-3.5 h-3.5 rounded bg-[#f1f5f9] border border-slate-200 inline-block" />
            <span>Holiday</span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-600">
            <span className="w-3.5 h-3.5 rounded bg-[#ef4444] inline-block" />
            <span>&lt;75% (Critical)</span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-600">
            <span className="w-3.5 h-3.5 rounded bg-[#f59e0b] inline-block" />
            <span>75-84%</span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-600">
            <span className="w-3.5 h-3.5 rounded bg-[#6ee7b7] inline-block" />
            <span>85-89%</span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-600">
            <span className="w-3.5 h-3.5 rounded bg-[#10b981] inline-block" />
            <span>90-95%</span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-600">
            <span className="w-3.5 h-3.5 rounded bg-[#059669] inline-block" />
            <span>≥96% (Optimal)</span>
          </div>

          <div className="flex items-center space-x-1 text-[11px] text-slate-600 pl-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            <span>Event Day</span>
          </div>
        </div>

        {/* Quick jump to full Attendance Module */}
        {onNavigateToAttendance && (
          <button
            onClick={onNavigateToAttendance}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 self-end sm:self-auto"
          >
            <span>Open Attendance Module</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 5. Selected Day Granular Inspector Drawer/Modal */}
      {selectedDayDetail && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Granular Attendance Inspector: {selectedDayDetail.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h4>
              {selectedDayDetail.eventTitle && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                  {selectedDayDetail.eventTitle}
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedDayDetail(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedDayDetail.isHoliday ? (
            <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-xs text-slate-500">
              <p className="font-bold text-slate-700">{selectedDayDetail.holidayName || 'Holiday / Non-instructional Day'}</p>
              <p className="mt-0.5">No student attendance recorded for this date.</p>
            </div>
          ) : (
            <div>
              {/* Day Metrics Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 text-[11px]">Total Enrolled</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedDayDetail.totalStudents.toLocaleString()}</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 text-[11px]">Present Count & Rate</span>
                  <p className="font-bold text-emerald-600 text-sm">{selectedDayDetail.presentStudents.toLocaleString()} ({selectedDayDetail.attendancePercent}%)</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 text-[11px]">Absent / Leaves</span>
                  <p className="font-bold text-rose-600 text-sm">{selectedDayDetail.absentStudents + selectedDayDetail.leaveStudents} ({selectedDayDetail.leaveStudents} leaves)</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 text-[11px]">Late Arrivals</span>
                  <p className="font-bold text-amber-600 text-sm">{selectedDayDetail.lateStudents} marked</p>
                </div>
              </div>

              {/* Class by Class Breakdown Table */}
              {selectedDayDetail.classBreakdowns && selectedDayDetail.classBreakdowns.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 font-semibold text-slate-700 flex justify-between">
                    <span>Class Breakdown</span>
                    <span>Attendance Rate & Student Count</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {selectedDayDetail.classBreakdowns.map((cls) => (
                      <div key={cls.className} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/80 transition">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">{cls.className}</span>
                          <span className="text-slate-400 text-[11px]">({cls.present} / {cls.total} present)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cls.percent >= 90 ? 'bg-emerald-500' : cls.percent >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${cls.percent}%` }}
                            />
                          </div>
                          <span className="font-mono-tech font-bold text-slate-800 w-16 text-right">
                            {metricMode === 'PERCENT' ? `${cls.percent}%` : `${cls.present} std`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
