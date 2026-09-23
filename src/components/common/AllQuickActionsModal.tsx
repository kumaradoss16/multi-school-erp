import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  UserPlus, 
  UserCheck, 
  Users, 
  CalendarCheck, 
  Banknote, 
  Award, 
  ClipboardList, 
  CalendarDays, 
  FileSpreadsheet, 
  BookOpen, 
  Bus, 
  Building2, 
  Headphones, 
  Boxes, 
  Cpu, 
  BarChart3, 
  Settings, 
  HeartHandshake, 
  BookOpenCheck,
  Receipt,
  CreditCard,
  FileText,
  ShieldAlert,
  Clock,
  Filter,
  Check,
  Layers,
  GraduationCap,
  Activity
} from 'lucide-react';
import { ERPModule } from '../layout/Sidebar';

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  category: 'students' | 'academics' | 'finance' | 'staff' | 'operations' | 'reports';
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  targetModule: ERPModule;
  actionCode?: string;
  hotkey?: string;
}

interface AllQuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ERPModule) => void;
  onOpenQuickAction?: (action: string) => void;
  onOpenAlerts?: () => void;
}

export const ALL_QUICK_ACTIONS: QuickActionItem[] = [
  // 1. Students & Admissions
  {
    id: 'add-student',
    title: 'Add New Student',
    description: 'Enroll a new student with roll number, class assignment & parent contacts',
    category: 'students',
    categoryLabel: 'Students & Admissions',
    icon: UserPlus,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    badge: 'Frequent',
    targetModule: 'students',
    actionCode: 'add-student',
    hotkey: 'Alt + S'
  },
  {
    id: 'new-admission',
    title: 'New Admission Inquiry',
    description: 'Record applicant inquiries, schedule campus tours and entrance tests',
    category: 'students',
    categoryLabel: 'Students & Admissions',
    icon: GraduationCap,
    iconBg: 'bg-sky-500',
    iconColor: 'text-white',
    targetModule: 'admissions',
    actionCode: 'new-admission'
  },
  {
    id: 'student-id-cards',
    title: 'Generate Student ID Cards',
    description: 'Bulk format and print student identity cards with barcode & blood group',
    category: 'students',
    categoryLabel: 'Students & Admissions',
    icon: CreditCard,
    iconBg: 'bg-cyan-600',
    iconColor: 'text-white',
    targetModule: 'students',
    actionCode: 'id-cards'
  },
  {
    id: 'issue-certificate',
    title: 'Issue Certificate (Bonafide / TC)',
    description: 'Draft official Bonafide, Transfer, Character, or Merit certificates',
    category: 'students',
    categoryLabel: 'Students & Admissions',
    icon: FileText,
    iconBg: 'bg-indigo-500',
    iconColor: 'text-white',
    targetModule: 'students',
    actionCode: 'certificates'
  },
  {
    id: 'student-welfare',
    title: 'Student Health & Wellness',
    description: 'Log medical alerts, allergy profiles, immunization logs & counselor notes',
    category: 'students',
    categoryLabel: 'Students & Admissions',
    icon: HeartHandshake,
    iconBg: 'bg-rose-500',
    iconColor: 'text-white',
    targetModule: 'welfare',
    actionCode: 'welfare'
  },

  // 2. Academics & Exams
  {
    id: 'take-attendance',
    title: 'Take Daily Attendance',
    description: 'Mark class attendance with present, absent, late, or excused leave tags',
    category: 'academics',
    categoryLabel: 'Academics & Exams',
    icon: CalendarCheck,
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    badge: 'Daily',
    targetModule: 'attendance',
    actionCode: 'take-attendance',
    hotkey: 'Alt + A'
  },
  {
    id: 'create-exam',
    title: 'Schedule Examination',
    description: 'Create Term, Mid-Term, or Unit tests with max marks & timetable dates',
    category: 'academics',
    categoryLabel: 'Academics & Exams',
    icon: Award,
    iconBg: 'bg-red-500',
    iconColor: 'text-white',
    badge: 'Term II',
    targetModule: 'examinations',
    actionCode: 'create-exam'
  },
  {
    id: 'enter-exam-marks',
    title: 'Enter Assessment Marks',
    description: 'Input subject scores, calculate grades, and generate student report cards',
    category: 'academics',
    categoryLabel: 'Academics & Exams',
    icon: FileSpreadsheet,
    iconBg: 'bg-pink-600',
    iconColor: 'text-white',
    targetModule: 'examinations',
    actionCode: 'enter-marks'
  },
  {
    id: 'add-assignment',
    title: 'Add Homework & Assignment',
    description: 'Assign homework, worksheets, reading material & set submission deadlines',
    category: 'academics',
    categoryLabel: 'Academics & Exams',
    icon: ClipboardList,
    iconBg: 'bg-teal-500',
    iconColor: 'text-white',
    targetModule: 'academics',
    actionCode: 'add-assignment'
  },
  {
    id: 'manage-timetable',
    title: 'Manage Class Timetable',
    description: 'Adjust period timings, teacher substitutions & classroom assignments',
    category: 'academics',
    categoryLabel: 'Academics & Exams',
    icon: CalendarDays,
    iconBg: 'bg-indigo-600',
    iconColor: 'text-white',
    targetModule: 'timetable',
    actionCode: 'manage-timetable'
  },
  {
    id: 'lesson-planning',
    title: 'Lesson Plan & Syllabus Tracker',
    description: 'Monitor curriculum milestones, syllabus pacing & chapter progress',
    category: 'academics',
    categoryLabel: 'Academics & Exams',
    icon: BookOpenCheck,
    iconBg: 'bg-emerald-600',
    iconColor: 'text-white',
    targetModule: 'academics',
    actionCode: 'lesson-plan'
  },

  // 3. Finance & Fees
  {
    id: 'collect-fees',
    title: 'Collect Fee Payment',
    description: 'Accept cash, UPI, bank transfer, or card payments and print fee receipts',
    category: 'finance',
    categoryLabel: 'Finance & Fees',
    icon: Banknote,
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
    badge: 'Popular',
    targetModule: 'fees',
    actionCode: 'collect-fees',
    hotkey: 'Alt + F'
  },
  {
    id: 'generate-challans',
    title: 'Issue Batch Fee Invoices',
    description: 'Generate quarterly term invoices and send automatic SMS payment reminders',
    category: 'finance',
    categoryLabel: 'Finance & Fees',
    icon: Receipt,
    iconBg: 'bg-orange-600',
    iconColor: 'text-white',
    targetModule: 'fees',
    actionCode: 'generate-challans'
  },
  {
    id: 'fee-concession',
    title: 'Fee Concession & Scholarship',
    description: 'Apply sibling discount, merit waiver, or financial aid fee adjustments',
    category: 'finance',
    categoryLabel: 'Finance & Fees',
    icon: Sparkles,
    iconBg: 'bg-violet-600',
    iconColor: 'text-white',
    targetModule: 'fees',
    actionCode: 'fee-concession'
  },

  // 4. Staff & HR
  {
    id: 'add-staff',
    title: 'Register New Staff',
    description: 'Add teacher, administrative or support personnel with salary & roles',
    category: 'staff',
    categoryLabel: 'Staff & HR',
    icon: UserCheck,
    iconBg: 'bg-emerald-600',
    iconColor: 'text-white',
    targetModule: 'staff',
    actionCode: 'add-staff'
  },
  {
    id: 'process-payroll',
    title: 'Process Monthly Payroll',
    description: 'Disburse staff salaries, calculate PF/ESI deductions and issue pay slips',
    category: 'staff',
    categoryLabel: 'Staff & HR',
    icon: Banknote,
    iconBg: 'bg-green-700',
    iconColor: 'text-white',
    targetModule: 'staff',
    actionCode: 'payroll'
  },
  {
    id: 'approve-leave',
    title: 'Staff Leave Requests',
    description: 'Review casual, medical, and maternity leave applications with substitute alerts',
    category: 'staff',
    categoryLabel: 'Staff & HR',
    icon: Clock,
    iconBg: 'bg-amber-600',
    iconColor: 'text-white',
    targetModule: 'staff',
    actionCode: 'staff-leaves'
  },

  // 5. Operations & Campus Logistics
  {
    id: 'issue-library-book',
    title: 'Issue / Return Library Book',
    description: 'Scan book ISBN barcode, track issued volumes & compute fine calculations',
    category: 'operations',
    categoryLabel: 'Campus Operations',
    icon: BookOpen,
    iconBg: 'bg-teal-600',
    iconColor: 'text-white',
    targetModule: 'library',
    actionCode: 'library-issue'
  },
  {
    id: 'fleet-transport',
    title: 'Transport GPS & Bus Routes',
    description: 'Inspect live fleet tracking, route stops, driver logs & student allocations',
    category: 'operations',
    categoryLabel: 'Campus Operations',
    icon: Bus,
    iconBg: 'bg-yellow-600',
    iconColor: 'text-white',
    targetModule: 'transport',
    actionCode: 'transport'
  },
  {
    id: 'hostel-management',
    title: 'Hostel Room Allotment',
    description: 'Allocate dormitory beds, track night curfews & monitor mess meal registers',
    category: 'operations',
    categoryLabel: 'Campus Operations',
    icon: Building2,
    iconBg: 'bg-stone-600',
    iconColor: 'text-white',
    targetModule: 'hostel',
    actionCode: 'hostel'
  },
  {
    id: 'visitor-pass',
    title: 'Front Office Visitor Pass',
    description: 'Issue security visitor passes, record campus visits & parent meeting logs',
    category: 'operations',
    categoryLabel: 'Campus Operations',
    icon: Headphones,
    iconBg: 'bg-blue-700',
    iconColor: 'text-white',
    targetModule: 'frontoffice',
    actionCode: 'visitor-pass'
  },
  {
    id: 'inventory-assets',
    title: 'Stock & Inventory Inward',
    description: 'Track science lab equipment, sports goods, uniform inventory & re-orders',
    category: 'operations',
    categoryLabel: 'Campus Operations',
    icon: Boxes,
    iconBg: 'bg-slate-700',
    iconColor: 'text-white',
    targetModule: 'inventory',
    actionCode: 'inventory'
  },
  {
    id: 'gateways-hardware',
    title: 'Hardware & Biometric Gateway',
    description: 'Configure RFID attendance readers, WhatsApp/SMS broadcast API & sync status',
    category: 'operations',
    categoryLabel: 'Campus Operations',
    icon: Cpu,
    iconBg: 'bg-slate-800',
    iconColor: 'text-white',
    targetModule: 'integrations',
    actionCode: 'integrations'
  },

  // 6. Reports & Audits
  {
    id: 'student-reports',
    title: 'Student Academic Reports',
    description: 'Generate multi-criteria class reports, GPA distribution & report cards',
    category: 'reports',
    categoryLabel: 'Reports & Audits',
    icon: BarChart3,
    iconBg: 'bg-purple-500',
    iconColor: 'text-white',
    targetModule: 'reports',
    actionCode: 'reports'
  },
  {
    id: 'institutional-alerts',
    title: 'Institutional Alert Monitor',
    description: 'Audit live critical alerts, safety warnings, medical and fee recovery notices',
    category: 'reports',
    categoryLabel: 'Reports & Audits',
    icon: ShieldAlert,
    iconBg: 'bg-rose-600',
    iconColor: 'text-white',
    badge: 'Live',
    targetModule: 'dashboard',
    actionCode: 'alerts'
  }
];

export const AllQuickActionsModal: React.FC<AllQuickActionsModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onOpenQuickAction,
  onOpenAlerts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('school_erp_pinned_quick_actions');
      return saved ? JSON.parse(saved) : ['add-student', 'collect-fees', 'take-attendance', 'create-exam'];
    } catch {
      return ['add-student', 'collect-fees', 'take-attendance', 'create-exam'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPinnedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('school_erp_pinned_quick_actions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredActions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_QUICK_ACTIONS.filter(item => {
      const matchesCategory = selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'pinned' 
          ? pinnedIds.includes(item.id) 
          : item.category === selectedCategory;
      
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) || 
        item.categoryLabel.toLowerCase().includes(q) ||
        (item.hotkey && item.hotkey.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, pinnedIds]);

  const handleExecuteAction = (action: QuickActionItem) => {
    onClose();
    if (action.id === 'institutional-alerts') {
      if (onOpenAlerts) onOpenAlerts();
      return;
    }

    if (onOpenQuickAction && action.actionCode) {
      onOpenQuickAction(action.actionCode);
    } else {
      onSelectModule(action.targetModule);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="all-quick-actions-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header & Search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-slate-900 text-base">Quick Actions Hub</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {ALL_QUICK_ACTIONS.length} Action Shortcuts
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Execute direct administrative tasks, create records, and launch school ERP workflows
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions by name, task, or module (e.g., fee, exam, admission, attendance, payroll, id card)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-3 pb-0.5 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({ALL_QUICK_ACTIONS.length})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('pinned')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'pinned' 
                  ? 'bg-amber-500 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Favorites ({pinnedIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('students')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'students' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Students &amp; Admissions</span>
            </button>

            <button
              onClick={() => setSelectedCategory('academics')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'academics' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academics &amp; Exams</span>
            </button>

            <button
              onClick={() => setSelectedCategory('finance')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'finance' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Fees &amp; Finance</span>
            </button>

            <button
              onClick={() => setSelectedCategory('staff')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'staff' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff &amp; HR</span>
            </button>

            <button
              onClick={() => setSelectedCategory('operations')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'operations' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Operations &amp; Fleet</span>
            </button>

            <button
              onClick={() => setSelectedCategory('reports')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedCategory === 'reports' 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200/70'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reports</span>
            </button>
          </div>
        </div>

        {/* 2. Action Cards Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">No matching actions found</p>
              <p className="text-xs text-slate-500">
                Try searching with different keywords like &quot;fees&quot;, &quot;exam&quot;, &quot;student&quot;, or &quot;attendance&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredActions.map((action) => {
                const isPinned = pinnedIds.includes(action.id);
                const IconComponent = action.icon;

                return (
                  <div
                    key={action.id}
                    onClick={() => handleExecuteAction(action)}
                    className="group relative bg-white p-3.5 rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Top: Icon, Badge, Pin */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-10 h-10 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              {action.categoryLabel}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs leading-snug group-hover:text-blue-600 transition">
                              {action.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          {action.badge && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold">
                              {action.badge}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => togglePin(e, action.id)}
                            className={`p-1 rounded-md transition ${
                              isPinned ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-500'
                            }`}
                            title={isPinned ? 'Remove from favorites' : 'Pin to favorites'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    {/* Card Footer: Action Launch Indicator & Hotkey */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 mt-3 border-t border-slate-100 font-medium">
                      {action.hotkey ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
                          {action.hotkey}
                        </span>
                      ) : (
                        <span className="text-slate-400">Direct Launch</span>
                      )}
                      <span className="text-blue-600 font-semibold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Modal Footer */}
        <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Click any card to immediately jump into that workflow</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline">Star items to pin them to Favorites</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
