import type { Role } from './auth';
export type { Role };
export * from './customization';
export * from './auth';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
export type FeeStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
export type AdmissionStatus = 'ENQUIRY' | 'APPLICATION' | 'VERIFICATION' | 'APPROVED' | 'ENROLLED' | 'REJECTED';
export type Gender = 'Male' | 'Female' | 'Other';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  verified: boolean;
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
  bloodGroup: string;
  classId: string;
  className: string;
  section: string;
  rollNo: number;
  parentName: string;
  parentRelationship: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  city: string;
  state: string;
  photoUrl?: string;
  feeStatus: FeeStatus;
  totalFees: number;
  paidFees: number;
  pendingAmount: number;
  attendancePercent: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'TRANSFERRED';
  enrollmentDate: string;
  documents: DocumentItem[];
  transportRouteId?: string;
  hostelRoomId?: string;
}

export interface Staff {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  department: string;
  designation: string;
  phone: string;
  email: string;
  qualification: string;
  joiningDate: string;
  salary: number;
  attendanceStatus: AttendanceStatus;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  address?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  classTeacher: string;
  roomNo: string;
  capacity: number;
  totalStudents: number;
  subjects: string[];
}

export interface Admission {
  id: string;
  applicationNo: string;
  studentName: string;
  gender: Gender;
  appliedClass: string;
  parentName: string;
  phone: string;
  email: string;
  applicationDate: string;
  status: AdmissionStatus;
  documentsVerified: boolean;
  remarks?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: FeeStatus;
  issueDate: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Cheque';
  paymentDate: string;
  cashierName: string;
  notes?: string;
}

export interface Exam {
  id: string;
  name: string;
  examType: 'Unit Test' | 'Mid-Term' | 'Final' | 'Quarterly';
  academicYear: string;
  startDate: string;
  endDate: string;
  classes: string[];
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED';
}

export interface ExamMark {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  subject: string;
  maxMarks: number;
  marksObtained: number;
  grade: string;
  resultStatus: 'PASS' | 'FAIL';
}

export interface Assignment {
  id: string;
  title: string;
  className: string;
  subject: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  submissionsCount: number;
  totalStudents: number;
}

export interface TimetableSlot {
  id: string;
  period: number;
  time: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  className: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  rackNo: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
}

export interface TransportRoute {
  id: string;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedCount: number;
  stops: string[];
  feePerMonth: number;
}

export interface HostelRoom {
  id: string;
  roomNo: string;
  block: string;
  floor: number;
  capacity: number;
  occupied: number;
  feePerTerm: number;
  wardenName: string;
}

export interface NoticeEvent {
  id: string;
  title: string;
  type: 'EVENT' | 'NOTICE' | 'EXAM' | 'HOLIDAY';
  dayMonth: string;
  date: string;
  time: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
}

export interface RecentActivity {
  id: string;
  type: 'ADMISSION' | 'FEE' | 'ATTENDANCE' | 'ASSIGNMENT' | 'EXAM' | 'SECURITY' | 'BACKUP' | 'PAYROLL' | 'HR' | 'INVENTORY';
  title: string;
  timestamp: string;
  module: string;
  iconColor: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: Role;
  action: string;
  module: string;
  entityId: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILURE';
  details: string;
}

export interface SchoolProfile {
  name: string;
  tagline: string;
  affiliationNo: string;
  principal: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  academicYear: string;
  currency: string;
}

export type NotificationCategory = 'ATTENDANCE' | 'FEE' | 'EXAM' | 'SYSTEM' | 'SECURITY' | 'HR' | 'OPERATIONS';
export type NotificationUrgency = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp?: number;
  read: boolean;
  status?: 'unread' | 'read' | 'resolved' | 'dismissed';
  type: 'info' | 'success' | 'warning' | 'error';
  urgency: NotificationUrgency;
  category: NotificationCategory;
  module: string;
  targetId?: string;
  targetAction?: string;
  data?: Record<string, any>;
  readBy?: string[];
  readAt?: string;
  resolvedAt?: string;
  actionRoute?: string;
}

// --- Multi-School & Multi-Campus Hierarchy ---
export interface Campus {
  id: string;
  name: string;
  code: string;
  city: string;
  principal: string;
  phone: string;
  email: string;
  isMain: boolean;
}

export interface AcademicYearConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'ARCHIVED' | 'UPCOMING';
}

// --- Front Office & Visitor Management ---
export interface FrontOfficeEnquiry {
  id: string;
  enquiryNo: string;
  candidateName: string;
  appliedClass: string;
  parentName: string;
  phone: string;
  email: string;
  source: 'Walk-in' | 'Online' | 'Phone Call' | 'Referral';
  status: 'New' | 'Contacted' | 'Follow-up' | 'Application' | 'Interview' | 'Approved' | 'Enrolled' | 'Rejected';
  date: string;
  followUpDate?: string;
  assignedTo: string;
  notes: string;
}

export interface VisitorLog {
  id: string;
  passNo: string;
  visitorName: string;
  phone: string;
  purpose: string;
  meetingWith: string;
  checkInTime: string;
  checkOutTime?: string;
  idProof: string;
  badgeIssued: boolean;
  status: 'IN_PREMISES' | 'CHECKED_OUT';
}

export interface Complaint {
  id: string;
  ticketNo: string;
  title: string;
  complainantName: string;
  complainantRole: 'Parent' | 'Student' | 'Staff' | 'Visitor';
  category: 'Academics' | 'Transport' | 'Hostel' | 'Fee/Accounts' | 'Infrastructure' | 'Behavior';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  date: string;
  assignedTo: string;
  status: 'PENDING' | 'IN_INVESTIGATION' | 'RESOLVED' | 'CLOSED';
  description: string;
  resolutionRemarks?: string;
}

// --- Academics & Question Bank ---
export interface Subject {
  id: string;
  code: string;
  name: string;
  type: 'THEORY' | 'PRACTICAL' | 'BOTH';
  department: string;
  classes: string[];
}

export interface LessonPlan {
  id: string;
  className: string;
  subject: string;
  topic: string;
  teacherName: string;
  periodsRequired: number;
  completionPercent: number;
  objectives: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  targetDate: string;
}

export interface QuestionItem {
  id: string;
  subject: string;
  topic: string;
  type: 'MCQ' | 'SHORT' | 'LONG';
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
}

export interface StudyResource {
  id: string;
  title: string;
  subject: string;
  className: string;
  fileType: 'PDF' | 'DOC' | 'VIDEO' | 'PRESENTATION';
  size: string;
  uploadDate: string;
  uploadedBy: string;
}

// --- Financial Management (Expenses & Incomes & Vendors) ---
export interface ExpenseVoucher {
  id: string;
  voucherNo: string;
  category: 'Utilities' | 'Maintenance' | 'Lab Supplies' | 'Sports' | 'Salaries' | 'Printing' | 'Events';
  payeeName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI';
  date: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED';
  approvedBy?: string;
  description: string;
}

export interface IncomeRecord {
  id: string;
  invoiceNo: string;
  source: 'Uniform Sales' | 'Bookstore' | 'Donations' | 'Event Sponsorship' | 'Cafeteria' | 'Facility Rent';
  amount: number;
  receivedFrom: string;
  date: string;
  paymentMethod: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  category: 'Stationery' | 'Lab Equipment' | 'IT & Hardware' | 'Uniforms' | 'Catering' | 'Maintenance';
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  status: 'ACTIVE' | 'INACTIVE';
  pendingPayment: number;
}

// --- HR, Leave & Payroll ---
export interface StaffLeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  leaveType: 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'DUTY';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedBy?: string;
  reviewRemarks?: string;
}

export interface PayrollRecord {
  id: string;
  slipNo: string;
  staffId: string;
  staffName: string;
  department: string;
  designation: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxDeducted: number;
  netSalary: number;
  paymentDate: string;
  paymentStatus: 'PAID' | 'PROCESSED' | 'PENDING';
  paymentMethod: 'Direct Deposit' | 'Bank Transfer' | 'Cheque';
}

// --- Inventory & Asset Management ---
export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'Stationery' | 'Laboratory' | 'Sports' | 'Furniture' | 'Electronics';
  unit: 'Pcs' | 'Boxes' | 'Kg' | 'Sets';
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
}

export interface AssetRecord {
  id: string;
  assetTag: string;
  name: string;
  category: 'IT Equipment' | 'Laboratory' | 'Furniture' | 'Classroom Tech' | 'Vehicle';
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  condition: 'EXCELLENT' | 'GOOD' | 'NEEDS_REPAIR' | 'DAMAGED';
  assignedTo?: string;
  warrantyExpiry: string;
}

// --- Student Welfare & Life ---
export interface CertificateRecord {
  id: string;
  certNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  type: 'Bonafide' | 'Transfer' | 'Character' | 'Study' | 'Sports Achievement';
  issueDate: string;
  issuedBy: string;
  purpose: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface HealthRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string;
  emergencyPhone: string;
  lastCheckupDate: string;
  vaccinationsStatus: 'COMPLETE' | 'PARTIAL' | 'PENDING_VERIFICATION';
  doctorNotes: string;
}

export interface DisciplineIncident {
  id: string;
  caseNo: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  incidentType: 'Late Coming' | 'Uniform Violation' | 'Misconduct' | 'Academic Dishonesty' | 'Vandalism';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
  reportedBy: string;
  actionTaken: string;
  parentNotified: boolean;
  status: 'OPEN' | 'RESOLVED' | 'UNDER_REVIEW';
}

export interface AlumniRecord {
  id: string;
  studentName: string;
  admissionNo: string;
  passingYear: number;
  degreeObtained?: string;
  higherEducation?: string;
  currentOccupation: string;
  companyOrCollege: string;
  phone: string;
  email: string;
  city: string;
  willingToMentor: boolean;
}

// --- Integrations Hub ---
export interface IntegrationServiceConfig {
  id: string;
  name: string;
  type: 'WHATSAPP' | 'SMS' | 'BIOMETRIC' | 'PAYMENT_GATEWAY' | 'GPS' | 'TALLY';
  status: 'CONNECTED' | 'DISCONNECTED' | 'NEEDS_CONFIGURATION';
  provider: string;
  lastPing: string;
  description: string;
  endpointOrKeyMasked: string;
}
