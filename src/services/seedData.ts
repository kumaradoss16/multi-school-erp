import { 
  Student, Staff, ClassInfo, Admission, FeeInvoice, PaymentReceipt, 
  Exam, ExamMark, Assignment, TimetableSlot, Book, BookIssue, 
  TransportRoute, HostelRoom, NoticeEvent, RecentActivity, AuditLog, 
  SchoolProfile, Campus, AcademicYearConfig, FrontOfficeEnquiry, VisitorLog, 
  Complaint, Subject, LessonPlan, QuestionItem, StudyResource, ExpenseVoucher, 
  IncomeRecord, Vendor, StaffLeaveRequest, PayrollRecord, InventoryItem, 
  AssetRecord, CertificateRecord, HealthRecord, DisciplineIncident, AlumniRecord, 
  IntegrationServiceConfig 
} from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'Delhi Public International School',
  tagline: 'Smart Education, Better Tomorrow',
  affiliationNo: 'CBSE-AFF/2025/98214',
  principal: 'Dr. Rajeshwar Sharma, Ph.D.',
  phone: '+91 11 2894 7700',
  email: 'admin@schoolerp.edu.in',
  website: 'https://schoolerp.internal',
  address: 'Sector 14, Institutional Area, New Delhi - 110001',
  academicYear: '2024-2025',
  currency: '₹',
};

export const initialClasses: ClassInfo[] = [
  { id: 'c1', name: 'Class 10', section: 'A', classTeacher: 'Mr. Arvind Verma', roomNo: 'Room 301', capacity: 55, totalStudents: 52, subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer'] },
  { id: 'c2', name: 'Class 10', section: 'B', classTeacher: 'Ms. Meenakshi Iyer', roomNo: 'Room 302', capacity: 55, totalStudents: 50, subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer'] },
  { id: 'c3', name: 'Class 9', section: 'A', classTeacher: 'Dr. Suresh Kumar', roomNo: 'Room 205', capacity: 55, totalStudents: 54, subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer'] },
  { id: 'c4', name: 'Class 9', section: 'B', classTeacher: 'Mrs. Neha Gupta', roomNo: 'Room 206', capacity: 55, totalStudents: 53, subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer'] },
  { id: 'c5', name: 'Class 8', section: 'A', classTeacher: 'Mr. Vikas Reddy', roomNo: 'Room 201', capacity: 55, totalStudents: 51, subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'] },
  { id: 'c6', name: 'Class 8', section: 'B', classTeacher: 'Ms. Priya Sen', roomNo: 'Room 202', capacity: 55, totalStudents: 52, subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'] },
  { id: 'c7', name: 'Class 7', section: 'A', classTeacher: 'Mr. Rajesh Nair', roomNo: 'Room 101', capacity: 50, totalStudents: 49, subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'] },
  { id: 'c8', name: 'Class 7', section: 'B', classTeacher: 'Ms. Sunita Rao', roomNo: 'Room 102', capacity: 50, totalStudents: 48, subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'] },
  { id: 'c9', name: 'Class 6', section: 'A', classTeacher: 'Mrs. Kavita Joshi', roomNo: 'Room 103', capacity: 50, totalStudents: 50, subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'] },
  { id: 'c10', name: 'Class 6', section: 'B', classTeacher: 'Mr. Amit Trivedi', roomNo: 'Room 104', capacity: 50, totalStudents: 49, subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'] },
  { id: 'c11', name: 'Class 11', section: 'Sci', classTeacher: 'Dr. H. P. Mukherji', roomNo: 'Lab 4', capacity: 60, totalStudents: 58, subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'] },
  { id: 'c12', name: 'Class 11', section: 'Comm', classTeacher: 'Ms. Ritu Agarwal', roomNo: 'Room 401', capacity: 60, totalStudents: 56, subjects: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Applied Math'] },
  { id: 'c13', name: 'Class 12', section: 'Sci', classTeacher: 'Prof. S. K. Bose', roomNo: 'Lab 5', capacity: 60, totalStudents: 57, subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'] },
  { id: 'c14', name: 'Class 12', section: 'Comm', classTeacher: 'Mr. Deepak Malhotra', roomNo: 'Room 402', capacity: 60, totalStudents: 55, subjects: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Applied Math'] },
];

export const initialStudents: Student[] = [
  {
    id: 's-1001',
    admissionNo: 'ADM-2024-001',
    firstName: 'Rohan',
    lastName: 'Sharma',
    gender: 'Male',
    dob: '2009-04-12',
    bloodGroup: 'B+',
    classId: 'c1',
    className: 'Class 10',
    section: 'A',
    rollNo: 1,
    parentName: 'Vikram Sharma',
    parentRelationship: 'Father',
    parentPhone: '+91 98112 34567',
    parentEmail: 'vikram.sharma@example.com',
    address: 'B-42, Gulmohar Enclave, South Extension',
    city: 'New Delhi',
    state: 'Delhi',
    feeStatus: 'PAID',
    totalFees: 45000,
    paidFees: 45000,
    pendingAmount: 0,
    attendancePercent: 96,
    status: 'ACTIVE',
    enrollmentDate: '2024-04-02',
    documents: [
      { id: 'd1', name: 'Birth Certificate.pdf', type: 'PDF', uploadedAt: '2024-04-02', verified: true },
      { id: 'd2', name: 'Previous School Marksheet.pdf', type: 'PDF', uploadedAt: '2024-04-02', verified: true }
    ]
  },
  {
    id: 's-1002',
    admissionNo: 'ADM-2024-002',
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    gender: 'Female',
    dob: '2009-08-25',
    bloodGroup: 'O+',
    classId: 'c1',
    className: 'Class 10',
    section: 'A',
    rollNo: 2,
    parentName: 'Sanjay Deshmukh',
    parentRelationship: 'Father',
    parentPhone: '+91 98115 67890',
    parentEmail: 'sanjay.d@example.com',
    address: 'Flat 304, Green Heights, Vasant Kunj',
    city: 'New Delhi',
    state: 'Delhi',
    feeStatus: 'PARTIAL',
    totalFees: 45000,
    paidFees: 30000,
    pendingAmount: 15000,
    attendancePercent: 94,
    status: 'ACTIVE',
    enrollmentDate: '2024-04-05',
    documents: [
      { id: 'd3', name: 'Aadhaar Card Copy.pdf', type: 'PDF', uploadedAt: '2024-04-05', verified: true }
    ]
  },
  {
    id: 's-1003',
    admissionNo: 'ADM-2024-003',
    firstName: 'Aarav',
    lastName: 'Patel',
    gender: 'Male',
    dob: '2010-01-14',
    bloodGroup: 'A+',
    classId: 'c4',
    className: 'Class 9',
    section: 'B',
    rollNo: 1,
    parentName: 'Mahesh Patel',
    parentRelationship: 'Father',
    parentPhone: '+91 98220 12345',
    parentEmail: 'mahesh.patel@example.com',
    address: 'House 18, Mayur Vihar Phase II',
    city: 'Delhi',
    state: 'Delhi',
    feeStatus: 'PENDING',
    totalFees: 42000,
    paidFees: 12000,
    pendingAmount: 30000,
    attendancePercent: 91,
    status: 'ACTIVE',
    enrollmentDate: '2024-04-10',
    documents: [
      { id: 'd4', name: 'Transfer Certificate.pdf', type: 'PDF', uploadedAt: '2024-04-10', verified: true }
    ]
  },
  {
    id: 's-1004',
    admissionNo: 'ADM-2024-004',
    firstName: 'Diya',
    lastName: 'Choudhury',
    gender: 'Female',
    dob: '2009-11-30',
    bloodGroup: 'AB+',
    classId: 'c2',
    className: 'Class 10',
    section: 'B',
    rollNo: 3,
    parentName: 'Debabrata Choudhury',
    parentRelationship: 'Father',
    parentPhone: '+91 97118 90123',
    parentEmail: 'debabrata.c@example.com',
    address: 'C-90, Saket, Press Enclave Road',
    city: 'New Delhi',
    state: 'Delhi',
    feeStatus: 'OVERDUE',
    totalFees: 45000,
    paidFees: 15000,
    pendingAmount: 30000,
    attendancePercent: 88,
    status: 'ACTIVE',
    enrollmentDate: '2024-04-12',
    documents: []
  },
  {
    id: 's-1005',
    admissionNo: 'ADM-2024-005',
    firstName: 'Kabir',
    lastName: 'Malik',
    gender: 'Male',
    dob: '2008-05-18',
    bloodGroup: 'O-',
    classId: 'c11',
    className: 'Class 11',
    section: 'Sci',
    rollNo: 4,
    parentName: 'Sameer Malik',
    parentRelationship: 'Father',
    parentPhone: '+91 98110 54321',
    parentEmail: 'sameer.m@example.com',
    address: '12-A, Defence Colony',
    city: 'New Delhi',
    state: 'Delhi',
    feeStatus: 'PAID',
    totalFees: 52000,
    paidFees: 52000,
    pendingAmount: 0,
    attendancePercent: 98,
    status: 'ACTIVE',
    enrollmentDate: '2024-04-03',
    documents: []
  },
  {
    id: 's-1006',
    admissionNo: 'ADM-2024-006',
    firstName: 'Sara',
    lastName: 'Khan',
    gender: 'Female',
    dob: '2010-09-02',
    bloodGroup: 'B+',
    classId: 'c3',
    className: 'Class 9',
    section: 'A',
    rollNo: 5,
    parentName: 'Farhan Khan',
    parentRelationship: 'Father',
    parentPhone: '+91 99104 33221',
    parentEmail: 'farhan.k@example.com',
    address: 'House 5, Hauz Khas Enclave',
    city: 'New Delhi',
    state: 'Delhi',
    feeStatus: 'PAID',
    totalFees: 42000,
    paidFees: 42000,
    pendingAmount: 0,
    attendancePercent: 95,
    status: 'ACTIVE',
    enrollmentDate: '2024-04-08',
    documents: []
  }
];

export const initialStaff: Staff[] = [
  {
    id: 'st-01',
    empId: 'EMP-0101',
    firstName: 'Arvind',
    lastName: 'Verma',
    gender: 'Male',
    department: 'Mathematics',
    designation: 'Senior PGT Teacher',
    phone: '+91 98101 22334',
    email: 'arvind.verma@schoolerp.edu.in',
    qualification: 'M.Sc. Mathematics, B.Ed',
    joiningDate: '2018-07-15',
    salary: 68000,
    attendanceStatus: 'PRESENT',
    status: 'ACTIVE'
  },
  {
    id: 'st-02',
    empId: 'EMP-0102',
    firstName: 'Meenakshi',
    lastName: 'Iyer',
    gender: 'Female',
    department: 'English',
    designation: 'HOD English',
    phone: '+91 98102 33445',
    email: 'meenakshi.iyer@schoolerp.edu.in',
    qualification: 'M.A. English Literature, M.Phil',
    joiningDate: '2016-04-10',
    salary: 74000,
    attendanceStatus: 'PRESENT',
    status: 'ACTIVE'
  },
  {
    id: 'st-03',
    empId: 'EMP-0103',
    firstName: 'Dr. Suresh',
    lastName: 'Kumar',
    gender: 'Male',
    department: 'Science',
    designation: 'PGT Physics',
    phone: '+91 98103 44556',
    email: 'suresh.kumar@schoolerp.edu.in',
    qualification: 'Ph.D. Applied Physics',
    joiningDate: '2019-06-20',
    salary: 71000,
    attendanceStatus: 'PRESENT',
    status: 'ACTIVE'
  },
  {
    id: 'st-04',
    empId: 'EMP-0104',
    firstName: 'Pooja',
    lastName: 'Bansal',
    gender: 'Female',
    department: 'Accounts',
    designation: 'Chief Accountant',
    phone: '+91 98104 55667',
    email: 'pooja.bansal@schoolerp.edu.in',
    qualification: 'M.Com, CA-Inter',
    joiningDate: '2020-02-01',
    salary: 62000,
    attendanceStatus: 'PRESENT',
    status: 'ACTIVE'
  },
  {
    id: 'st-05',
    empId: 'EMP-0105',
    firstName: 'Ramesh',
    lastName: 'Chand',
    gender: 'Male',
    department: 'Library',
    designation: 'Senior Librarian',
    phone: '+91 98105 66778',
    email: 'ramesh.chand@schoolerp.edu.in',
    qualification: 'M.Lib.Sc.',
    joiningDate: '2017-09-01',
    salary: 54000,
    attendanceStatus: 'PRESENT',
    status: 'ACTIVE'
  }
];

export const initialAdmissions: Admission[] = [
  {
    id: 'adm-01',
    applicationNo: 'APP-2025-1042',
    studentName: 'Rohan Sharma',
    gender: 'Male',
    appliedClass: 'Class 10',
    parentName: 'Vikram Sharma',
    phone: '+91 98112 34567',
    email: 'vikram.sharma@example.com',
    applicationDate: '2025-04-28',
    status: 'APPROVED',
    documentsVerified: true,
    remarks: 'Entrance test cleared with 92% marks'
  },
  {
    id: 'adm-02',
    applicationNo: 'APP-2025-1043',
    studentName: 'Tanya Sengupta',
    gender: 'Female',
    appliedClass: 'Class 9',
    parentName: 'Amit Sengupta',
    phone: '+91 98113 44556',
    email: 'amit.sengupta@example.com',
    applicationDate: '2025-04-27',
    status: 'APPLICATION',
    documentsVerified: false,
    remarks: 'Awaiting previous school transfer certificate'
  },
  {
    id: 'adm-03',
    applicationNo: 'APP-2025-1044',
    studentName: 'Kunal Kapoor',
    gender: 'Male',
    appliedClass: 'Class 11',
    parentName: 'Rajesh Kapoor',
    phone: '+91 98114 55667',
    email: 'rajesh.kapoor@example.com',
    applicationDate: '2025-04-26',
    status: 'VERIFICATION',
    documentsVerified: true,
    remarks: 'Science stream requested, marksheet verified'
  }
];

export const initialInvoices: FeeInvoice[] = [
  {
    id: 'inv-101',
    invoiceNo: 'INV-2025-001',
    studentId: 's-1002',
    studentName: 'Ananya Deshmukh',
    admissionNo: 'ADM-2024-002',
    className: 'Class 10 (A)',
    feeType: 'Term 1 Tuition & Lab Fee',
    totalAmount: 45000,
    paidAmount: 30000,
    balance: 15000,
    dueDate: '2025-05-05',
    status: 'PARTIAL',
    issueDate: '2025-04-01'
  },
  {
    id: 'inv-102',
    invoiceNo: 'INV-2025-002',
    studentId: 's-1003',
    studentName: 'Aarav Patel',
    admissionNo: 'ADM-2024-003',
    className: 'Class 9 (B)',
    feeType: 'Term 1 Tuition Fee',
    totalAmount: 42000,
    paidAmount: 12000,
    balance: 30000,
    dueDate: '2025-05-05',
    status: 'PENDING',
    issueDate: '2025-04-01'
  },
  {
    id: 'inv-103',
    invoiceNo: 'INV-2025-003',
    studentId: 's-1004',
    studentName: 'Diya Choudhury',
    admissionNo: 'ADM-2024-004',
    className: 'Class 10 (B)',
    feeType: 'Annual Infrastructure & Activity Fee',
    totalAmount: 45000,
    paidAmount: 15000,
    balance: 30000,
    dueDate: '2025-04-15',
    status: 'OVERDUE',
    issueDate: '2025-03-15'
  },
  {
    id: 'inv-104',
    invoiceNo: 'INV-2025-004',
    studentId: 's-1001',
    studentName: 'Rohan Sharma',
    admissionNo: 'ADM-2024-001',
    className: 'Class 10 (A)',
    feeType: 'Term 1 Full Payment',
    totalAmount: 45000,
    paidAmount: 45000,
    balance: 0,
    dueDate: '2025-05-05',
    status: 'PAID',
    issueDate: '2025-04-01'
  }
];

export const initialReceipts: PaymentReceipt[] = [
  {
    id: 'rcp-501',
    receiptNo: 'RCP-2025-089',
    invoiceId: 'inv-104',
    studentId: 's-1001',
    studentName: 'Rohan Sharma',
    admissionNo: 'ADM-2024-001',
    amount: 5000,
    paymentMethod: 'UPI',
    paymentDate: '2025-04-28 09:48 AM',
    cashierName: 'Pooja Bansal',
    notes: 'Online transaction ref: UPI/5129384729'
  },
  {
    id: 'rcp-502',
    receiptNo: 'RCP-2025-088',
    invoiceId: 'inv-101',
    studentId: 's-1002',
    studentName: 'Ananya Deshmukh',
    admissionNo: 'ADM-2024-002',
    amount: 15000,
    paymentMethod: 'Card',
    paymentDate: '2025-04-20 11:15 AM',
    cashierName: 'Pooja Bansal',
    notes: 'POS auth: 984321'
  }
];

export const initialExams: Exam[] = [
  {
    id: 'ex-01',
    name: 'Unit Test 1 (Class 10)',
    examType: 'Unit Test',
    academicYear: '2024-2025',
    startDate: '2025-04-30',
    endDate: '2025-05-06',
    classes: ['Class 10 (A)', 'Class 10 (B)'],
    status: 'UPCOMING'
  },
  {
    id: 'ex-02',
    name: 'Class 9 Annual Examination',
    examType: 'Final',
    academicYear: '2024-2025',
    startDate: '2025-04-10',
    endDate: '2025-04-22',
    classes: ['Class 9 (A)', 'Class 9 (B)'],
    status: 'PUBLISHED'
  }
];

export const initialExamMarks: ExamMark[] = [
  {
    id: 'em-1',
    examId: 'ex-02',
    studentId: 's-1003',
    studentName: 'Aarav Patel',
    admissionNo: 'ADM-2024-003',
    className: 'Class 9 (B)',
    subject: 'Mathematics',
    maxMarks: 100,
    marksObtained: 94,
    grade: 'A+',
    resultStatus: 'PASS'
  },
  {
    id: 'em-2',
    examId: 'ex-02',
    studentId: 's-1003',
    studentName: 'Aarav Patel',
    admissionNo: 'ADM-2024-003',
    className: 'Class 9 (B)',
    subject: 'Science',
    maxMarks: 100,
    marksObtained: 88,
    grade: 'A',
    resultStatus: 'PASS'
  },
  {
    id: 'em-3',
    examId: 'ex-02',
    studentId: 's-1003',
    studentName: 'Aarav Patel',
    admissionNo: 'ADM-2024-003',
    className: 'Class 9 (B)',
    subject: 'English',
    maxMarks: 100,
    marksObtained: 85,
    grade: 'A',
    resultStatus: 'PASS'
  },
  {
    id: 'em-4',
    examId: 'ex-02',
    studentId: 's-1006',
    studentName: 'Sara Khan',
    admissionNo: 'ADM-2024-006',
    className: 'Class 9 (A)',
    subject: 'Mathematics',
    maxMarks: 100,
    marksObtained: 98,
    grade: 'A+',
    resultStatus: 'PASS'
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-01',
    title: 'Trigonometry & Quadratic Identities',
    className: 'Class 10 (A)',
    subject: 'Mathematics',
    teacherName: 'Mr. Arvind Verma',
    assignedDate: '2025-04-28',
    dueDate: '2025-05-03',
    maxMarks: 25,
    description: 'Solve problem set 4.2 from textbook and submit step-by-step proofs.',
    submissionsCount: 38,
    totalStudents: 52
  },
  {
    id: 'asg-02',
    title: 'Essay on Renewable Energy Technologies',
    className: 'Class 9 (B)',
    subject: 'Science',
    teacherName: 'Dr. Suresh Kumar',
    assignedDate: '2025-04-27',
    dueDate: '2025-05-04',
    maxMarks: 20,
    description: '1000-word structured report on solar and green hydrogen technologies.',
    submissionsCount: 45,
    totalStudents: 53
  }
];

export const initialTimetable: TimetableSlot[] = [
  { id: 't1', period: 1, time: '08:00 - 08:45', day: 'Monday', className: 'Class 10 (A)', subject: 'Mathematics', teacherName: 'Mr. Arvind Verma', room: 'Room 301' },
  { id: 't2', period: 1, time: '08:00 - 08:45', day: 'Monday', className: 'Class 9 (B)', subject: 'English', teacherName: 'Ms. Meenakshi Iyer', room: 'Room 206' },
  { id: 't3', period: 2, time: '08:45 - 09:30', day: 'Monday', className: 'Class 10 (A)', subject: 'English', teacherName: 'Ms. Meenakshi Iyer', room: 'Room 301' },
  { id: 't4', period: 2, time: '08:45 - 09:30', day: 'Monday', className: 'Class 9 (B)', subject: 'Science', teacherName: 'Dr. Suresh Kumar', room: 'Room 206' },
  { id: 't5', period: 3, time: '09:45 - 10:30', day: 'Monday', className: 'Class 10 (A)', subject: 'Science', teacherName: 'Dr. Suresh Kumar', room: 'Room 301' },
  { id: 't6', period: 3, time: '09:45 - 10:30', day: 'Monday', className: 'Class 9 (B)', subject: 'Mathematics', teacherName: 'Mr. Arvind Verma', room: 'Room 206' },
  { id: 't7', period: 4, time: '10:30 - 11:15', day: 'Monday', className: 'Class 10 (A)', subject: 'Social Science', teacherName: 'Mrs. Neha Gupta', room: 'Room 301' },
  { id: 't8', period: 4, time: '10:30 - 11:15', day: 'Monday', className: 'Class 9 (B)', subject: 'Hindi', teacherName: 'Ms. Sunita Rao', room: 'Room 206' },
  { id: 't9', period: 5, time: '11:30 - 12:15', day: 'Monday', className: 'Class 10 (A)', subject: 'Hindi', teacherName: 'Ms. Sunita Rao', room: 'Room 301' },
  { id: 't10', period: 5, time: '11:30 - 12:15', day: 'Monday', className: 'Class 9 (B)', subject: 'Social Science', teacherName: 'Mrs. Neha Gupta', room: 'Room 206' },
  { id: 't11', period: 6, time: '12:15 - 01:00', day: 'Monday', className: 'Class 10 (A)', subject: 'Computer', teacherName: 'Mr. Amit Trivedi', room: 'Computer Lab 1' },
  { id: 't12', period: 6, time: '12:15 - 01:00', day: 'Monday', className: 'Class 9 (B)', subject: 'Computer', teacherName: 'Mr. Amit Trivedi', room: 'Computer Lab 2' }
];

export const initialNotices: NoticeEvent[] = [
  {
    id: 'n1',
    title: 'Parent-Teacher Meeting',
    type: 'EVENT',
    dayMonth: '29 APR',
    date: '2025-04-29',
    time: '10:00 AM - 01:00 PM',
    description: 'Mandatory review session for Class 9 and Class 10 term progress.',
    priority: 'HIGH'
  },
  {
    id: 'n2',
    title: 'Unit Test - Class 10',
    type: 'EXAM',
    dayMonth: '30 APR',
    date: '2025-04-30',
    time: '09:00 AM - 11:00 AM',
    description: 'Mathematics and Science unit evaluations in respective classrooms.',
    priority: 'HIGH'
  },
  {
    id: 'n3',
    title: 'School Annual Function',
    type: 'EVENT',
    dayMonth: '02 MAY',
    date: '2025-05-02',
    time: '09:00 AM - 05:00 PM',
    description: 'Cultural dance performances, scientific model exhibits, and sports awards.',
    priority: 'MEDIUM'
  },
  {
    id: 'n4',
    title: 'Fee Payment Deadline',
    type: 'NOTICE',
    dayMonth: '05 MAY',
    date: '2025-05-05',
    time: 'Last date to pay fees',
    description: 'All pending term installments must be cleared to avoid late charge fees.',
    priority: 'HIGH'
  }
];

export const initialActivities: RecentActivity[] = [
  {
    id: 'act-1',
    type: 'ADMISSION',
    title: 'New admission received - Rohan Sharma',
    timestamp: 'Today, 10:15 AM',
    module: 'Admissions',
    iconColor: '#3b82f6'
  },
  {
    id: 'act-2',
    type: 'FEE',
    title: 'Fee payment received - ₹5,000',
    timestamp: 'Today, 09:48 AM',
    module: 'Fees',
    iconColor: '#10b981'
  },
  {
    id: 'act-3',
    type: 'ATTENDANCE',
    title: 'Attendance marked - Class 10 (A)',
    timestamp: 'Today, 09:30 AM',
    module: 'Attendance',
    iconColor: '#f59e0b'
  },
  {
    id: 'act-4',
    type: 'ASSIGNMENT',
    title: 'New assignment posted - Mathematics',
    timestamp: 'Today, 08:50 AM',
    module: 'Assignments',
    iconColor: '#6366f1'
  },
  {
    id: 'act-5',
    type: 'EXAM',
    title: 'Exam result published - Class 9',
    timestamp: 'Yesterday, 04:25 PM',
    module: 'Examinations',
    iconColor: '#f97316'
  }
];

export const initialBooks: Book[] = [
  { id: 'b1', isbn: '978-0131103627', title: 'The C Programming Language', author: 'Brian Kernighan & Dennis Ritchie', category: 'Computer Science', totalCopies: 15, availableCopies: 11, rackNo: 'CS-04' },
  { id: 'b2', isbn: '978-0201896831', title: 'The Art of Computer Programming', author: 'Donald Knuth', category: 'Computer Science', totalCopies: 8, availableCopies: 5, rackNo: 'CS-01' },
  { id: 'b3', isbn: '978-0062316097', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History', totalCopies: 20, availableCopies: 16, rackNo: 'HIST-02' },
  { id: 'b4', isbn: '978-0140449136', title: 'The Odyssey', author: 'Homer', category: 'Literature', totalCopies: 25, availableCopies: 22, rackNo: 'LIT-08' },
  { id: 'b5', isbn: '978-0486600889', title: 'Principles of Quantum Mechanics', author: 'P. A. M. Dirac', category: 'Physics', totalCopies: 10, availableCopies: 8, rackNo: 'PHY-03' }
];

export const initialBookIssues: BookIssue[] = [
  {
    id: 'bi-1',
    bookId: 'b1',
    bookTitle: 'The C Programming Language',
    studentId: 's-1001',
    studentName: 'Rohan Sharma',
    issueDate: '2025-04-15',
    dueDate: '2025-04-29',
    fineAmount: 0,
    status: 'ISSUED'
  },
  {
    id: 'bi-2',
    bookId: 'b3',
    bookTitle: 'Sapiens: A Brief History of Humankind',
    studentId: 's-1002',
    studentName: 'Ananya Deshmukh',
    issueDate: '2025-04-05',
    dueDate: '2025-04-19',
    returnDate: '2025-04-18',
    fineAmount: 0,
    status: 'RETURNED'
  }
];

export const initialRoutes: TransportRoute[] = [
  { id: 'r1', routeName: 'Route 1 - South Delhi Expressway', vehicleNo: 'DL-1PB-4512', driverName: 'Satish Pal', driverPhone: '+91 98911 22334', capacity: 42, assignedCount: 38, stops: ['Lajpat Nagar', 'Defence Colony', 'South Ex', 'AIIMS', 'Vasant Kunj'], feePerMonth: 3200 },
  { id: 'r2', routeName: 'Route 2 - Noida Express Corridor', vehicleNo: 'UP-16-BD-8901', driverName: 'Gurmeet Singh', driverPhone: '+91 98911 44556', capacity: 42, assignedCount: 40, stops: ['Sector 18', 'Sector 62', 'Mayur Vihar Phase 1', 'Akshardham'], feePerMonth: 3500 },
  { id: 'r3', routeName: 'Route 3 - West Delhi Metro Link', vehicleNo: 'DL-1PC-7788', driverName: 'Manoj Yadav', driverPhone: '+91 98911 66778', capacity: 36, assignedCount: 32, stops: ['Janakpuri', 'Rajouri Garden', 'Kirti Nagar', 'Karol Bagh'], feePerMonth: 3000 }
];

export const initialHostelRooms: HostelRoom[] = [
  { id: 'h1', roomNo: 'A-101', block: 'Boys Hostel Wing A', floor: 1, capacity: 3, occupied: 3, feePerTerm: 45000, wardenName: 'Mr. Baldev Raj' },
  { id: 'h2', roomNo: 'A-102', block: 'Boys Hostel Wing A', floor: 1, capacity: 3, occupied: 2, feePerTerm: 45000, wardenName: 'Mr. Baldev Raj' },
  { id: 'h3', roomNo: 'B-201', block: 'Girls Hostel Wing B', floor: 2, capacity: 2, occupied: 2, feePerTerm: 50000, wardenName: 'Mrs. Shanti Devi' },
  { id: 'h4', roomNo: 'B-202', block: 'Girls Hostel Wing B', floor: 2, capacity: 2, occupied: 1, feePerTerm: 50000, wardenName: 'Mrs. Shanti Devi' }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    user: 'Admin',
    role: 'SUPER_ADMIN',
    action: 'LOGIN',
    module: 'Security',
    entityId: 'USR-001',
    timestamp: '2025-04-28 08:30:12',
    result: 'SUCCESS',
    details: 'Authenticated via session token (Windows Desktop x64)'
  },
  {
    id: 'aud-002',
    user: 'Admin',
    role: 'SUPER_ADMIN',
    action: 'FEE_PAYMENT',
    module: 'Fees',
    entityId: 'RCP-2025-089',
    timestamp: '2025-04-28 09:48:22',
    result: 'SUCCESS',
    details: 'Recorded payment of ₹5,000 for Rohan Sharma (INV-2025-004)'
  },
  {
    id: 'aud-003',
    user: 'Arvind Verma',
    role: 'TEACHER',
    action: 'ATTENDANCE_MARKED',
    module: 'Attendance',
    entityId: 'ATT-C10A',
    timestamp: '2025-04-28 09:30:05',
    result: 'SUCCESS',
    details: 'Marked daily attendance for Class 10 (A): 50 Present, 2 Absent'
  },
  {
    id: 'aud-004',
    user: 'Pooja Bansal',
    role: 'ACCOUNTANT',
    action: 'INVOICE_GENERATED',
    module: 'Fees',
    entityId: 'INV-2025-001',
    timestamp: '2025-04-27 16:45:00',
    result: 'SUCCESS',
    details: 'Generated Term fee invoice for Class 10 (A)'
  },
  {
    id: 'aud-005',
    user: 'Admin',
    role: 'SUPER_ADMIN',
    action: 'BACKUP_CREATED',
    module: 'System',
    entityId: 'BKP-20250428-0600',
    timestamp: '2025-04-28 06:00:00',
    result: 'SUCCESS',
    details: 'Automated morning database backup snapshot created successfully'
  }
];

// --- Multi-Campus Architecture ---
export const initialCampuses: Campus[] = [
  {
    id: 'camp-1',
    name: 'Delhi Central Main Campus',
    code: 'DPC-01',
    city: 'New Delhi',
    principal: 'Dr. Rajeshwar Sharma',
    phone: '+91 11 2894 7700',
    email: 'delhi.central@schoolerp.edu.in',
    isMain: true
  },
  {
    id: 'camp-2',
    name: 'South Mumbai Heritage Campus',
    code: 'DPC-02',
    city: 'Mumbai',
    principal: 'Mrs. Rohini Sen',
    phone: '+91 22 2490 8811',
    email: 'mumbai.south@schoolerp.edu.in',
    isMain: false
  },
  {
    id: 'camp-3',
    name: 'Bangalore Tech Valley Campus',
    code: 'DPC-03',
    city: 'Bangalore',
    principal: 'Dr. Arvind Swaminathan',
    phone: '+91 80 4120 9944',
    email: 'bangalore.tech@schoolerp.edu.in',
    isMain: false
  }
];

export const initialAcademicYears: AcademicYearConfig[] = [
  { id: 'ay-2024-25', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', isCurrent: true, status: 'ACTIVE' },
  { id: 'ay-2025-26', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false, status: 'UPCOMING' },
  { id: 'ay-2023-24', name: '2023-2024', startDate: '2023-04-01', endDate: '2024-03-31', isCurrent: false, status: 'ARCHIVED' }
];

// --- Front Office & Visitor Management ---
export const initialFrontOfficeEnquiries: FrontOfficeEnquiry[] = [
  {
    id: 'enq-01',
    enquiryNo: 'ENQ-2025-0142',
    candidateName: 'Tanvi Chawla',
    appliedClass: 'Class 9',
    parentName: 'Vikram Chawla',
    phone: '+91 98711 00223',
    email: 'vikram.c@chawlagroup.com',
    source: 'Walk-in',
    status: 'Interview',
    date: '2025-04-25',
    followUpDate: '2025-04-30',
    assignedTo: 'Sunita Sharma (Counselor)',
    notes: 'Father relocated from Bangalore. Candidate scored 92% in previous school.'
  },
  {
    id: 'enq-02',
    enquiryNo: 'ENQ-2025-0143',
    candidateName: 'Aarav Singhania',
    appliedClass: 'Class 6',
    parentName: 'Meera Singhania',
    phone: '+91 98102 33445',
    email: 'meera.s@gmail.com',
    source: 'Online',
    status: 'Application',
    date: '2025-04-26',
    followUpDate: '2025-05-02',
    assignedTo: 'Rajeev Kapoor',
    notes: 'Interested in STEM robotics lab and tennis academy.'
  },
  {
    id: 'enq-03',
    enquiryNo: 'ENQ-2025-0144',
    candidateName: 'Kritika Pillai',
    appliedClass: 'Class 11 (Science)',
    parentName: 'Col. K. Pillai',
    phone: '+91 94451 98765',
    email: 'col.pillai@army.in',
    source: 'Referral',
    status: 'Follow-up',
    date: '2025-04-27',
    followUpDate: '2025-04-29',
    assignedTo: 'Sunita Sharma (Counselor)',
    notes: 'Transfer case. Requested hostel accommodation for daughter.'
  }
];

export const initialVisitorLogs: VisitorLog[] = [
  {
    id: 'vis-101',
    passNo: 'PASS-2025-048',
    visitorName: 'Sanjay Aggarwal',
    phone: '+91 98110 54321',
    purpose: 'Vendor meeting regarding science lab equipment',
    meetingWith: 'Dr. Suresh Kumar (HOD Science)',
    checkInTime: '10:15 AM',
    idProof: 'Aadhaar Card ending in 4102',
    badgeIssued: true,
    status: 'IN_PREMISES'
  },
  {
    id: 'vis-102',
    passNo: 'PASS-2025-047',
    visitorName: 'Mrs. Vandana Sehgal',
    phone: '+91 98992 11223',
    purpose: 'Parent meeting regarding progress report of student',
    meetingWith: 'Mrs. Neha Gupta (Class Teacher 9-B)',
    checkInTime: '09:00 AM',
    checkOutTime: '09:45 AM',
    idProof: 'Driving License ending in 9872',
    badgeIssued: true,
    status: 'CHECKED_OUT'
  }
];

export const initialComplaints: Complaint[] = [
  {
    id: 'comp-01',
    ticketNo: 'HD-2025-081',
    title: 'School Bus Route 03 Delayed by 20 minutes',
    complainantName: 'Deepak Saxena (Parent of Divya Saxena)',
    complainantRole: 'Parent',
    category: 'Transport',
    priority: 'HIGH',
    date: '2025-04-27',
    assignedTo: 'Ramesh Chand (Fleet Manager)',
    status: 'IN_INVESTIGATION',
    description: 'Bus 03 was held up at Ring Road due to road repair. Parents were not notified via SMS broadcast.',
    resolutionRemarks: 'Driver instructed to report detours immediately to dispatcher for auto-SMS triggering.'
  },
  {
    id: 'comp-02',
    ticketNo: 'HD-2025-079',
    title: 'Air conditioning malfunction in Physics Lab',
    complainantName: 'Dr. Suresh Kumar',
    complainantRole: 'Staff',
    category: 'Infrastructure',
    priority: 'MEDIUM',
    date: '2025-04-26',
    assignedTo: 'Estates & Maintenance Desk',
    status: 'RESOLVED',
    description: 'Main blower unit in Lab B-204 tripping breaker under peak temperature.',
    resolutionRemarks: 'Compressor capacitor replaced and filter cleaned by HVAC contractor on April 27.'
  }
];

// --- Academics (Subjects, Lesson Plans, Question Bank, Resources) ---
export const initialSubjects: Subject[] = [
  { id: 'sub-01', code: 'MATH-10', name: 'Mathematics', type: 'THEORY', department: 'Mathematics', classes: ['Class 10', 'Class 9', 'Class 8'] },
  { id: 'sub-02', code: 'SCI-10', name: 'Science & Technology', type: 'BOTH', department: 'Science', classes: ['Class 10', 'Class 9', 'Class 8'] },
  { id: 'sub-03', code: 'ENG-10', name: 'English Language & Lit', type: 'THEORY', department: 'Languages', classes: ['Class 10', 'Class 9', 'Class 8', 'Class 7'] },
  { id: 'sub-04', code: 'SST-10', name: 'Social Sciences', type: 'THEORY', department: 'Humanities', classes: ['Class 10', 'Class 9', 'Class 8'] },
  { id: 'sub-05', code: 'HIN-10', name: 'Hindi Course A', type: 'THEORY', department: 'Languages', classes: ['Class 10', 'Class 9', 'Class 8', 'Class 7'] },
  { id: 'sub-06', code: 'CS-10', name: 'Computer Applications', type: 'BOTH', department: 'Computer Science', classes: ['Class 10', 'Class 9', 'Class 8'] }
];

export const initialLessonPlans: LessonPlan[] = [
  {
    id: 'lp-01',
    className: 'Class 10 (A)',
    subject: 'Mathematics',
    topic: 'Quadratic Equations & Arithmetic Progressions',
    teacherName: 'Mr. Arvind Verma',
    periodsRequired: 12,
    completionPercent: 85,
    objectives: 'Understanding discriminant, roots factorization, and standard AP formula derivation.',
    status: 'IN_PROGRESS',
    targetDate: '2025-05-10'
  },
  {
    id: 'lp-02',
    className: 'Class 10 (A)',
    subject: 'Science',
    topic: 'Chemical Reactions and Equations',
    teacherName: 'Dr. Suresh Kumar',
    periodsRequired: 10,
    completionPercent: 100,
    objectives: 'Balancing chemical equations, redox experiments, endothermic vs exothermic labs.',
    status: 'COMPLETED',
    targetDate: '2025-04-20'
  },
  {
    id: 'lp-03',
    className: 'Class 9 (B)',
    subject: 'Computer Applications',
    topic: 'Relational Database Fundamentals with SQL',
    teacherName: 'Mrs. Neha Gupta',
    periodsRequired: 8,
    completionPercent: 40,
    objectives: 'Tables, keys, integrity constraints, SELECT queries with WHERE and ORDER BY.',
    status: 'IN_PROGRESS',
    targetDate: '2025-05-18'
  }
];

export const initialQuestions: QuestionItem[] = [
  {
    id: 'qb-01',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    type: 'MCQ',
    question: 'If the roots of equation ax² + bx + c = 0 are real and equal, then:',
    options: ['b² - 4ac > 0', 'b² - 4ac = 0', 'b² - 4ac < 0', 'b² + 4ac = 0'],
    correctAnswer: 'b² - 4ac = 0',
    difficulty: 'EASY',
    marks: 1
  },
  {
    id: 'qb-02',
    subject: 'Science',
    topic: 'Optics & Light',
    type: 'SHORT',
    question: 'State Snell’s law of refraction and define refractive index of a medium.',
    correctAnswer: 'Ratio of sine of angle of incidence to sine of angle of refraction is constant for given pair of media (sin i / sin r = constant).',
    difficulty: 'MEDIUM',
    marks: 3
  },
  {
    id: 'qb-03',
    subject: 'Computer Applications',
    topic: 'SQL Databases',
    type: 'LONG',
    question: 'Explain Primary Key, Foreign Key, and Unique Key constraints with appropriate SQL DDL syntax examples.',
    correctAnswer: 'Detailed explanation of relational uniqueness, referential integrity cascading, and syntax.',
    difficulty: 'HARD',
    marks: 5
  }
];

export const initialStudyResources: StudyResource[] = [
  { id: 'res-01', title: 'CBSE Class 10 Math Formula Compendium 2025', subject: 'Mathematics', className: 'Class 10', fileType: 'PDF', size: '2.4 MB', uploadDate: '2025-04-15', uploadedBy: 'Mr. Arvind Verma' },
  { id: 'res-02', title: 'Physics Practical Lab Manual & Viva Guide', subject: 'Science', className: 'Class 10', fileType: 'PDF', size: '5.1 MB', uploadDate: '2025-04-18', uploadedBy: 'Dr. Suresh Kumar' },
  { id: 'res-03', title: 'English Core Sample Papers with Answer Schemes', subject: 'English', className: 'Class 9', fileType: 'DOC', size: '1.8 MB', uploadDate: '2025-04-22', uploadedBy: 'Ms. Meenakshi Iyer' }
];

// --- Financial Management (Expenses, Income, Vendors) ---
export const initialExpenseVouchers: ExpenseVoucher[] = [
  {
    id: 'exp-01',
    voucherNo: 'EXP-2025-041',
    category: 'Lab Supplies',
    payeeName: 'National Scientific Supplies Ltd.',
    amount: 34500,
    paymentMethod: 'Bank Transfer',
    date: '2025-04-24',
    status: 'PAID',
    approvedBy: 'Dr. Rajeshwar Sharma',
    description: 'Consumables, glassware, and reagents for Chemistry & Biology practical exam batches.'
  },
  {
    id: 'exp-02',
    voucherNo: 'EXP-2025-042',
    category: 'Utilities',
    payeeName: 'Delhi Power Distribution Corporation',
    amount: 88200,
    paymentMethod: 'Bank Transfer',
    date: '2025-04-25',
    status: 'PAID',
    approvedBy: 'Dr. Rajeshwar Sharma',
    description: 'Institutional monthly electricity tariff for administrative block, labs, and hostel wings.'
  },
  {
    id: 'exp-03',
    voucherNo: 'EXP-2025-043',
    category: 'Sports',
    payeeName: 'Cosco Sports Equipment Agency',
    amount: 18000,
    paymentMethod: 'Cheque',
    date: '2025-04-27',
    status: 'PENDING_APPROVAL',
    description: 'Cricket tournament protective gear, basketball replacements, and athletics track flags.'
  }
];

export const initialIncomeRecords: IncomeRecord[] = [
  { id: 'inc-01', invoiceNo: 'INC-2025-012', source: 'Bookstore', amount: 48000, receivedFrom: 'Annual Textbook Sales', date: '2025-04-20', paymentMethod: 'UPI' },
  { id: 'inc-02', invoiceNo: 'INC-2025-013', source: 'Uniform Sales', amount: 92000, receivedFrom: 'Institutional Uniform Depot', date: '2025-04-22', paymentMethod: 'Card' },
  { id: 'inc-03', invoiceNo: 'INC-2025-014', source: 'Facility Rent', amount: 35000, receivedFrom: 'Rotary Club Weekend Auditorium Rental', date: '2025-04-26', paymentMethod: 'Bank Transfer' }
];

export const initialVendors: Vendor[] = [
  { id: 'ven-01', vendorCode: 'VEN-001', name: 'National Scientific Supplies Ltd.', category: 'Lab Equipment', contactPerson: 'Anand Mittal', phone: '+91 98112 88776', email: 'sales@natsci.co.in', gstin: '07AAACN1234F1Z1', status: 'ACTIVE', pendingPayment: 0 },
  { id: 'ven-02', vendorCode: 'VEN-002', name: 'Orient Paper & Stationery Traders', category: 'Stationery', contactPerson: 'Gaurav Jain', phone: '+91 98105 44332', email: 'orient@delhipaper.com', gstin: '07BBBPJ5678G2Z2', status: 'ACTIVE', pendingPayment: 14500 },
  { id: 'ven-03', vendorCode: 'VEN-003', name: 'SpeedFleet Bus Spares & Services', category: 'Maintenance', contactPerson: 'Surjit Singh', phone: '+91 98710 99881', email: 'speedfleet@spares.in', gstin: '07CCCSK9012H3Z3', status: 'ACTIVE', pendingPayment: 8200 }
];

// --- HR, Leave & Payroll ---
export const initialStaffLeaves: StaffLeaveRequest[] = [
  {
    id: 'lve-01',
    staffId: 'st-02',
    staffName: 'Dr. Suresh Kumar',
    department: 'Science',
    leaveType: 'DUTY',
    startDate: '2025-05-02',
    endDate: '2025-05-03',
    totalDays: 2,
    reason: 'Attending CBSE Regional Science Olympiad Jury Meeting at Vigyan Bhavan.',
    status: 'APPROVED',
    appliedAt: '2025-04-26',
    reviewedBy: 'Dr. Rajeshwar Sharma (Principal)',
    reviewRemarks: 'Approved with duty allowance. Substitute classes allocated to Ms. Priya Sen.'
  },
  {
    id: 'lve-02',
    staffId: 'st-03',
    staffName: 'Mrs. Neha Gupta',
    department: 'Computer Science',
    leaveType: 'CASUAL',
    startDate: '2025-05-06',
    endDate: '2025-05-07',
    totalDays: 2,
    reason: 'Family wedding event out of station.',
    status: 'PENDING',
    appliedAt: '2025-04-28'
  }
];

export const initialPayrolls: PayrollRecord[] = [
  {
    id: 'pay-01',
    slipNo: 'PAY-2025-04-01',
    staffId: 'st-01',
    staffName: 'Mr. Arvind Verma',
    department: 'Teaching',
    designation: 'Senior PGT Mathematics',
    month: 'April 2025',
    basicSalary: 45000,
    allowances: 18000,
    deductions: 4500,
    taxDeducted: 3500,
    netSalary: 55000,
    paymentDate: '2025-04-30',
    paymentStatus: 'PROCESSED',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-02',
    slipNo: 'PAY-2025-04-02',
    staffId: 'st-02',
    staffName: 'Dr. Suresh Kumar',
    department: 'Teaching',
    designation: 'HOD Science & PGT Physics',
    month: 'April 2025',
    basicSalary: 52000,
    allowances: 21000,
    deductions: 5200,
    taxDeducted: 4800,
    netSalary: 63000,
    paymentDate: '2025-04-30',
    paymentStatus: 'PROCESSED',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 'pay-03',
    slipNo: 'PAY-2025-04-03',
    staffId: 'st-05',
    staffName: 'Mrs. Pooja Bansal',
    department: 'Administration',
    designation: 'Senior Accountant',
    month: 'April 2025',
    basicSalary: 38000,
    allowances: 14000,
    deductions: 3800,
    taxDeducted: 2200,
    netSalary: 46000,
    paymentDate: '2025-04-30',
    paymentStatus: 'PROCESSED',
    paymentMethod: 'Direct Deposit'
  }
];

// --- Inventory & Fixed Assets ---
export const initialInventoryItems: InventoryItem[] = [
  { id: 'inv-itm-01', itemCode: 'ITM-PAP-A4', name: 'A4 Copier Paper Ream (75 GSM)', category: 'Stationery', unit: 'Boxes', currentStock: 48, reorderLevel: 15, unitPrice: 240, supplier: 'Orient Paper Traders', lastRestocked: '2025-04-10' },
  { id: 'inv-itm-02', itemCode: 'ITM-SCI-BEAK', name: 'Borosilicate Glass Beakers (250ml)', category: 'Laboratory', unit: 'Pcs', currentStock: 120, reorderLevel: 30, unitPrice: 110, supplier: 'National Scientific', lastRestocked: '2025-04-18' },
  { id: 'inv-itm-03', itemCode: 'ITM-SPT-FTB', name: 'Tournament Size 5 Footballs', category: 'Sports', unit: 'Pcs', currentStock: 25, reorderLevel: 8, unitPrice: 850, supplier: 'Cosco Sports', lastRestocked: '2025-03-25' },
  { id: 'inv-itm-04', itemCode: 'ITM-MED-KIT', name: 'Emergency First Aid Refill Kits', category: 'Laboratory', unit: 'Sets', currentStock: 14, reorderLevel: 5, unitPrice: 650, supplier: 'Apollo Pharmacy Wholesale', lastRestocked: '2025-04-02' }
];

export const initialAssets: AssetRecord[] = [
  { id: 'ast-01', assetTag: 'AST-LAB-019', name: 'Olympus Binocular Microscope CX23', category: 'Laboratory', location: 'Biology Lab 202', purchaseDate: '2023-08-15', purchaseCost: 42000, condition: 'EXCELLENT', assignedTo: 'Dr. Suresh Kumar', warrantyExpiry: '2026-08-15' },
  { id: 'ast-02', assetTag: 'AST-IT-104', name: 'Epson Interactive Laser Projector EB-735F', category: 'Classroom Tech', location: 'Room 301 (Class 10-A)', purchaseDate: '2024-01-10', purchaseCost: 85000, condition: 'GOOD', assignedTo: 'Mr. Arvind Verma', warrantyExpiry: '2027-01-10' },
  { id: 'ast-03', assetTag: 'AST-SRV-001', name: 'Dell PowerEdge R450 Rack Server', category: 'IT Equipment', location: 'Server Room Data Center', purchaseDate: '2023-11-20', purchaseCost: 245000, condition: 'EXCELLENT', assignedTo: 'IT Systems Admin', warrantyExpiry: '2028-11-20' }
];

// --- Student Welfare & Life (Certificates, Health, Discipline, Alumni) ---
export const initialCertificates: CertificateRecord[] = [
  {
    id: 'cert-01',
    certNo: 'TC-2025-081',
    studentId: 's-1004',
    studentName: 'Priya Iyer',
    admissionNo: 'ADM-2024-004',
    className: 'Class 10 (B)',
    type: 'Transfer',
    issueDate: '2025-04-25',
    issuedBy: 'Dr. Rajeshwar Sharma',
    purpose: 'Guardian relocation to Pune branch office.',
    status: 'ACTIVE'
  },
  {
    id: 'cert-02',
    certNo: 'BC-2025-142',
    studentId: 's-1001',
    studentName: 'Rohan Sharma',
    admissionNo: 'ADM-2024-001',
    className: 'Class 10 (A)',
    type: 'Bonafide',
    issueDate: '2025-04-20',
    issuedBy: 'Dr. Rajeshwar Sharma',
    purpose: 'Passport renewal and CBSE national talent scholarship application.',
    status: 'ACTIVE'
  }
];

export const initialHealthRecords: HealthRecord[] = [
  {
    id: 'hlth-01',
    studentId: 's-1001',
    studentName: 'Rohan Sharma',
    admissionNo: 'ADM-2024-001',
    className: 'Class 10 (A)',
    bloodGroup: 'B+',
    allergies: ['Peanuts (Mild)'],
    chronicConditions: ['None'],
    emergencyContact: 'Rajesh Sharma (Father)',
    emergencyPhone: '+91 98112 34567',
    lastCheckupDate: '2025-02-15',
    vaccinationsStatus: 'COMPLETE',
    doctorNotes: 'Fit for all competitive athletic sports and swimming.'
  },
  {
    id: 'hlth-02',
    studentId: 's-1002',
    studentName: 'Ananya Deshmukh',
    admissionNo: 'ADM-2024-002',
    className: 'Class 10 (A)',
    bloodGroup: 'O+',
    allergies: ['Dust / Pollen'],
    chronicConditions: ['Asthma (Mild exercise-induced)'],
    emergencyContact: 'Sunil Deshmukh (Father)',
    emergencyPhone: '+91 98220 54321',
    lastCheckupDate: '2025-03-10',
    vaccinationsStatus: 'COMPLETE',
    doctorNotes: 'Keep prescribed inhaler available in school medical infirmary.'
  }
];

export const initialDisciplineIncidents: DisciplineIncident[] = [
  {
    id: 'disc-01',
    caseNo: 'DISC-2025-014',
    studentId: 's-1005',
    studentName: 'Aditya Rao',
    className: 'Class 9 (A)',
    date: '2025-04-22',
    incidentType: 'Late Coming',
    severity: 'LOW',
    reportedBy: 'Gate Security & Mr. Arvind Verma',
    actionTaken: 'First verbal counsel issued; attendance record adjusted to Late.',
    parentNotified: true,
    status: 'RESOLVED'
  }
];

export const initialAlumni: AlumniRecord[] = [
  {
    id: 'alm-01',
    studentName: 'Siddharth Malhotra',
    admissionNo: 'ADM-2018-042',
    passingYear: 2022,
    degreeObtained: 'Class 12 CBSE (96.4%)',
    higherEducation: 'B.Tech Computer Science, IIT Delhi',
    currentOccupation: 'Software Development Engineer',
    companyOrCollege: 'Google India',
    phone: '+91 98119 77665',
    email: 'siddharth.m@alumni.schoolerp.edu',
    city: 'Bangalore',
    willingToMentor: true
  },
  {
    id: 'alm-02',
    studentName: 'Dr. Shruti Menon',
    admissionNo: 'ADM-2016-018',
    passingYear: 2020,
    degreeObtained: 'Class 12 CBSE (98.0%)',
    higherEducation: 'MBBS, AIIMS New Delhi',
    currentOccupation: 'Resident Doctor',
    companyOrCollege: 'Safdarjung Hospital',
    phone: '+91 98712 33441',
    email: 'shruti.menon@aiims.edu',
    city: 'New Delhi',
    willingToMentor: true
  }
];

// --- Integrations Hub (Realistic Configurations & Diagnostics) ---
export const initialIntegrations: IntegrationServiceConfig[] = [
  {
    id: 'int-01',
    name: 'WhatsApp Business API Gateway',
    type: 'WHATSAPP',
    status: 'CONNECTED',
    provider: 'Meta Cloud API / Twilio BSP',
    lastPing: '2 mins ago (200 OK)',
    description: 'Automated dispatch of fee reminders, attendance anomaly alerts, and exam schedules to parents.',
    endpointOrKeyMasked: 'wh-prod-••••••••9842'
  },
  {
    id: 'int-02',
    name: 'Institutional SMS Broadcast Gateway',
    type: 'SMS',
    status: 'CONNECTED',
    provider: 'MSG91 / Fast2SMS DLT Portal',
    lastPing: '5 mins ago (200 OK)',
    description: 'DLT-registered transactional header DPISND for emergency closures and OTP verification.',
    endpointOrKeyMasked: 'dlt-auth-••••••••4129'
  },
  {
    id: 'int-03',
    name: 'Biometric RFID Attendance Reader Sync',
    type: 'BIOMETRIC',
    status: 'CONNECTED',
    provider: 'eSSL SilkBio-101TC LAN Bridge',
    lastPing: '1 min ago (Healthy Sync)',
    description: 'Real-time clock-in synchronization from 4 gate turnstiles to attendance service database.',
    endpointOrKeyMasked: 'tcp://192.168.1.140:4370'
  },
  {
    id: 'int-04',
    name: 'Online Payment Gateway (Fee Portal)',
    type: 'PAYMENT_GATEWAY',
    status: 'CONNECTED',
    provider: 'Razorpay / HDFC SmartHub PG',
    lastPing: 'Active (Webhook 200)',
    description: 'Instant UPI, NetBanking, Credit/Debit card fee collection with automatic receipt reconciliation.',
    endpointOrKeyMasked: 'rzp_live_••••••••8819'
  },
  {
    id: 'int-05',
    name: 'School Fleet GPS Telemetry Sync',
    type: 'GPS',
    status: 'CONNECTED',
    provider: 'Loconav AIS-140 GPS Server',
    lastPing: '30 secs ago (5/5 Vehicles Live)',
    description: 'Government AIS-140 certified GPS trackers on school buses with speed and route geofence monitors.',
    endpointOrKeyMasked: 'ais140-api-••••••••6720'
  },
  {
    id: 'int-06',
    name: 'Tally Prime Financial Bridge',
    type: 'TALLY',
    status: 'NEEDS_CONFIGURATION',
    provider: 'Tally XML / ODBC LAN Connector',
    lastPing: 'Offline (Port 9000 unconfigured)',
    description: 'Exports daybook vouchers and fee collection ledgers directly into chartered accountant books.',
    endpointOrKeyMasked: 'localhost:9000'
  }
];

