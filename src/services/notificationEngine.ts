import { AppNotification, NotificationCategory, NotificationUrgency } from '../types';
import { ERPState, erpStore } from './store';
import { soundManager } from './notificationAudio';

export interface ToastItem {
  id: string;
  notification: AppNotification;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class NotificationEngine {
  private activeToasts: ToastItem[] = [];
  private listeners: ToastListener[] = [];
  private hasPerformedInitialScan = false;

  constructor() {
    // Listen to store updates
    erpStore.subscribe(() => {
      // Keep tracking
    });
  }

  public subscribeToasts(listener: ToastListener): () => void {
    this.listeners.push(listener);
    listener([...this.activeToasts]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyToasts() {
    this.listeners.forEach(l => l([...this.activeToasts]));
  }

  public dismissToast(toastId: string) {
    this.activeToasts = this.activeToasts.filter(t => t.id !== toastId);
    this.notifyToasts();
  }

  public pushToast(notification: AppNotification) {
    const toast: ToastItem = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      notification,
      createdAt: Date.now()
    };

    // Keep max 3 toasts visible at once
    this.activeToasts = [toast, ...this.activeToasts.slice(0, 2)];
    this.notifyToasts();

    // Play subtle audio tone
    soundManager.playAlertChime(notification.urgency);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      this.dismissToast(toast.id);
    }, 6000);
  }

  /**
   * Scans state for:
   * 1. Low Attendance (< 75%)
   * 2. Fee Payment Reminders (Overdue or Due soon)
   * 3. Upcoming Exam Deadlines
   */
  public runDiagnosticScan(triggerToast: boolean = true): {
    attendanceAlerts: number;
    feeAlerts: number;
    examAlerts: number;
    totalGenerated: number;
  } {
    const state = erpStore.getState();
    const existing = state.notifications;
    const newNotifications: AppNotification[] = [];

    // --- 1. Scan Low Attendance ---
    const lowAttendanceStudents = state.students.filter(s => s.attendancePercent < 75);
    lowAttendanceStudents.forEach(st => {
      const alertId = `notif-att-${st.id}`;
      // Check if already notified
      const alreadyExists = existing.some(n => n.id === alertId || (n.category === 'ATTENDANCE' && n.targetId === st.id));
      if (!alreadyExists) {
        const notif: AppNotification = {
          id: alertId,
          title: `Low Attendance: ${st.firstName} ${st.lastName} (${st.attendancePercent}%)`,
          message: `Scholar in ${st.className} (${st.section}) attendance has fallen to ${st.attendancePercent}% (below mandatory 75% CBSE threshold). Guardian: ${st.parentName} (${st.parentPhone}).`,
          time: 'Just now',
          timestamp: Date.now(),
          read: false,
          type: st.attendancePercent < 70 ? 'error' : 'warning',
          urgency: st.attendancePercent < 70 ? 'CRITICAL' : 'WARNING',
          category: 'ATTENDANCE',
          module: 'Attendance',
          targetId: st.id,
          targetAction: 'view_student'
        };
        newNotifications.push(notif);
      }
    });

    // --- 2. Scan Fee Payment Reminders ---
    const overdueInvoices = state.invoices.filter(i => i.status === 'OVERDUE' || (i.balance > 0 && i.status !== 'PAID'));
    overdueInvoices.slice(0, 3).forEach(inv => {
      const alertId = `notif-fee-${inv.id}`;
      const alreadyExists = existing.some(n => n.id === alertId || (n.category === 'FEE' && n.targetId === inv.id));
      if (!alreadyExists) {
        const isOverdue = inv.status === 'OVERDUE';
        const notif: AppNotification = {
          id: alertId,
          title: `${isOverdue ? 'Overdue Fee Notice' : 'Pending Fee Reminder'}: ${inv.invoiceNo}`,
          message: `Invoice for ${inv.studentName} (${inv.className}) has pending balance of ₹${inv.balance.toLocaleString('en-IN')}. Due date: ${inv.dueDate}.`,
          time: 'Just now',
          timestamp: Date.now(),
          read: false,
          type: isOverdue ? 'error' : 'warning',
          urgency: isOverdue ? 'CRITICAL' : 'WARNING',
          category: 'FEE',
          module: 'Fees',
          targetId: inv.id,
          targetAction: 'view_invoice'
        };
        newNotifications.push(notif);
      }
    });

    // --- 3. Scan Upcoming Exam Deadlines ---
    const upcomingExams = state.exams.filter(e => e.status === 'UPCOMING');
    upcomingExams.forEach(exam => {
      const alertId = `notif-exam-${exam.id}`;
      const alreadyExists = existing.some(n => n.id === alertId || (n.category === 'EXAM' && n.targetId === exam.id));
      if (!alreadyExists) {
        const notif: AppNotification = {
          id: alertId,
          title: `Upcoming Exam Deadline: ${exam.name}`,
          message: `Scheduled to commence on ${exam.startDate}. Applicable to grades: ${exam.classes.join(', ')}. Review timetable and verify hall tickets.`,
          time: 'Just now',
          timestamp: Date.now(),
          read: false,
          type: 'warning',
          urgency: 'WARNING',
          category: 'EXAM',
          module: 'Examinations',
          targetId: exam.id,
          targetAction: 'view_exam'
        };
        newNotifications.push(notif);
      }
    });

    // Add them to store if any found
    if (newNotifications.length > 0) {
      newNotifications.forEach(n => {
        erpStore.addDetailedNotification(n);
        if (triggerToast) {
          this.pushToast(n);
        }
      });
    }

    const counts = {
      attendanceAlerts: lowAttendanceStudents.length,
      feeAlerts: overdueInvoices.length,
      examAlerts: upcomingExams.length,
      totalGenerated: newNotifications.length
    };

    return counts;
  }

  // --- Real-Time Simulation Triggers for User Demos ---
  public simulateLowAttendanceAlert() {
    const state = erpStore.getState();
    const student = state.students[Math.floor(Math.random() * state.students.length)] || state.students[0];
    const dropPercent = (62 + Math.floor(Math.random() * 10)).toFixed(1);

    const notif: AppNotification = {
      id: `sim-att-${Date.now()}`,
      title: `⚡ Live Alert: Low Attendance (${student.firstName} ${student.lastName})`,
      message: `Biometric turnstile check logged 3 consecutive unexcused absences. Attendance dropped to ${dropPercent}%. Mandatory warning notice dispatched.`,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      type: 'error',
      urgency: 'CRITICAL',
      category: 'ATTENDANCE',
      module: 'Attendance',
      targetId: student.id,
      targetAction: 'view_student'
    };

    erpStore.addDetailedNotification(notif);
    this.pushToast(notif);
  }

  public simulateFeeOverdueAlert() {
    const state = erpStore.getState();
    const inv = state.invoices[Math.floor(Math.random() * state.invoices.length)] || state.invoices[0];
    const amount = inv.balance > 0 ? inv.balance : 32000;

    const notif: AppNotification = {
      id: `sim-fee-${Date.now()}`,
      title: `⚡ Payment Gateway: Overdue Reminder (${inv.studentName})`,
      message: `Automated banking reconciliation detected overdue Term fee of ₹${amount.toLocaleString('en-IN')} for ${inv.studentName} (${inv.className}).`,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      type: 'warning',
      urgency: 'CRITICAL',
      category: 'FEE',
      module: 'Fees',
      targetId: inv.id,
      targetAction: 'view_invoice'
    };

    erpStore.addDetailedNotification(notif);
    this.pushToast(notif);
  }

  public simulateExamDeadlineAlert() {
    const notif: AppNotification = {
      id: `sim-exam-${Date.now()}`,
      title: `⚡ CBSE Board Directive: Practical Marks Cutoff`,
      message: `Final deadline for submitting Class 10 & 12 internal assessment marks closes in 48 hours. 6 teacher rosters pending review.`,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      type: 'warning',
      urgency: 'WARNING',
      category: 'EXAM',
      module: 'Examinations',
      targetId: 'exam-001',
      targetAction: 'view_exam'
    };

    erpStore.addDetailedNotification(notif);
    this.pushToast(notif);
  }
}

export const notificationEngine = new NotificationEngine();
