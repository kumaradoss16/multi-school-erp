import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar, ERPModule } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatusBar } from './components/layout/StatusBar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationToastContainer } from './components/common/NotificationToastContainer';
import { RealtimeAlertMonitorModal } from './components/common/RealtimeAlertMonitorModal';
import { AllQuickActionsModal } from './components/common/AllQuickActionsModal';
import { OfflineStatusBar } from './components/common/OfflineStatusBar';
import { notificationEngine } from './services/notificationEngine';
import { useTheme } from './hooks/useTheme';
import { useERP } from './hooks/useERP';

// Modules
import { DashboardView } from './components/modules/DashboardView';
import { StudentsModule } from './components/modules/StudentsModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { FeesModule } from './components/modules/FeesModule';
import { ExaminationsModule } from './components/modules/ExaminationsModule';
import { StaffModule } from './components/modules/StaffModule';
import { AdmissionsModule } from './components/modules/AdmissionsModule';
import { ClassesModule } from './components/modules/ClassesModule';
import { LibraryModule } from './components/modules/LibraryModule';
import { TransportModule } from './components/modules/TransportModule';
import { AuditReportsModule } from './components/modules/AuditReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { FrontOfficeModule } from './components/modules/FrontOfficeModule';
import { AcademicsModule } from './components/modules/AcademicsModule';
import { StudentWelfareModule } from './components/modules/StudentWelfareModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { IntegrationsModule } from './components/modules/IntegrationsModule';
import { CustomizationView } from './components/views/CustomizationView';
import { UsersModule } from './components/modules/UsersModule';

export default function App() {
  const { theme, sidebarStyle, setSidebarStyle } = useTheme();
  const { themes, activeThemeId, store } = useERP();
  const sidebarCollapsed = sidebarStyle === 'collapsed' || sidebarStyle === 'mini';
  const [activeModule, setActiveModule] = useState<ERPModule>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertMonitorOpen, setIsAlertMonitorOpen] = useState(false);
  const [isQuickActionsModalOpen, setIsQuickActionsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Shortcut HUD notification state for power users
  const [shortcutFeedback, setShortcutFeedback] = useState<{ label: string; shortcut: string } | null>(null);

  // Quick action handling from dashboard
  const [openCollectFees, setOpenCollectFees] = useState(false);
  const [openCreateExam, setOpenCreateExam] = useState(false);

  // Ensure diagnostic alerts are synchronized on start
  useEffect(() => {
    notificationEngine.runDiagnosticScan(false);
  }, []);

  // Synchronize stored brand theme token colors on startup
  useEffect(() => {
    const activeTheme = themes.find(t => t.id === activeThemeId);
    if (activeTheme) {
      store.setActiveTheme(activeThemeId);
    }
  }, []);

  // Global Keyboard Shortcut Handler for Power Users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.getAttribute('role') === 'textbox'
      );

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // 1. Escape key closes open modals
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          return;
        }
        if (isAlertMonitorOpen) {
          setIsAlertMonitorOpen(false);
          return;
        }
        if (isQuickActionsModalOpen) {
          setIsQuickActionsModalOpen(false);
          return;
        }
      }

      // 2. Ctrl/Cmd + K -> Global Search (Always accessible even if inputs are focused)
      if (modifier && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        return;
      }

      // If user is actively typing in a form or input, don't trigger number/navigation shortcuts
      if (isInputFocused) {
        return;
      }

      // 3. Ctrl/Cmd + Shift + A -> Alert Monitor
      if (modifier && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAlertMonitorOpen(prev => !prev);
        return;
      }

      // 4. Ctrl/Cmd + Shift + Q -> All Quick Actions
      if (modifier && e.shiftKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        setIsQuickActionsModalOpen(prev => !prev);
        return;
      }

      // 5. Ctrl/Cmd + B -> Toggle Sidebar
      if (modifier && !e.shiftKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setSidebarStyle(sidebarStyle === 'expanded' ? 'collapsed' : 'expanded');
        return;
      }

      // 6. Major Module Quick Switch: Ctrl/Cmd + 1..9, 0
      if (modifier && !e.shiftKey && !e.altKey) {
        const moduleMap: Record<string, { module: ERPModule; label: string }> = {
          '1': { module: 'dashboard', label: 'Dashboard' },
          '2': { module: 'students', label: 'Students' },
          '3': { module: 'attendance', label: 'Attendance' },
          '4': { module: 'fees', label: 'Fees & Accounting' },
          '5': { module: 'examinations', label: 'Examinations' },
          '6': { module: 'staff', label: 'Staff Management' },
          '7': { module: 'admissions', label: 'Admissions' },
          '8': { module: 'academics', label: 'Academics & Lessons' },
          '9': { module: 'reports', label: 'Reports & Audits' },
          '0': { module: 'settings', label: 'Settings' },
        };

        const targetModule = moduleMap[e.key];
        if (targetModule) {
          e.preventDefault();
          setActiveModule(targetModule.module);
          setSelectedStudentId(null);

          const keySymbol = isMac ? '⌘' : 'Ctrl+';
          setShortcutFeedback({
            label: targetModule.label,
            shortcut: `${keySymbol}${e.key}`
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isAlertMonitorOpen, isQuickActionsModalOpen]);

  // Auto-clear shortcut HUD feedback
  useEffect(() => {
    if (shortcutFeedback) {
      const timer = setTimeout(() => setShortcutFeedback(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [shortcutFeedback]);

  const handleSelectModule = (mod: ERPModule) => {
    setActiveModule(mod);
    setSelectedStudentId(null);
  };

  const handleOpenQuickAction = (action: string) => {
    switch (action) {
      case 'all':
        setIsQuickActionsModalOpen(true);
        break;
      case 'add-student':
      case 'id-cards':
      case 'certificates':
        setActiveModule('students');
        break;
      case 'new-admission':
        setActiveModule('admissions');
        break;
      case 'welfare':
        setActiveModule('welfare');
        break;
      case 'add-staff':
      case 'payroll':
      case 'staff-leaves':
        setActiveModule('staff');
        break;
      case 'collect-fees':
        setOpenCollectFees(true);
        setActiveModule('fees');
        break;
      case 'generate-challans':
      case 'fee-concession':
        setActiveModule('fees');
        break;
      case 'create-exam':
        setOpenCreateExam(true);
        setActiveModule('examinations');
        break;
      case 'enter-marks':
        setActiveModule('examinations');
        break;
      case 'take-attendance':
        setActiveModule('attendance');
        break;
      case 'manage-timetable':
        setActiveModule('timetable');
        break;
      case 'add-assignment':
      case 'lesson-plan':
        setActiveModule('academics');
        break;
      case 'library-issue':
        setActiveModule('library');
        break;
      case 'transport':
        setActiveModule('transport');
        break;
      case 'hostel':
        setActiveModule('hostel');
        break;
      case 'visitor-pass':
        setActiveModule('frontoffice');
        break;
      case 'inventory':
        setActiveModule('inventory');
        break;
      case 'integrations':
        setActiveModule('integrations');
        break;
      case 'reports':
        setActiveModule('reports');
        break;
      case 'alerts':
        setIsAlertMonitorOpen(true);
        break;
      default:
        setActiveModule('dashboard');
        break;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden font-sans select-none antialiased">
      {/* 1. Desktop Frameless Window TitleBar */}
      <TitleBar 
        onSearchClick={() => setIsSearchOpen(true)} 
        activeModule={activeModule}
      />

      {/* 2. Main Desktop Workstation Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          collapsed={sidebarCollapsed}
        />

        {/* Core Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
          <OfflineStatusBar />
          {/* Top Application Header */}
          <Header
            onToggleSidebar={() => setSidebarStyle(sidebarStyle === 'expanded' ? 'collapsed' : 'expanded')}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectModule={handleSelectModule}
            onOpenAlerts={() => setIsAlertMonitorOpen(true)}
            onSelectStudent={(studentId) => {
              setSelectedStudentId(studentId);
              setActiveModule('students');
            }}
          />

          {/* Module View Canvas (Scrollable) */}
          <main className="flex-1 overflow-y-auto">
            {activeModule === 'dashboard' && (
              <DashboardView
                onSelectModule={handleSelectModule}
                onOpenQuickAction={handleOpenQuickAction}
                onOpenAlerts={() => setIsAlertMonitorOpen(true)}
              />
            )}

            {activeModule === 'students' && (
              <StudentsModule
                selectedStudentId={selectedStudentId}
              />
            )}

            {activeModule === 'attendance' && (
              <AttendanceModule />
            )}

            {activeModule === 'fees' && (
              <FeesModule
                initialOpenCollect={openCollectFees}
              />
            )}

            {activeModule === 'examinations' && (
              <ExaminationsModule
                initialOpenCreate={openCreateExam}
              />
            )}

            {activeModule === 'frontoffice' && (
              <FrontOfficeModule />
            )}

            {activeModule === 'academics' && (
              <AcademicsModule />
            )}

            {activeModule === 'welfare' && (
              <StudentWelfareModule />
            )}

            {activeModule === 'inventory' && (
              <InventoryModule />
            )}

            {activeModule === 'integrations' && (
              <IntegrationsModule />
            )}

            {activeModule === 'staff' && (
              <StaffModule />
            )}

            {activeModule === 'admissions' && (
              <AdmissionsModule />
            )}

            {(activeModule === 'classes' || activeModule === 'timetable') && (
              <ClassesModule />
            )}

            {activeModule === 'library' && (
              <LibraryModule />
            )}

            {(activeModule === 'transport' || activeModule === 'hostel') && (
              <TransportModule />
            )}

            {(activeModule === 'reports' || activeModule === 'assignments') && (
              <AuditReportsModule />
            )}

            {activeModule === 'customization' && (
              <div className="p-6 max-w-7xl mx-auto">
                <CustomizationView />
              </div>
            )}

            {activeModule === 'users' && (
              <UsersModule />
            )}

            {activeModule === 'settings' && (
              <SettingsModule />
            )}
          </main>
        </div>
      </div>

      {/* 3. Bottom Desktop Status Bar */}
      <StatusBar 
        onOpenAlerts={() => setIsAlertMonitorOpen(true)}
        onSelectModule={handleSelectModule}
      />

      {/* Global Quick Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={handleSelectModule}
        onSelectStudent={(studentId) => {
          setSelectedStudentId(studentId);
          setActiveModule('students');
        }}
      />

      {/* Real-Time Floating Notification Toasts */}
      <NotificationToastContainer 
        onSelectModule={handleSelectModule}
        onSelectStudent={(studentId) => {
          setSelectedStudentId(studentId);
          setActiveModule('students');
        }}
      />

      {/* Real-Time Institutional Alert Monitor Modal */}
      <RealtimeAlertMonitorModal
        isOpen={isAlertMonitorOpen}
        onClose={() => setIsAlertMonitorOpen(false)}
        onSelectModule={handleSelectModule}
        onSelectStudent={(studentId) => {
          setSelectedStudentId(studentId);
          setActiveModule('students');
        }}
      />

      {/* Comprehensive Quick Actions Directory & Command Hub */}
      <AllQuickActionsModal
        isOpen={isQuickActionsModalOpen}
        onClose={() => setIsQuickActionsModalOpen(false)}
        onSelectModule={handleSelectModule}
        onOpenQuickAction={handleOpenQuickAction}
        onOpenAlerts={() => setIsAlertMonitorOpen(true)}
      />

      {/* Keyboard Shortcut HUD Feedback for Power Users */}
      {shortcutFeedback && (
        <div 
          id="keyboard-shortcut-hud"
          className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center space-x-2.5 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-none"
        >
          <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md font-mono-tech text-[11px] font-bold shadow-xs">
            {shortcutFeedback.shortcut}
          </span>
          <span className="text-slate-300">
            Switched to <span className="text-white font-bold">{shortcutFeedback.label}</span>
          </span>
        </div>
      )}
    </div>
  );
}
