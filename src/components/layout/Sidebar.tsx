import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../../hooks/useTheme';
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
  collapsed: propCollapsed = false 
}) => {
  const { store, currentUser } = useERP();
  const { sidebarStyle } = useTheme();
  const collapsed = sidebarStyle === 'collapsed' || sidebarStyle === 'mini';
  const isMini = sidebarStyle === 'mini';
  const unreadCounts = store.getUnreadCountsByModule(currentUser.name);

  const [hoveredItem, setHoveredItem] = useState<{ 
    id: ERPModule; 
    label: string; 
    shortcut?: string;
    rect: DOMRect; 
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear hovered tooltip if sidebar is uncollapsed
  useEffect(() => {
    if (!collapsed) {
      setHoveredItem(null);
    }
  }, [collapsed]);

  // Handle scroll to dismiss tooltips to prevent trailing tooltips
  useEffect(() => {
    const handleScroll = () => {
      setHoveredItem(null);
    };
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hoveredItem]);

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, item: typeof navItems[0]) => {
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredItem({
        id: item.id,
        label: item.label,
        shortcut: item.shortcut,
        rect
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>, item: typeof navItems[0]) => {
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredItem({
        id: item.id,
        label: item.label,
        shortcut: item.shortcut,
        rect
      });
    }
  };

  const handleBlur = () => {
    setHoveredItem(null);
  };

  // Safe clamping of tooltip position so it never overflows the viewport
  const getTooltipStyle = () => {
    if (!hoveredItem) return { style: {}, arrowStyle: {} };
    const tooltipHeight = 32; // height of tooltip
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const padding = 8;
    
    const rawTop = hoveredItem.rect.top + (hoveredItem.rect.height - tooltipHeight) / 2;
    const clampedTop = Math.max(padding, Math.min(rawTop, viewportHeight - tooltipHeight - padding));
    
    const shift = clampedTop - rawTop;
    const arrowTopPercent = 50 - (shift / tooltipHeight) * 100;
    const clampedArrowTopPercent = Math.max(15, Math.min(arrowTopPercent, 85));

    return {
      style: {
        left: `${hoveredItem.rect.right + 12}px`,
        top: `${clampedTop}px`
      },
      arrowStyle: {
        top: `${clampedArrowTopPercent}%`
      }
    };
  };

  const { style: tooltipStyle, arrowStyle: tooltipArrowStyle } = getTooltipStyle();

  return (
    <aside 
      id="app-sidebar"
      className={`${
        sidebarStyle === 'expanded' ? 'w-64' : sidebarStyle === 'mini' ? 'w-14' : 'w-16'
      } text-slate-300 flex flex-col shrink-0 transition-all duration-200 select-none z-20 border-r border-[#1e2d42]`}
      style={{
        backgroundColor: 'var(--erp-sidebar-bg, #121c2d)',
        color: 'var(--erp-sidebar-text, #cbd5e1)',
        borderColor: 'color-mix(in srgb, var(--erp-sidebar-bg, #121c2d) 88%, white)'
      }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-3 border-b border-[#1e2d42]/60 overflow-hidden">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30 shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className={`flex flex-col transition-all duration-200 overflow-hidden ${
            collapsed ? 'w-0 opacity-0 scale-95 ml-0 pointer-events-none' : 'w-auto opacity-100 scale-100'
          }`}>
            <span className="font-bold text-lg text-white tracking-tight leading-snug whitespace-nowrap">
              School ERP
            </span>
            <span className="text-[11px] text-slate-400 font-normal truncate whitespace-nowrap">
              Smart Education, Better Tomorrow
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const modKey = normalizeModuleKey(item.id);
          const unreadCount = unreadCounts[modKey] || 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
              onMouseLeave={handleMouseLeave}
              onFocus={(e) => handleFocus(e, item)}
              onBlur={handleBlur}
              className={`w-full flex items-center justify-between rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                isMini ? 'px-1 py-2 justify-center' : collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              style={isActive ? { backgroundColor: 'var(--erp-primary)' } : {}}
              title={!collapsed && item.shortcut ? `${item.label} (${item.shortcut})` : !collapsed ? item.label : undefined}
            >
              <div className={`flex items-center min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:scale-110 transition-transform duration-150'}`} />
                <span className={`transition-all duration-200 truncate ${
                  collapsed 
                    ? 'w-0 opacity-0 ml-0 pointer-events-none' 
                    : 'w-auto opacity-100 ml-3'
                }`}>
                  {item.label}
                </span>
              </div>
              <div className={`flex items-center shrink-0 transition-all duration-200 ${
                collapsed ? 'w-0 opacity-0 scale-75 overflow-hidden ml-0' : 'w-auto opacity-100 scale-100 ml-2'
              }`}>
                {unreadCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight shrink-0 mr-1.5 ${
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
            </button>
          );
        })}
      </div>

      {/* Footer Branding */}
      <div className={`p-4 border-t border-[#1e2d42]/60 text-xs text-slate-400 space-y-1 transition-all duration-200 overflow-hidden shrink-0 ${
        collapsed ? 'h-0 py-0 opacity-0 border-t-0' : 'h-auto opacity-100'
      }`}>
        <div className="font-semibold text-slate-300 whitespace-nowrap">School ERP <span className="font-mono-tech text-[10px] text-blue-400">v1.0</span></div>
        <div className="text-[11px] text-slate-400 whitespace-nowrap">© 2025 All rights reserved.</div>
      </div>

      {/* Tooltip for Collapsed Sidebar */}
      {collapsed && hoveredItem && (
        <div 
          className="fixed z-50 px-3 py-1.5 bg-[#121c2d] text-white text-xs font-semibold rounded-lg shadow-xl border border-[#1e2d42] pointer-events-none whitespace-nowrap flex items-center space-x-2 animate-in fade-in slide-in-from-left-1 duration-100"
          style={tooltipStyle}
        >
          <span>{hoveredItem.label}</span>
          {hoveredItem.shortcut && (
            <kbd className="px-1 py-0.5 bg-white/10 text-slate-300 border border-white/20 rounded text-[10px] font-mono font-bold leading-none shadow-xs">
              {hoveredItem.shortcut}
            </kbd>
          )}
          {/* Tiny arrow pointing left */}
          <div 
            className="absolute left-[-4px] w-2 h-2 bg-[#121c2d] border-l border-b border-[#1e2d42] rotate-45"
            style={tooltipArrowStyle}
          />
        </div>
      )}
    </aside>
  );
};
