import { useState, useEffect } from 'react';
import { erpStore, ERPState } from '../services/store';

export function useERP() {
  const [state, setState] = useState<ERPState>(erpStore.getState());

  useEffect(() => {
    const unsubscribe = erpStore.subscribe(() => {
      setState({ ...erpStore.getState() });
    });
    return () => unsubscribe();
  }, []);

  return {
    state,
    store: erpStore,
    students: state.students,
    staff: state.staff,
    classes: state.classes,
    admissions: state.admissions,
    invoices: state.invoices,
    receipts: state.receipts,
    exams: state.exams,
    examMarks: state.examMarks,
    assignments: state.assignments,
    timetable: state.timetable,
    notices: state.notices,
    activities: state.activities,
    books: state.books,
    bookIssues: state.bookIssues,
    routes: state.routes,
    hostelRooms: state.hostelRooms,
    auditLogs: state.auditLogs,
    notifications: state.notifications,
    currentUser: state.currentUser,
    schoolProfile: state.schoolProfile,
    attendanceSummary: state.attendanceSummary,
    lastBackupDate: state.lastBackupDate,
    campuses: state.campuses,
    academicYears: state.academicYears,
    frontOfficeEnquiries: state.frontOfficeEnquiries,
    visitorLogs: state.visitorLogs,
    complaints: state.complaints,
    subjects: state.subjects,
    lessonPlans: state.lessonPlans,
    questions: state.questions,
    studyResources: state.studyResources,
    expenseVouchers: state.expenseVouchers,
    incomeRecords: state.incomeRecords,
    vendors: state.vendors,
    staffLeaves: state.staffLeaves,
    payrolls: state.payrolls,
    inventoryItems: state.inventoryItems,
    assets: state.assets,
    certificates: state.certificates,
    healthRecords: state.healthRecords,
    disciplineIncidents: state.disciplineIncidents,
    alumni: state.alumni,
    integrations: state.integrations,
    customModules: state.customModules,
    customFeatures: state.customFeatures,
    featureFlags: state.featureFlags,
    navigationConfig: state.navigationConfig,
    customFields: state.customFields,
    customFieldValues: state.customFieldValues,
    customForms: state.customForms,
    tableViews: state.tableViews,
    dashboardWidgets: state.dashboardWidgets,
    themes: state.themes,
    activeThemeId: state.activeThemeId,
    templates: state.templates,
    workflows: state.workflows,
    numberingConfigs: state.numberingConfigs,
    schoolBranding: state.schoolBranding,
    localization: state.localization,
    userPreferences: state.userPreferences,
    configSnapshots: state.configSnapshots,
    refreshStudentAttendanceAndEngagement: () => erpStore.refreshStudentAttendanceAndEngagement(),
  };
}
