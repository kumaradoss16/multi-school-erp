import React, { useState } from 'react';
import { 
  UserPlus, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowRight, 
  X,
  Sparkles,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { Admission, AdmissionStatus, Gender } from '../../types';

export const AdmissionsModule: React.FC = () => {
  const { admissions, store } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'Male' as Gender,
    appliedClass: 'Class 9',
    parentName: '',
    phone: '',
    email: '',
  });

  const filteredAdmissions = admissions.filter(app => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addAdmission({
      ...formData,
      remarks: 'Walk-in enquiry'
    });
    setShowAddModal(false);
    setFormData({
      studentName: '',
      gender: 'Male',
      appliedClass: 'Class 9',
      parentName: '',
      phone: '',
      email: '',
    });
  };

  const handleUpdateStatus = (id: string, status: AdmissionStatus) => {
    if (status === 'ENROLLED') {
      const student = store.enrollApplicant(id);
      if (student) {
        alert(`Successfully enrolled ${student.firstName} ${student.lastName}! Student Admission No: ${student.admissionNo}`);
      }
    } else {
      store.updateAdmissionStatus(id, status);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admissions & Enrollment CRM</h1>
            <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Session 2025-26
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage applicant pipeline from initial walk-in enquiry through entrance verification to student enrollment.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Admission Enquiry</span>
        </button>
      </div>

      {/* Pipeline Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Enquiries', count: admissions.length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Applications', count: admissions.filter(a => a.status === 'APPLICATION').length, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Document Verification', count: admissions.filter(a => a.status === 'VERIFICATION').length, color: 'text-amber-600 bg-amber-50' },
          { label: 'Approved Candidates', count: admissions.filter(a => a.status === 'APPROVED').length, color: 'text-purple-600 bg-purple-50' },
          { label: 'Enrolled Scholars', count: admissions.filter(a => a.status === 'ENROLLED').length, color: 'text-emerald-600 bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-slate-900">{stat.count}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${stat.color.split(' ')[0]}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search applicants, app #, parent..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium">Stage:</span>
          {['ALL', 'APPLICATION', 'VERIFICATION', 'APPROVED', 'ENROLLED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Admissions Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <th className="py-3 px-4">Application #</th>
              <th className="py-3 px-4">Candidate Name</th>
              <th className="py-3 px-4">Applied Grade</th>
              <th className="py-3 px-4">Guardian / Contact</th>
              <th className="py-3 px-4">Application Date</th>
              <th className="py-3 px-4">Pipeline Status</th>
              <th className="py-3 px-4 text-right">Advance Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAdmissions.map(app => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono-tech font-bold text-slate-800">{app.applicationNo}</td>
                <td className="py-3 px-4 font-semibold text-slate-900">{app.studentName}</td>
                <td className="py-3 px-4">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                    {app.appliedClass}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-800 font-medium">{app.parentName}</div>
                  <div className="text-[11px] text-slate-500 font-mono-tech">{app.phone}</div>
                </td>
                <td className="py-3 px-4 text-slate-500">{app.applicationDate}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    app.status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-800' :
                    app.status === 'APPROVED' ? 'bg-purple-100 text-purple-800' :
                    app.status === 'VERIFICATION' ? 'bg-amber-100 text-amber-800' :
                    app.status === 'APPLICATION' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {app.status === 'APPLICATION' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'VERIFICATION')}
                      className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold"
                    >
                      Verify Docs
                    </button>
                  )}
                  {app.status === 'VERIFICATION' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold"
                    >
                      Approve
                    </button>
                  )}
                  {app.status === 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'ENROLLED')}
                      className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1 ml-auto"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Enroll as Student</span>
                    </button>
                  )}
                  {app.status === 'ENROLLED' && (
                    <span className="text-emerald-600 text-xs font-semibold flex items-center justify-end space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Enrolled</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Admission Enquiry */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">New Student Admission Enquiry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInquirySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Malhotra"
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applying Grade *</label>
                  <select
                    value={formData.appliedClass}
                    onChange={e => setFormData({ ...formData, appliedClass: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Malhotra"
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98110 00000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono-tech outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
