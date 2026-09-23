import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  Edit, 
  Trash2, 
  CreditCard, 
  Award, 
  X, 
  Check, 
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { Student, Gender, FeeStatus } from '../../types';

interface StudentsModuleProps {
  onOpenAddModal?: () => void;
  selectedStudentId?: string | null;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({ 
  onOpenAddModal,
  selectedStudentId: propStudentId
}) => {
  const { students, classes, store, schoolProfile, invoices, examMarks } = useERP();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<string>('ALL');

  // Modals & Panels
  const [activeStudent, setActiveStudent] = useState<Student | null>(
    propStudentId ? students.find(s => s.id === propStudentId) || null : null
  );
  const [profileTab, setProfileTab] = useState<'overview' | 'academics' | 'fees' | 'idcard' | 'certificate'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Certificate generator state
  const [certType, setCertType] = useState<'Bonafide' | 'Transfer' | 'Character'>('Bonafide');

  // Form State for Add Student
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as Gender,
    dob: '2010-01-01',
    bloodGroup: 'B+',
    className: 'Class 10',
    section: 'A',
    rollNo: 1,
    parentName: '',
    parentRelationship: 'Father',
    parentPhone: '',
    parentEmail: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    totalFees: 45000,
    paidFees: 0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter students list
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    const matchesFee = selectedFeeStatus === 'ALL' || s.feeStatus === selectedFeeStatus;

    return matchesSearch && matchesClass && matchesFee;
  });

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.parentName.trim()) errs.parentName = 'Parent/Guardian name is required';
    if (!formData.parentPhone.trim()) errs.parentPhone = 'Parent contact phone is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const pending = Math.max(0, formData.totalFees - formData.paidFees);
    const feeStatus: FeeStatus = pending === 0 ? 'PAID' : (formData.paidFees > 0 ? 'PARTIAL' : 'PENDING');

    const created = store.addStudent({
      ...formData,
      classId: 'c1',
      feeStatus,
      pendingAmount: pending
    });

    setShowAddModal(false);
    setActiveStudent(created);
    setProfileTab('overview');
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      dob: '2010-01-01',
      bloodGroup: 'B+',
      className: 'Class 10',
      section: 'A',
      rollNo: students.length + 1,
      parentName: '',
      parentRelationship: 'Father',
      parentPhone: '',
      parentEmail: '',
      address: '',
      city: 'New Delhi',
      state: 'Delhi',
      totalFees: 45000,
      paidFees: 0
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;
    store.updateStudent(studentToEdit.id, studentToEdit);
    setShowEditModal(false);
    if (activeStudent?.id === studentToEdit.id) {
      setActiveStudent(studentToEdit);
    }
  };

  const handleExportCSV = () => {
    const headers = ['AdmissionNo,FirstName,LastName,Gender,Class,Section,RollNo,Parent,Phone,FeeStatus,PendingAmount,AttendancePercent\n'];
    const rows = filteredStudents.map(s => 
      `"${s.admissionNo}","${s.firstName}","${s.lastName}","${s.gender}","${s.className}","${s.section}",${s.rollNo},"${s.parentName}","${s.parentPhone}","${s.feeStatus}",${s.pendingAmount},${s.attendancePercent}%`
    );
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    store.logAudit('STUDENT_EXPORT', 'Students', 'CSV_EXPORT', `Exported ${filteredStudents.length} students to CSV`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage comprehensive student profiles, enrollment, academic records, and fee balances.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition no-print"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Directory</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, admission #, parent..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">Class:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium outline-none focus:border-blue-500"
            >
              <option value="ALL">All Classes</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          {/* Fee Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">Fee:</span>
            <select
              value={selectedFeeStatus}
              onChange={e => setSelectedFeeStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No students match the current filters.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 inline-flex items-center space-x-1 text-xs text-blue-600 font-bold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Student</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition">
                    {/* Student Avatar + Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.firstName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {student.gender} • Blood: {student.bloodGroup}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Admission Number */}
                    <td className="py-3 px-4 font-mono-tech text-slate-600 text-[11px] font-medium">
                      {student.admissionNo}
                    </td>

                    {/* Class & Section */}
                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {student.className} ({student.section})
                      </span>
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4 font-mono-tech text-slate-700 font-medium">
                      #{student.rollNo}
                    </td>

                    {/* Parent & Phone */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{student.parentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono-tech">{student.parentPhone}</div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-[11px]">
                          {student.attendancePercent}%
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.attendancePercent >= 90 ? 'bg-emerald-500' :
                              student.attendancePercent >= 75 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendancePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Fee Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        student.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        student.feeStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                        student.feeStatus === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {student.feeStatus}
                        {student.pendingAmount > 0 && ` (₹${student.pendingAmount.toLocaleString()})`}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setActiveStudent(student);
                            setProfileTab('overview');
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View 360° Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToEdit(student);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveStudent(student);
                            setProfileTab('idcard');
                          }}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Print ID Card"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Archive student ${student.firstName} ${student.lastName}?`)) {
                              store.deleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Archive / Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 360° STUDENT PROFILE MODAL / DRAWER */}
      {/* ============================================================ */}
      {activeStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-linear-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold border border-white/30 shadow-inner">
                  {activeStudent.firstName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {activeStudent.firstName} {activeStudent.lastName}
                  </h2>
                  <p className="text-xs text-blue-100 flex items-center space-x-2 mt-0.5">
                    <span className="font-mono-tech">{activeStudent.admissionNo}</span>
                    <span>•</span>
                    <span>{activeStudent.className} ({activeStudent.section})</span>
                    <span>•</span>
                    <span>Roll #{activeStudent.rollNo}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold space-x-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'academics', label: 'Academic & Marks' },
                { id: 'fees', label: 'Fees & Invoices' },
                { id: 'idcard', label: 'Student ID Card' },
                { id: 'certificate', label: 'Generate Certificate' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id as any)}
                  className={`py-3 border-b-2 transition ${
                    profileTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {profileTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Personal Information */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Gender</span>
                        <span className="font-medium text-slate-800">{activeStudent.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                        <span className="font-medium text-slate-800">{activeStudent.dob}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Blood Group</span>
                        <span className="font-medium text-slate-800">{activeStudent.bloodGroup}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Enrollment Date</span>
                        <span className="font-medium text-slate-800">{activeStudent.enrollmentDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent & Contact Information */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                      Parent / Guardian
                    </h3>
                    <div className="space-y-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary Guardian</span>
                        <span className="font-semibold text-slate-800">
                          {activeStudent.parentName} ({activeStudent.parentRelationship})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono-tech">{activeStudent.parentPhone}</span>
                      </div>
                      {activeStudent.parentEmail && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activeStudent.parentEmail}</span>
                        </div>
                      )}
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{activeStudent.address}, {activeStudent.city}, {activeStudent.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-center">
                      <span className="text-xs text-blue-700 font-medium">Overall Attendance</span>
                      <h4 className="text-2xl font-bold text-blue-900 mt-1">{activeStudent.attendancePercent}%</h4>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
                      <span className="text-xs text-emerald-700 font-medium">Total Fees Paid</span>
                      <h4 className="text-2xl font-bold text-emerald-900 mt-1">₹{activeStudent.paidFees.toLocaleString()}</h4>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                      <span className="text-xs text-amber-700 font-medium">Pending Balance</span>
                      <h4 className="text-2xl font-bold text-amber-900 mt-1">₹{activeStudent.pendingAmount.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Academics & Marks Tab */}
              {profileTab === 'academics' && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-slate-800 text-sm">Examination Records</h3>
                  {examMarks.filter(m => m.studentId === activeStudent.id).length === 0 ? (
                    <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      No examination marks published yet for this student.
                    </div>
                  ) : (
                    <table className="w-full text-left bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Subject</th>
                          <th className="py-2.5 px-3">Max Marks</th>
                          <th className="py-2.5 px-3">Obtained</th>
                          <th className="py-2.5 px-3">Grade</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {examMarks.filter(m => m.studentId === activeStudent.id).map(m => (
                          <tr key={m.id}>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{m.subject}</td>
                            <td className="py-2.5 px-3 font-mono-tech">{m.maxMarks}</td>
                            <td className="py-2.5 px-3 font-mono-tech font-bold text-blue-600">{m.marksObtained}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                {m.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                {m.resultStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Fees & Invoices Tab */}
              {profileTab === 'fees' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Assigned Invoices & Payments</h3>
                  </div>

                  <table className="w-full text-left bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Fee Type</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Paid</th>
                        <th className="py-2.5 px-3">Balance</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.filter(i => i.studentId === activeStudent.id).map(inv => (
                        <tr key={inv.id}>
                          <td className="py-2.5 px-3 font-mono-tech font-semibold text-slate-800">{inv.invoiceNo}</td>
                          <td className="py-2.5 px-3 text-slate-700">{inv.feeType}</td>
                          <td className="py-2.5 px-3 font-mono-tech">₹{inv.totalAmount.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono-tech text-emerald-600 font-semibold">₹{inv.paidAmount.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono-tech text-amber-600 font-bold">₹{inv.balance.toLocaleString()}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                              inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Student ID Card Generator Tab */}
              {profileTab === 'idcard' && (
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  {/* Visual ID Card Card Container */}
                  <div 
                    id="student-id-card"
                    className="w-80 h-120 bg-white rounded-3xl shadow-xl border-2 border-blue-600 overflow-hidden flex flex-col justify-between text-center relative print-container"
                  >
                    {/* Header */}
                    <div className="bg-blue-700 text-white py-3 px-4">
                      <h4 className="font-bold text-sm tracking-wide">{schoolProfile.name}</h4>
                      <p className="text-[10px] text-blue-200 mt-0.5">STUDENT IDENTITY CARD</p>
                    </div>

                    {/* Photo & Name */}
                    <div className="p-4 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-700 mb-3">
                        {activeStudent.firstName[0]}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 leading-tight">
                        {activeStudent.firstName} {activeStudent.lastName}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">
                        {activeStudent.className} — Section {activeStudent.section}
                      </p>
                      <span className="mt-1 font-mono-tech text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        ID: {activeStudent.admissionNo}
                      </span>
                    </div>

                    {/* Key Details */}
                    <div className="px-6 py-2 text-left text-xs space-y-1.5 border-t border-b border-slate-100 bg-slate-50/60">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Roll Number:</span>
                        <span className="font-bold text-slate-800">#{activeStudent.rollNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Blood Group:</span>
                        <span className="font-bold text-slate-800">{activeStudent.bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Emergency Phone:</span>
                        <span className="font-mono-tech text-slate-800 font-semibold">{activeStudent.parentPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valid Till:</span>
                        <span className="font-bold text-slate-800">31-Mar-2026</span>
                      </div>
                    </div>

                    {/* Footer barcode representation */}
                    <div className="p-3 bg-slate-900 text-white flex items-center justify-between px-6 text-[10px]">
                      <span className="font-mono-tech">AFF: {schoolProfile.affiliationNo}</span>
                      <span className="font-bold uppercase tracking-wider">Principal Sign</span>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Student ID Card</span>
                  </button>
                </div>
              )}

              {/* Certificate Generator Tab */}
              {profileTab === 'certificate' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-bold text-slate-700">Certificate Type:</span>
                    {(['Bonafide', 'Transfer', 'Character'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setCertType(t)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                          certType === t ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t} Certificate
                      </button>
                    ))}
                  </div>

                  {/* Visual Certificate Paper */}
                  <div className="p-8 bg-amber-50/40 border-4 border-double border-amber-700/60 rounded-2xl text-center space-y-6 shadow-sm print-container">
                    <div className="border-b-2 border-amber-800/40 pb-4">
                      <h2 className="text-xl font-bold tracking-widest uppercase text-amber-950 font-serif">
                        {schoolProfile.name}
                      </h2>
                      <p className="text-xs text-amber-900 font-serif">{schoolProfile.address}</p>
                      <p className="text-[10px] text-amber-800 font-mono-tech mt-0.5">Affiliation: {schoolProfile.affiliationNo}</p>
                    </div>

                    <h3 className="text-lg font-bold uppercase tracking-wider text-amber-900 underline font-serif decoration-amber-600 underline-offset-4">
                      {certType} Certificate
                    </h3>

                    <p className="text-sm text-slate-800 leading-relaxed font-serif max-w-xl mx-auto text-justify">
                      This is to certify that <span className="font-bold uppercase underline">{activeStudent.firstName} {activeStudent.lastName}</span>, 
                      Admission No: <span className="font-bold font-mono-tech">{activeStudent.admissionNo}</span>, son/daughter of 
                      Mr./Mrs. <span className="font-bold">{activeStudent.parentName}</span>, is a bonafide student of 
                      <span className="font-bold"> {activeStudent.className} ({activeStudent.section})</span> at our institution for the academic year 
                      <span className="font-bold"> {schoolProfile.academicYear}</span>.
                      During this period, their conduct and moral character have been found to be exemplary.
                    </p>

                    <div className="pt-8 flex justify-between items-end text-xs font-serif text-amber-950 px-8">
                      <div className="text-left">
                        <p>Date: {new Date().toLocaleDateString()}</p>
                        <p>Place: New Delhi</p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 border-b border-amber-900 mb-1" />
                        <p className="font-bold">Principal Signature</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Certificate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD STUDENT MODAL */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">New Student Enrollment</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                    placeholder="e.g. Aarav"
                  />
                  {formErrors.firstName && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                    placeholder="e.g. Verma"
                  />
                  {formErrors.lastName && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enroll Class</label>
                  <select
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-800 text-xs mb-2">Parent / Guardian Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Parent Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                      placeholder="e.g. Rajesh Verma"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.parentPhone}
                      onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                      placeholder="+91 98110 00000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Fee Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.totalFees}
                    onChange={e => setFormData({ ...formData, totalFees: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Paid Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.paidFees}
                    onChange={e => setFormData({ ...formData, paidFees: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20"
                >
                  Confirm & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT STUDENT MODAL */}
      {/* ============================================================ */}
      {showEditModal && studentToEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Edit Student Record</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={studentToEdit.firstName}
                    onChange={e => setStudentToEdit({ ...studentToEdit, firstName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={studentToEdit.lastName}
                    onChange={e => setStudentToEdit({ ...studentToEdit, lastName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={studentToEdit.parentName}
                    onChange={e => setStudentToEdit({ ...studentToEdit, parentName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={studentToEdit.parentPhone}
                    onChange={e => setStudentToEdit({ ...studentToEdit, parentPhone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
