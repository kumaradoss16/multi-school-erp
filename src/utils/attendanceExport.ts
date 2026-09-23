import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DayAttendanceData } from '../components/common/AttendanceHeatmapChart';
import { DateRangeValue } from '../components/common/DateRangeSelector';

export interface ExportAttendanceOptions {
  data: DayAttendanceData[];
  metrics: {
    avg: number;
    avgCount: number;
    compliantPercent: number;
    compliantCount: number;
    totalWorking: number;
    currentStreak: number;
    totalEnrolled: number;
    maxDay?: DayAttendanceData | null;
    minDay?: DayAttendanceData | null;
  };
  dateRange: DateRangeValue;
  classFilter: string;
  institutionName?: string;
  reportType?: 'FULL_AUDIT' | 'EXECUTIVE_SUMMARY';
}

/**
 * Generates an official, publication-ready PDF attendance report with formal school branding,
 * executive analytics KPIs, compliance breakdown, and full day-by-day records.
 */
export const exportAttendanceToPDF = ({
  data,
  metrics,
  dateRange,
  classFilter,
  institutionName = 'Delhi Public Academy & Senior Secondary School',
  reportType = 'FULL_AUDIT'
}: ExportAttendanceOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36; // 0.5 inch

  // 1. Official Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 75, 'F');

  // School Emblem / Accent Bar
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 72, pageWidth, 4, 'F');

  // Institution Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(institutionName.toUpperCase(), margin, 32);

  // Document Title & Tag
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text('OFFICIAL STUDENT ATTENDANCE & STATUTORY CBSE COMPLIANCE RECORD', margin, 48);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  const generationTimestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Generated: ${generationTimestamp} | Document ID: ATT-REC-${Date.now().toString().slice(-6)}`, margin, 62);

  let currentY = 95;

  // 2. Metadata Section (Period, Cohort, Summary Stats)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SCOPE & TIME HORIZON', margin, currentY);

  currentY += 12;

  // Scope Info Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 42, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Academic Period:', margin + 12, currentY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${dateRange.label} (${dateRange.startDate} to ${dateRange.endDate})`, margin + 100, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Class Cohort:', margin + 12, currentY + 30);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(classFilter === 'ALL' ? 'All Classes (Whole School Enrollment - 1,248 Students)' : classFilter, margin + 100, currentY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Calendar Span:', pageWidth / 2 + 20, currentY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.length} Calendar Days (${metrics.totalWorking} Instructional Days)`, pageWidth / 2 + 100, currentY + 16);

  currentY += 56;

  // 3. Key Performance Indicators (KPIs) Summary Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. EXECUTIVE COMPLIANCE METRICS', margin, currentY);

  currentY += 12;

  const kpiBoxWidth = (pageWidth - margin * 2 - 18) / 4;
  const kpiBoxHeight = 44;

  // KPI 1: Period Average
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(margin, currentY, kpiBoxWidth, kpiBoxHeight, 4, 4, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70); // Emerald-800
  doc.text('AVERAGE ATTENDANCE', margin + 8, currentY + 14);
  doc.setFontSize(14);
  doc.text(`${metrics.avg}%`, margin + 8, currentY + 32);

  // KPI 2: CBSE Compliance Rate
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + kpiBoxWidth + 6, currentY, kpiBoxWidth, kpiBoxHeight, 4, 4, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('CBSE ≥75% COMPLIANCE', margin + kpiBoxWidth + 14, currentY + 14);
  doc.setFontSize(14);
  doc.text(`${metrics.compliantPercent}%`, margin + kpiBoxWidth + 14, currentY + 32);

  // KPI 3: Peak Attendance
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin + (kpiBoxWidth + 6) * 2, currentY, kpiBoxWidth, kpiBoxHeight, 4, 4, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('PEAK ATTENDANCE', margin + (kpiBoxWidth + 6) * 2 + 8, currentY + 14);
  doc.setFontSize(14);
  doc.text(`${metrics.maxDay?.attendancePercent || 98}%`, margin + (kpiBoxWidth + 6) * 2 + 8, currentY + 32);

  // KPI 4: 90%+ Streak
  doc.setFillColor(254, 243, 199); // Amber-50
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(margin + (kpiBoxWidth + 6) * 3, currentY, kpiBoxWidth, kpiBoxHeight, 4, 4, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('90%+ STREAK', margin + (kpiBoxWidth + 6) * 3 + 8, currentY + 14);
  doc.setFontSize(14);
  doc.text(`${metrics.currentStreak} Days`, margin + (kpiBoxWidth + 6) * 3 + 8, currentY + 32);

  currentY += 58;

  // 4. Day-by-Day Historical Attendance Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. DAILY ATTENDANCE & INSTRUCTIONAL AUDIT LOG', margin, currentY);

  currentY += 8;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const tableBody = data.map(d => [
    d.dateStr,
    daysOfWeek[d.dayOfWeek],
    d.isHoliday ? (d.holidayName || 'Holiday') : 'Working Day',
    d.isHoliday ? '-' : `${d.attendancePercent}%`,
    d.isHoliday ? '-' : d.presentStudents.toLocaleString(),
    d.isHoliday ? '-' : d.absentStudents.toString(),
    d.isHoliday ? '-' : d.lateStudents.toString(),
    d.isHoliday ? '-' : d.leaveStudents.toString(),
    d.eventTitle || (d.isHoliday ? (d.holidayName || 'Weekend Holiday') : 'Regular Session')
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Day', 'Type', 'Rate (%)', 'Present', 'Absent', 'Late', 'Leave', 'Event / Remarks']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 55, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 55, halign: 'center' },
      3: { cellWidth: 45, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 42, halign: 'right' },
      5: { cellWidth: 38, halign: 'right' },
      6: { cellWidth: 35, halign: 'right' },
      7: { cellWidth: 35, halign: 'right' },
      8: { cellWidth: 'auto', halign: 'left' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawPage: (dataObj) => {
      // Footer with page numbering and sign-off on bottom
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Delhi Public Academy SMIS • Confidential School Record • Page ${dataObj.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' }
      );
    }
  });

  // 5. Formal Authentication & Sign-off on the last page
  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 100;
  
  if (finalY + 70 < pageHeight - 30) {
    const signY = pageHeight - 65;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, signY, margin + 140, signY);
    doc.line(pageWidth - margin - 140, signY, pageWidth - margin, signY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Prepared by Academic Dean', margin, signY + 12);
    doc.text('Verified by Principal / Seal', pageWidth - margin - 140, signY + 12);
  }

  // Save the PDF file
  const fileName = `attendance_record_${classFilter.replace(/\s+/g, '_')}_${dateRange.startDate}_to_${dateRange.endDate}.pdf`;
  doc.save(fileName);
};

/**
 * Exports the raw historical attendance data to standard CSV format.
 */
export const exportAttendanceToCSV = ({
  data,
  dateRange,
  classFilter
}: {
  data: DayAttendanceData[];
  dateRange: DateRangeValue;
  classFilter: string;
}) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const headers = [
    'Date (YYYY-MM-DD)',
    'Day of Week',
    'Day Type',
    'Attendance Rate (%)',
    'Total Enrolled',
    'Present Count',
    'Unexcused Absent Count',
    'Late Arrivals Count',
    'Sanctioned Leave Count',
    'Event / Holiday Description',
    'Academic Term'
  ];

  const rows = data.map(d => [
    d.dateStr,
    daysOfWeek[d.dayOfWeek],
    d.isHoliday ? (d.holidayName || 'Holiday') : 'Instructional Day',
    d.isHoliday ? '0.0%' : `${d.attendancePercent}%`,
    d.totalStudents,
    d.presentStudents,
    d.absentStudents,
    d.lateStudents,
    d.leaveStudents,
    `"${(d.eventTitle || d.holidayName || 'Regular Academic Session').replace(/"/g, '""')}"`,
    `"${dateRange.label.replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `attendance_export_${classFilter.replace(/\s+/g, '_')}_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
