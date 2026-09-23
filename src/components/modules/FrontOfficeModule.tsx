import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  UserCheck, 
  PhoneCall, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  X, 
  LifeBuoy, 
  Tag, 
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { FrontOfficeEnquiry, VisitorLog, Complaint } from '../../types';

export const FrontOfficeModule: React.FC = () => {
  const { frontOfficeEnquiries, visitorLogs, complaints, schoolProfile, store } = useERP();

  const [activeTab, setActiveTab] = useState<'enquiries' | 'visitors' | 'complaints'>('enquiries');

  // Enquiries state
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>('ALL');
  const [showAddEnquiryModal, setShowAddEnquiryModal] = useState(false);
  const [newEnquiryData, setNewEnquiryData] = useState({
    candidateName: '',
    appliedClass: 'Class 9',
    parentName: '',
    phone: '',
    email: '',
    source: 'Walk-in' as FrontOfficeEnquiry['source'],
    status: 'New' as FrontOfficeEnquiry['status'],
    date: new Date().toISOString().slice(0, 10),
    followUpDate: '2025-05-02',
    assignedTo: 'Admission Desk Counselor',
    notes: ''
  });

  // Visitor state
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorStatusFilter, setVisitorStatusFilter] = useState<'ALL' | 'IN_PREMISES' | 'CHECKED_OUT'>('ALL');
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [activeVisitorPass, setActiveVisitorPass] = useState<VisitorLog | null>(null);
  const [newVisitorData, setNewVisitorData] = useState({
    visitorName: '',
    phone: '',
    purpose: 'Parent inquiry regarding ward academic performance',
    meetingWith: 'Class Teacher 10-A',
    checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    idProof: 'Aadhaar Card / Govt ID',
    badgeIssued: true,
    status: 'IN_PREMISES' as const
  });

  // Complaints / Helpdesk state
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState<string>('ALL');
  const [showAddComplaintModal, setShowAddComplaintModal] = useState(false);
  const [selectedComplaintForResolve, setSelectedComplaintForResolve] = useState<Complaint | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [newComplaintData, setNewComplaintData] = useState({
    title: '',
    complainantName: '',
    complainantRole: 'Parent' as Complaint['complainantRole'],
    category: 'Academics' as Complaint['category'],
    priority: 'MEDIUM' as Complaint['priority'],
    date: new Date().toISOString().slice(0, 10),
    assignedTo: 'Academic Coordinator',
    status: 'PENDING' as Complaint['status'],
    description: ''
  });

  // --- Filtered Enquiries ---
  const filteredEnquiries = frontOfficeEnquiries.filter(e => {
    const matchesSearch = 
      e.candidateName.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.enquiryNo.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.parentName.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.phone.includes(enquirySearch);
    const matchesStatus = enquiryStatusFilter === 'ALL' || e.status === enquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Filtered Visitors ---
  const filteredVisitors = visitorLogs.filter(v => {
    const matchesSearch = 
      v.visitorName.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.passNo.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.meetingWith.toLowerCase().includes(visitorSearch.toLowerCase());
    const matchesStatus = visitorStatusFilter === 'ALL' || v.status === visitorStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Filtered Complaints ---
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.ticketNo.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(complaintSearch.toLowerCase());
    const matchesCategory = complaintCategoryFilter === 'ALL' || c.category === complaintCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnquiryData.candidateName || !newEnquiryData.parentName || !newEnquiryData.phone) return;
    store.addFrontOfficeEnquiry(newEnquiryData);
    setShowAddEnquiryModal(false);
    setNewEnquiryData({
      candidateName: '',
      appliedClass: 'Class 9',
      parentName: '',
      phone: '',
      email: '',
      source: 'Walk-in',
      status: 'New',
      date: new Date().toISOString().slice(0, 10),
      followUpDate: '2025-05-02',
      assignedTo: 'Admission Desk Counselor',
      notes: ''
    });
  };

  const handleAddVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorData.visitorName || !newVisitorData.phone) return;
    const added = store.addVisitorLog(newVisitorData);
    setShowAddVisitorModal(false);
    setActiveVisitorPass(added);
  };

  const handleAddComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintData.title || !newComplaintData.complainantName || !newComplaintData.description) return;
    store.addComplaint(newComplaintData);
    setShowAddComplaintModal(false);
    setNewComplaintData({
      title: '',
      complainantName: '',
      complainantRole: 'Parent',
      category: 'Academics',
      priority: 'MEDIUM',
      date: new Date().toISOString().slice(0, 10),
      assignedTo: 'Academic Coordinator',
      status: 'PENDING',
      description: ''
    });
  };

  const handleResolveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintForResolve) return;
    store.updateComplaintStatus(selectedComplaintForResolve.id, 'RESOLVED', resolutionRemarks);
    setSelectedComplaintForResolve(null);
    setResolutionRemarks('');
  };

  // Metrics
  const activeVisitorsCount = visitorLogs.filter(v => v.status === 'IN_PREMISES').length;
  const pendingTicketsCount = complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_INVESTIGATION').length;
  const totalEnquiriesCount = frontOfficeEnquiries.length;
  const convertedEnquiries = frontOfficeEnquiries.filter(e => e.status === 'Enrolled' || e.status === 'Approved').length;

  return (
    <div id="front-office-module" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Front Office & Visitor Reception Desk</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Admission enquiries CRM pipeline, gate security visitor passes, and institutional grievance tickets
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'enquiries' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Enquiries CRM ({totalEnquiriesCount})
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'visitors' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Visitor Gate Passes</span>
            {activeVisitorsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'complaints' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Helpdesk & Tickets</span>
            {pendingTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
                {pendingTicketsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Inquiries Received</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalEnquiriesCount}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Current Academic Year</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Admission Conversion</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {totalEnquiriesCount > 0 ? Math.round((convertedEnquiries / totalEnquiriesCount) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">{convertedEnquiries} Approved / Enrolled</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Visitors Currently on Campus</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1 flex items-center gap-2">
            <span>{activeVisitorsCount}</span>
            <span className="text-xs font-normal text-slate-500">active badges</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Security Gate Checked-in</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Open Grievance Tickets</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingTicketsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Awaiting Resolution</div>
        </div>
      </div>

      {/* TAB 1: ENQUIRIES CRM */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search candidate, enquiry #, parent, or phone..."
                  value={enquirySearch}
                  onChange={e => setEnquirySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={enquiryStatusFilter}
                onChange={e => setEnquiryStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Application">Application</option>
                <option value="Interview">Interview</option>
                <option value="Approved">Approved</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddEnquiryModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Inquiry</span>
            </button>
          </div>

          {/* Enquiries Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Inquiry No</th>
                    <th className="py-3 px-4">Candidate & Class</th>
                    <th className="py-3 px-4">Parent / Guardian</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Date & Follow-up</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEnquiries.map(enq => (
                    <tr key={enq.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-slate-800">{enq.enquiryNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{enq.candidateName}</div>
                        <div className="text-[11px] text-blue-600 font-semibold">{enq.appliedClass}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{enq.parentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono-tech">{enq.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {enq.source}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600">{enq.date}</div>
                        {enq.followUpDate && (
                          <div className="text-[11px] text-amber-600 font-semibold flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Next: {enq.followUpDate}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{enq.assignedTo}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={enq.status}
                          onChange={e => store.updateEnquiryStatus(enq.id, e.target.value as FrontOfficeEnquiry['status'])}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md border ${
                            enq.status === 'Enrolled' || enq.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            enq.status === 'Interview' || enq.status === 'Application' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            enq.status === 'Follow-up' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            enq.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Application">Application</option>
                          <option value="Interview">Interview</option>
                          <option value="Approved">Approved</option>
                          <option value="Enrolled">Enrolled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Counselor Notes:\n${enq.notes || 'No specific notes recorded yet.'}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                        >
                          View Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEnquiries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No admission inquiries found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISITOR GATE PASSES */}
      {activeTab === 'visitors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search visitor name, pass #, meeting with..."
                  value={visitorSearch}
                  onChange={e => setVisitorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={visitorStatusFilter}
                onChange={e => setVisitorStatusFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="ALL">All Visitors</option>
                <option value="IN_PREMISES">In Premises Only</option>
                <option value="CHECKED_OUT">Checked Out</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddVisitorModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Visitor Pass</span>
            </button>
          </div>

          {/* Visitors Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Pass Number</th>
                    <th className="py-3 px-4">Visitor Name & Phone</th>
                    <th className="py-3 px-4">Meeting With</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Check-out Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredVisitors.map(vis => (
                    <tr key={vis.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-slate-800">{vis.passNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{vis.visitorName}</div>
                        <div className="text-[11px] text-slate-500 font-mono-tech">{vis.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{vis.meetingWith}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={vis.purpose}>{vis.purpose}</td>
                      <td className="py-3.5 px-4 font-mono-tech text-slate-700">{vis.checkInTime}</td>
                      <td className="py-3.5 px-4 font-mono-tech text-slate-700">{vis.checkOutTime || '—'}</td>
                      <td className="py-3.5 px-4">
                        {vis.status === 'IN_PREMISES' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            In Premises
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Checked Out
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {vis.status === 'IN_PREMISES' && (
                          <button
                            onClick={() => store.checkoutVisitor(vis.id)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded font-semibold text-[11px] transition"
                          >
                            Check Out
                          </button>
                        )}
                        <button
                          onClick={() => setActiveVisitorPass(vis)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition"
                        >
                          Print Badge
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No visitor records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HELPDESK & GRIEVANCES */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search grievance title, ticket #, or complainant..."
                  value={complaintSearch}
                  onChange={e => setComplaintSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={complaintCategoryFilter}
                onChange={e => setComplaintCategoryFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="Academics">Academics</option>
                <option value="Transport">Transport</option>
                <option value="Hostel">Hostel</option>
                <option value="Fee/Accounts">Fee/Accounts</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Behavior">Behavior</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddComplaintModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Grievance Ticket</span>
            </button>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ticket No</th>
                    <th className="py-3 px-4">Subject & Description</th>
                    <th className="py-3 px-4">Complainant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assigned Desk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredComplaints.map(comp => (
                    <tr key={comp.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-slate-800">{comp.ticketNo}</td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-900">{comp.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{comp.description}</div>
                        {comp.resolutionRemarks && (
                          <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1 rounded mt-1">
                            <strong>Resolution:</strong> {comp.resolutionRemarks}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{comp.complainantName}</div>
                        <div className="text-[10px] text-slate-400">{comp.complainantRole}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {comp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          comp.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          comp.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {comp.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{comp.assignedTo}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          comp.status === 'RESOLVED' || comp.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                          comp.status === 'IN_INVESTIGATION' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {comp.status !== 'RESOLVED' && comp.status !== 'CLOSED' && (
                          <button
                            onClick={() => {
                              setSelectedComplaintForResolve(comp);
                              setResolutionRemarks('');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                          >
                            Resolve Ticket
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredComplaints.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No helpdesk tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD ENQUIRY */}
      {showAddEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Log Admission Inquiry</h2>
              <button onClick={() => setShowAddEnquiryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEnquirySubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={newEnquiryData.candidateName}
                    onChange={e => setNewEnquiryData({ ...newEnquiryData, candidateName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="e.g. Aryan Malhotra"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Applied Class *</label>
                  <select
                    value={newEnquiryData.appliedClass}
                    onChange={e => setNewEnquiryData({ ...newEnquiryData, appliedClass: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11 (Science)">Class 11 (Science)</option>
                    <option value="Class 11 (Commerce)">Class 11 (Commerce)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={newEnquiryData.parentName}
                    onChange={e => setNewEnquiryData({ ...newEnquiryData, parentName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="e.g. Rajesh Malhotra"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={newEnquiryData.phone}
                    onChange={e => setNewEnquiryData({ ...newEnquiryData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="+91 98112 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Lead Source</label>
                  <select
                    value={newEnquiryData.source}
                    onChange={e => setNewEnquiryData({ ...newEnquiryData, source: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Online">Online Form</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Referral">Parent Referral</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Follow-up Target Date</label>
                  <input
                    type="date"
                    value={newEnquiryData.followUpDate}
                    onChange={e => setNewEnquiryData({ ...newEnquiryData, followUpDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Initial Counselor Notes</label>
                <textarea
                  rows={3}
                  value={newEnquiryData.notes}
                  onChange={e => setNewEnquiryData({ ...newEnquiryData, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="Details regarding candidate academic background, extracurricular interests, transport/hostel requirements..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddEnquiryModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE VISITOR PASS */}
      {showAddVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Issue Gate Visitor Pass</h2>
              <button onClick={() => setShowAddVisitorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitorSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newVisitorData.visitorName}
                    onChange={e => setNewVisitorData({ ...newVisitorData, visitorName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="e.g. Ramesh Chandra"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={newVisitorData.phone}
                    onChange={e => setNewVisitorData({ ...newVisitorData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="+91 98110 00000"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Meeting With / Staff Member *</label>
                <input
                  type="text"
                  required
                  value={newVisitorData.meetingWith}
                  onChange={e => setNewVisitorData({ ...newVisitorData, meetingWith: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="e.g. Dr. Rajeshwar Sharma (Principal)"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={newVisitorData.purpose}
                  onChange={e => setNewVisitorData({ ...newVisitorData, purpose: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="e.g. Parent-teacher consultation regarding term test"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">ID Proof Presented</label>
                  <input
                    type="text"
                    value={newVisitorData.idProof}
                    onChange={e => setNewVisitorData({ ...newVisitorData, idProof: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="e.g. Aadhaar Card / Driving License"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Check-in Time</label>
                  <input
                    type="text"
                    value={newVisitorData.checkInTime}
                    onChange={e => setNewVisitorData({ ...newVisitorData, checkInTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono-tech"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddVisitorModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Generate Pass & Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE VISITOR PASS MODAL */}
      {activeVisitorPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setActiveVisitorPass(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-2 border-dashed border-blue-500 p-5 rounded-xl bg-blue-50/20 text-center space-y-3">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                {schoolProfile.name}
              </div>
              <h3 className="text-lg font-bold text-slate-900">OFFICIAL VISITOR PASS</h3>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-left space-y-1.5 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Pass Number:</span>
                  <span className="font-mono-tech font-bold text-blue-600">{activeVisitorPass.passNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Visitor:</span>
                  <span className="font-bold text-slate-800">{activeVisitorPass.visitorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile:</span>
                  <span className="font-mono-tech text-slate-700">{activeVisitorPass.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Meeting:</span>
                  <span className="font-semibold text-slate-900">{activeVisitorPass.meetingWith}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose:</span>
                  <span className="text-slate-700 truncate max-w-[180px]">{activeVisitorPass.purpose}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-slate-500">Check-in:</span>
                  <span className="font-mono-tech font-bold text-emerald-700">{activeVisitorPass.checkInTime}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 italic">
                * Please wear this pass visibly at all times while on institutional grounds. Surrender pass at main security gate upon exit.
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setActiveVisitorPass(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE COMPLAINT MODAL */}
      {selectedComplaintForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Resolve Grievance Ticket</h2>
              <button onClick={() => setSelectedComplaintForResolve(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveComplaint} className="space-y-4 pt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">{selectedComplaintForResolve.title}</div>
                <div className="text-slate-500">{selectedComplaintForResolve.description}</div>
                <div className="text-[10px] text-blue-600 font-mono-tech mt-1">Ticket: {selectedComplaintForResolve.ticketNo}</div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Resolution Actions & Remarks *</label>
                <textarea
                  required
                  rows={4}
                  value={resolutionRemarks}
                  onChange={e => setResolutionRemarks(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="Detail the investigation outcomes, corrective actions implemented, and communication sent to the complainant..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintForResolve(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG GRIEVANCE TICKET */}
      {showAddComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Log Helpdesk Grievance Ticket</h2>
              <button onClick={() => setShowAddComplaintModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddComplaintSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Ticket Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={newComplaintData.title}
                  onChange={e => setNewComplaintData({ ...newComplaintData, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="e.g. Bus Route 03 Delayed without notification"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Complainant Name *</label>
                  <input
                    type="text"
                    required
                    value={newComplaintData.complainantName}
                    onChange={e => setNewComplaintData({ ...newComplaintData, complainantName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="e.g. Deepak Saxena"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Complainant Role</label>
                  <select
                    value={newComplaintData.complainantRole}
                    onChange={e => setNewComplaintData({ ...newComplaintData, complainantRole: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Student">Student</option>
                    <option value="Staff">Faculty / Staff</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Category</label>
                  <select
                    value={newComplaintData.category}
                    onChange={e => setNewComplaintData({ ...newComplaintData, category: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Academics">Academics</option>
                    <option value="Transport">Transport</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Fee/Accounts">Fee/Accounts</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Behavior">Student Behavior</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Severity / Priority</label>
                  <select
                    value={newComplaintData.priority}
                    onChange={e => setNewComplaintData({ ...newComplaintData, priority: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Description & Incident Facts *</label>
                <textarea
                  required
                  rows={3}
                  value={newComplaintData.description}
                  onChange={e => setNewComplaintData({ ...newComplaintData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="Provide precise time, location, persons involved, and specific grievance details..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddComplaintModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
