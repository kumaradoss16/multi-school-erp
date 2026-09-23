export function normalizeModuleKey(moduleStr: string): string {
  if (!moduleStr) return '';
  const lower = moduleStr.toLowerCase().trim();
  if (lower.includes('front') || lower.includes('crm')) return 'frontoffice';
  if (lower.includes('academic') || lower.includes('lesson')) return 'academics';
  if (lower.includes('class')) return 'classes';
  if (lower.includes('fee') || lower.includes('account')) return 'fees';
  if (lower.includes('exam')) return 'examinations';
  if (lower.includes('assign')) return 'assignments';
  if (lower.includes('student')) return 'students';
  if (lower.includes('staff') || lower.includes('payroll')) return 'staff';
  if (lower.includes('admission')) return 'admissions';
  if (lower.includes('attendance')) return 'attendance';
  if (lower.includes('timetable')) return 'timetable';
  if (lower.includes('library')) return 'library';
  if (lower.includes('inventory') || lower.includes('asset')) return 'inventory';
  if (lower.includes('welfare') || lower.includes('health')) return 'welfare';
  if (lower.includes('transport')) return 'transport';
  if (lower.includes('hostel')) return 'hostel';
  if (lower.includes('integration')) return 'integrations';
  if (lower.includes('report') || lower.includes('audit')) return 'reports';
  if (lower.includes('user') || lower.includes('admin')) return 'users';
  if (lower.includes('setting')) return 'settings';
  return lower;
}
