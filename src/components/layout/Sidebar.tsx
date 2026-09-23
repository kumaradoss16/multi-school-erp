import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  GraduationCap as AcademicIcon, 
  UserPlus, 
  CalendarCheck, 
  Banknote, 
  Award, 
  FileSpreadsheet, 
  CalendarDays, 
  BookOpen, 
  Bus, 
  Building2, 
  BarChart3, 
  Settings, 
  ChevronRight,
  Headphones,
  BookOpenCheck,
  HeartHandshake,
  Boxes,
  Cpu,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { normalizeModuleKey } from '../../utils/notificationUtils';

export type ERPModule = 
  | 'dashboard'
  | 'students'
  | 'staff'
  | 'classes'
  | 'admissions'
  | 'frontoffice'
  | 'academics'
  | 'attendance'
  | 'fees'
  | 'examinations'
  | 'assignments'
  | 'timetable'
  | 'library'
  | 'inventory'
  | 'welfare'
  | 'transport'
  | 'hostel'
  | 'integrations'
  | 'customization'
  | 'reports'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeModule: ERPModule;
  onSelectModule: (module: ERPModule) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  onSelectModule, 
  collapsed = false 
}) => {
  const { store, currentUser } = useERP();
  const unreadCounts = store.getUnreadCountsByModule(currentUser.name);

  const navItems: { 
    id: ERPModule; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>;
    shortcut?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'Ctrl+1' },
    { id: 'frontoffice', label: 'Front Office & CRM', icon: Headphones },
    { id: 'students', label: 'Students', icon: Users, shortcut: 'Ctrl+2' },
    { id: 'admissions', label: 'Admissions', icon: UserPlus, shortcut: 'Ctrl+7' },
    { id: 'academics', label: 'Academics & Lessons', icon: BookOpenCheck, shortcut: 'Ctrl+8' },
    { id: 'classes', label: 'Classes & Sections', icon: AcademicIcon },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, shortcut: 'Ctrl+3' },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'examinations', label: 'Examinations', icon: Award, shortcut: 'Ctrl+5' },
    { id: 'assignments', label: 'Assignments', icon: FileSpreadsheet },
    { id: 'fees', label: 'Fees & Accounting', icon: Banknote, shortcut: 'Ctrl+4' },
    { id: 'staff', label: 'Staff & Payroll', icon: UserCheck, shortcut: 'Ctrl+6' },
    { id: 'welfare', label: 'Student Welfare & Health', icon: HeartHandshake },
    { id: 'inventory', label: 'Inventory & Assets', icon: Boxes },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'transport', label: 'Transport Fleet', icon: Bus },
    { id: 'hostel', label: 'Hostel Rooms', icon: Building2 },
    { id: 'integrations', label: 'Gateways & Hardware', icon: Cpu },
    { id: 'customization', label: 'Customization Studio', icon: Sliders },
    { id: 'reports', label: 'Reports & Audits', icon: BarChart3, shortcut: 'Ctrl+9' },
    { id: 'users', label: 'Administration & Users', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'Ctrl+0' },
  ];

  return (
    <aside 
      id="app-sidebar"
      className={`${collapsed ? 'w-16' : 'w-64'} bg-[#121c2d] text-slate-300 flex flex-col shrink-0 transition-all duration-200 select-none z-20 border-r border-[#1e2d42]`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#1e2d42]/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight leading-snug">
                School ERP
              </span>
              <span className="text-[11px] text-slate-400 font-normal truncate">
                Smart Education, Better Tomorrow
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const modKey = normalizeModuleKey(item.id);
          const unreadCount = unreadCounts[modKey] || 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-[#2563eb] text-white shadow-md shadow-blue-700/25 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#1a273b]'
              }`}
              title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed && (
                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  {unreadCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight shrink-0 ${
                      isActive ? 'bg-white text-blue-700 shadow-2xs' : 'bg-blue-600 text-white'
                    }`}>
                      A{unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  <ChevronRight 
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'text-blue-200 translate-x-0.5' : 'text-slate-500 opacity-60'
                    }`} 
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Branding */}
      {!collapsed && (
        <div className="p-4 border-t border-[#1e2d42]/60 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">School ERP <span className="font-mono-tech text-[10px] text-blue-400">v1.0</span></div>
          <div className="text-[11px] text-slate-400">© 2025 All rights reserved.</div>
        </div>
      )}
    </aside>
  );
};
