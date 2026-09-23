import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  X,
  CheckCircle2,
  Trash2,
  Filter,
  FileText,
  Clock,
  XCircle,
  Receipt,
  UserCheck,
  Check,
  Building
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { Staff, StaffLeaveRequest, PayrollRecord } from '../../types';

export const StaffModule: React.FC = () => {
  const { staff, staffLeaves, payrolls, store } = useERP();

  const [activeTab, setActiveTab] = useState<'directory' | 'leaves' | 'payroll'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    staffId: staff[0]?.id || '',
    leaveType: 'CASUAL' as StaffLeaveRequest['leaveType'],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    reason: '',
  });

  // Pay Slip Modal
  const [selectedPaySlip, setSelectedPaySlip] = useState<PayrollRecord | null>(null);

  // Form State for Adding Staff
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Female' as const,
    department: 'Teaching',
    designation: 'Senior Faculty',
    qualification: 'M.Sc, B.Ed',
    phone: '',
    email: '',
    salary: 55000,
    address: 'New Delhi',
    joiningDate: new Date().toISOString().slice(0, 10)
  });

  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addStaff(formData);
    setShowAddModal(false);
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Female',
      department: 'Teaching',
      designation: 'Senior Faculty',
      qualification: 'M.Sc, B.Ed',
      phone: '',
      email: '',
      salary: 55000,
      address: 'New Delhi',
      joiningDate: new Date().toISOString().slice(0, 10)
    });
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const st = staff.find(s => s.id === newLeave.staffId);
    if (!st || !newLeave.reason) return;

    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    store.applyStaffLeave({
      staffId: st.id,
      staffName: `${st.firstName} ${st.lastName}`,
      department: st.department,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      totalDays,
      reason: newLeave.reason,
    });

    setShowLeaveModal(false);
    setNewLeave({
      staffId: staff[0]?.id || '',
      leaveType: 'CASUAL',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      reason: ''
    });
  };

  return (
    <div id="staff-module" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff, HR & Payroll Management</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {staff.length} Active Personnel
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Faculty credentials, department allocations, leave tracking, and automated payroll disbursement
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Apply Staff Leave</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'directory'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Staff Directory ({staff.length})
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'leaves'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Leave Applications ({staffLeaves.length})
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'payroll'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Payroll & Salary Slips ({payrolls.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: STAFF DIRECTORY */}
      {/* ============================================================ */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search staff by name, emp ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Department:</span>
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Departments</option>
                <option value="Teaching">Teaching & Academics</option>
                <option value="Administration">Administration</option>
                <option value="Finance">Finance & Accounts</option>
                <option value="Sports">Sports & PE</option>
              </select>
            </div>
          </div>

          {/* Staff Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map(member => (
              <div key={member.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                      {member.empId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      member.attendanceStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.attendanceStatus || 'PRESENT'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 mt-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                      {member.firstName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-xs text-blue-600 font-medium">{member.designation}</p>
                      <p className="text-[11px] text-slate-400">{member.department} • {member.qualification}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono-tech">{member.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono-tech font-bold text-slate-800">
                        Monthly Salary: ₹{member.salary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Joined {member.joiningDate}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.firstName} from staff directory?`)) {
                        store.deleteStaff(member.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove staff member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: LEAVE MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Faculty & Administrative Leave Requests</h3>
            <span className="text-xs text-slate-400">Total Requests: {staffLeaves.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{leave.staffName}</div>
                      <div className="text-[11px] text-slate-400 font-mono-tech">{leave.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {leave.leaveType} LEAVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-tech text-slate-600">
                      {leave.startDate} to {leave.endDate} ({leave.totalDays}d)
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        leave.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {leave.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => store.updateStaffLeaveStatus(leave.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px] transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => store.updateStaffLeaveStatus(leave.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold text-[11px] transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Action logged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PAYROLL & SALARY SLIPS */}
      {/* ============================================================ */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Monthly Institutional Payroll Register</h3>
                <p className="text-xs text-slate-400">Month: May 2025 • Direct Bank Payouts</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Total Net Payroll: </span>
                <span className="text-base font-bold font-mono-tech text-slate-900">
                  ₹{payrolls.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Basic Pay</th>
                    <th className="py-3 px-4">Allowances</th>
                    <th className="py-3 px-4">Deductions (TDS/PF)</th>
                    <th className="py-3 px-4">Net Payable</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payrolls.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{pay.staffName}</div>
                        <div className="text-[11px] text-slate-400 font-mono-tech">{pay.slipNo}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-tech text-slate-600">{pay.month}</td>
                      <td className="py-3.5 px-4 font-mono-tech">₹{pay.basicSalary.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono-tech text-emerald-600">+₹{pay.allowances.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono-tech text-rose-600">-₹{pay.deductions.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-slate-900 text-sm">
                        ₹{pay.netSalary.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pay.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {pay.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => store.updatePayrollStatus(pay.id, 'PAID')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px] transition"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPaySlip(pay)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold text-[11px] transition"
                        >
                          View Pay Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PAY SLIP DETAIL */}
      {/* ============================================================ */}
      {selectedPaySlip && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">Salary Pay Slip</h3>
              </div>
              <button onClick={() => setSelectedPaySlip(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee Name:</span>
                  <span className="font-bold text-slate-800">{selectedPaySlip.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slip Number:</span>
                  <span className="font-mono-tech text-slate-800">{selectedPaySlip.slipNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pay Period:</span>
                  <span className="font-mono-tech text-slate-800">{selectedPaySlip.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Date:</span>
                  <span className="font-mono-tech text-slate-800">{selectedPaySlip.paymentDate}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                <div className="p-3 bg-slate-50 font-bold text-slate-700">Salary Breakdown</div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-600">Basic Monthly Pay</span>
                  <span className="font-mono-tech font-bold text-slate-800">₹{selectedPaySlip.basicSalary.toLocaleString()}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-600">HRA & Academic Allowances</span>
                  <span className="font-mono-tech font-bold text-emerald-600">+₹{selectedPaySlip.allowances.toLocaleString()}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-600">Statutory Deductions (TDS / PF)</span>
                  <span className="font-mono-tech font-bold text-rose-600">-₹{selectedPaySlip.deductions.toLocaleString()}</span>
                </div>
                <div className="p-3 flex justify-between bg-blue-50/60 font-bold text-sm">
                  <span className="text-blue-900">Net Take-Home Pay</span>
                  <span className="font-mono-tech text-blue-700">₹{selectedPaySlip.netSalary.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaySlip(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition"
                >
                  Close Pay Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: APPLY STAFF LEAVE */}
      {/* ============================================================ */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Submit Staff Leave Application</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Staff Member *</label>
                <select
                  value={newLeave.staffId}
                  onChange={e => setNewLeave({ ...newLeave, staffId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none bg-slate-50 font-medium"
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.empId}) — {s.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Leave Classification *</label>
                  <select
                    value={newLeave.leaveType}
                    onChange={e => setNewLeave({ ...newLeave, leaveType: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="CASUAL">Casual Leave (CL)</option>
                    <option value="MEDICAL">Medical Leave (ML)</option>
                    <option value="MATERNITY">Maternity / Paternity Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={newLeave.endDate}
                  onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the circumstances for this leave request..."
                  value={newLeave.reason}
                  onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD STAFF */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Add New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStaffSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                  >
                    <option value="Teaching">Teaching</option>
                    <option value="Administration">Administration</option>
                    <option value="Finance">Finance</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
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
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-xs"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
