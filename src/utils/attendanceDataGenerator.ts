import * as d3 from 'd3';
import { Student } from '../types';
import { DayAttendanceData } from '../components/common/AttendanceHeatmapChart';
import { DateRangeValue } from '../components/common/DateRangeSelector';

export interface AttendanceMetricsSummary {
  avg: number;
  avgCount: number;
  maxDay: DayAttendanceData | null;
  minDay: DayAttendanceData | null;
  compliantPercent: number;
  compliantCount: number;
  totalWorking: number;
  currentStreak: number;
  totalEnrolled: number;
  totalAbsences: number;
  avgLateCount: number;
  avgLeaveCount: number;
  dayOfWeekAverages: { day: string; dayIndex: number; avgPercent: number }[];
  classAverages: { className: string; avgPercent: number; avgPresent: number; total: number }[];
}

export const SPECIAL_ACADEMIC_DATES: Record<string, { holiday?: string; eventType?: DayAttendanceData['eventType']; title?: string; impact?: number }> = {
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

export const STANDARD_CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

/**
 * Generates deterministic daily attendance records for a specified date range
 */
export function generateAttendanceSeries(
  startDateStr: string,
  endDateStr: string,
  students: Student[] = [],
  classFilter: string = 'ALL'
): DayAttendanceData[] {
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return [];
  }

  const baseStudentCount = classFilter === 'ALL' 
    ? (students.length > 0 ? students.length * 52 : 1248)
    : (students.filter(s => s.className === classFilter).length > 0 
        ? students.filter(s => s.className === classFilter).length * 8
        : 40);

  const data: DayAttendanceData[] = [];
  const cur = new Date(startDate);

  while (cur <= endDate) {
    const d = new Date(cur);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
    const isSunday = dayOfWeek === 0;
    const isSecondOrFourthSat = dayOfWeek === 6 && (Math.floor((d.getDate() - 1) / 7) === 1 || Math.floor((d.getDate() - 1) / 7) === 3);
    const special = SPECIAL_ACADEMIC_DATES[dateStr];
    const isHoliday = isSunday || isSecondOrFourthSat || Boolean(special?.holiday);

    // Deterministic pseudo-random calculation based on date seed
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

    // Class-wise breakdown
    const classBreakdowns = isHoliday ? [] : STANDARD_CLASSES.map(cls => {
      const classTotal = Math.round(total / STANDARD_CLASSES.length);
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
      weekIndex: 0,
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

    cur.setDate(cur.getDate() + 1);
  }

  // Align into calendar week indices
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
}

/**
 * Computes comprehensive attendance metrics for a data series
 */
export function calculateAttendanceMetrics(data: DayAttendanceData[]): AttendanceMetricsSummary {
  const workingDays = data.filter(d => !d.isHoliday && d.totalStudents > 0);

  if (workingDays.length === 0) {
    return {
      avg: 92.0,
      avgCount: 1148,
      maxDay: null,
      minDay: null,
      compliantPercent: 100,
      compliantCount: 0,
      totalWorking: 0,
      currentStreak: 0,
      totalEnrolled: 1248,
      totalAbsences: 0,
      avgLateCount: 0,
      avgLeaveCount: 0,
      dayOfWeekAverages: [],
      classAverages: STANDARD_CLASSES.map(cls => ({ className: cls, avgPercent: 92, avgPresent: 164, total: 178 }))
    };
  }

  const avg = Math.round((d3.mean(workingDays, d => d.attendancePercent) || 92.0) * 10) / 10;
  const avgCount = Math.round(d3.mean(workingDays, d => d.presentStudents) || 1148);
  const maxDay = workingDays.reduce((prev, curr) => (curr.attendancePercent > prev.attendancePercent ? curr : prev), workingDays[0]);
  const minDay = workingDays.reduce((prev, curr) => (curr.attendancePercent < prev.attendancePercent ? curr : prev), workingDays[0]);
  const compliantCount = workingDays.filter(d => d.attendancePercent >= 75).length;
  const compliantPercent = Math.round((compliantCount / workingDays.length) * 1000) / 10;
  const totalEnrolled = workingDays[0]?.totalStudents || 1248;
  const totalAbsences = workingDays.reduce((sum, d) => sum + (d.totalStudents - d.presentStudents), 0);
  const avgLateCount = Math.round(d3.mean(workingDays, d => d.lateStudents) || 0);
  const avgLeaveCount = Math.round(d3.mean(workingDays, d => d.leaveStudents) || 0);

  // Active streak
  let currentStreak = 0;
  for (let i = workingDays.length - 1; i >= 0; i--) {
    if (workingDays[i].attendancePercent >= 90) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Day of Week averages (Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeekAverages = [1, 2, 3, 4, 5, 6].map(dayIdx => {
    const matching = workingDays.filter(d => d.dayOfWeek === dayIdx);
    const dayAvg = matching.length > 0 
      ? Math.round((d3.mean(matching, d => d.attendancePercent) || avg) * 10) / 10 
      : avg;
    return {
      day: dayNames[dayIdx],
      dayIndex: dayIdx,
      avgPercent: dayAvg
    };
  });

  // Class Averages
  const classAverages = STANDARD_CLASSES.map(cls => {
    const rates: number[] = [];
    let classTotal = Math.round(totalEnrolled / STANDARD_CLASSES.length);
    workingDays.forEach(d => {
      const found = d.classBreakdowns?.find(c => c.className === cls);
      if (found) {
        rates.push(found.percent);
        classTotal = found.total;
      }
    });
    const clsAvg = rates.length > 0 
      ? Math.round((d3.mean(rates) || avg) * 10) / 10 
      : avg;
    return {
      className: cls,
      avgPercent: clsAvg,
      avgPresent: Math.round((clsAvg / 100) * classTotal),
      total: classTotal
    };
  });

  return {
    avg,
    avgCount,
    maxDay,
    minDay,
    compliantPercent,
    compliantCount,
    totalWorking: workingDays.length,
    currentStreak,
    totalEnrolled,
    totalAbsences,
    avgLateCount,
    avgLeaveCount,
    dayOfWeekAverages,
    classAverages
  };
}
