import React, { useState } from 'react';
import { 
  HeartHandshake, 
  FileCheck, 
  HeartPulse, 
  ShieldAlert, 
  GraduationCap, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Phone,
  User,
  Building,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { CertificateRecord, HealthRecord, DisciplineIncident, AlumniRecord } from '../../types';

export const StudentWelfareModule: React.FC = () => {
  const { 
    certificates, 
    healthRecords, 
    disciplineIncidents, 
    alumni, 
    students, 
    schoolProfile, 
    store 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'certificates' | 'health' | 'discipline' | 'alumni'>('certificates');

  // Certificate State
  const [certSearch, setCertSearch] = useState('');
  const [certTypeFilter, setCertTypeFilter] = useState('ALL');
  const [showGenerateCertModal, setShowGenerateCertModal] = useState(false);
  const [activeCertPreview, setActiveCertPreview] = useState<CertificateRecord | null>(null);
  const [newCertData, setNewCertData] = useState<{
    studentId: string;
    type: CertificateRecord['type'];
    purpose: string;
    issuedBy: string;
  }>({
    studentId: students[0]?.id || '',
    type: 'Bonafide',
    purpose: 'Passport / Higher Education Verification',
    issuedBy: 'Principal Office'
  });

  // Health State
  const [healthSearch, setHealthSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');

  // Discipline State
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);
  const [newIncidentData, setNewIncidentData] = useState<{
    studentId: string;
    incidentType: DisciplineIncident['incidentType'];
    date: string;
    severity: DisciplineIncident['severity'];
    description: string;
    actionTaken: string;
    reportedBy: string;
    parentNotified: boolean;
    status: DisciplineIncident['status'];
  }>({
    studentId: students[0]?.id || '',
    incidentType: 'Misconduct',
    date: new Date().toISOString().slice(0, 10),
    severity: 'LOW',
    description: 'Classroom disturbance and improper attire during morning assembly.',
    actionTaken: 'Verbal warning and written reflection submitted to Class Teacher.',
    reportedBy: 'Mr. Arvind Verma',
    parentNotified: true,
    status: 'RESOLVED'
  });

  // Alumni State
  const [alumniSearch, setAlumniSearch] = useState('');
  const [alumniBatchFilter, setAlumniBatchFilter] = useState('ALL');
  const [showAddAlumniModal, setShowAddAlumniModal] = useState(false);
  const [newAlumniData, setNewAlumniData] = useState<{
    studentName: string;
    admissionNo: string;
    passingYear: number;
    currentOccupation: string;
    companyOrCollege: string;
    higherEducation: string;
    email: string;
    phone: string;
    city: string;
    willingToMentor: boolean;
  }>({
    studentName: '',
    admissionNo: 'ADM-ALM-' + Math.floor(1000 + Math.random() * 9000),
    passingYear: 2021,
    currentOccupation: 'Software Development Engineer',
    companyOrCollege: 'Google India',
    higherEducation: 'B.Tech in Computer Science',
    email: '',
    phone: '',
    city: 'Bengaluru',
    willingToMentor: true
  });

  // Filtered Certificates
  const filteredCerts = certificates.filter(c => {
    const matchesSearch = 
      c.studentName.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.certNo.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.admissionNo.toLowerCase().includes(certSearch.toLowerCase());
    const matchesType = certTypeFilter === 'ALL' || c.type === certTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filtered Health
  const filteredHealth = healthRecords.filter(h => {
    const matchesSearch = 
      h.studentName.toLowerCase().includes(healthSearch.toLowerCase()) ||
      h.admissionNo.toLowerCase().includes(healthSearch.toLowerCase()) ||
      h.allergies.some(a => a.toLowerCase().includes(healthSearch.toLowerCase()));
    const matchesBlood = bloodGroupFilter === 'ALL' || h.bloodGroup === bloodGroupFilter;
    return matchesSearch && matchesBlood;
  });

  // Filtered Discipline
  const filteredDiscipline = disciplineIncidents.filter(d => {
    const matchesSearch = 
      d.studentName.toLowerCase().includes(disciplineSearch.toLowerCase()) ||
      d.incidentType.toLowerCase().includes(disciplineSearch.toLowerCase()) ||
      d.caseNo.toLowerCase().includes(disciplineSearch.toLowerCase());
    return matchesSearch;
  });

  // Filtered Alumni
  const filteredAlumni = alumni.filter(a => {
    const matchesSearch = 
      a.studentName.toLowerCase().includes(alumniSearch.toLowerCase()) ||
      a.companyOrCollege.toLowerCase().includes(alumniSearch.toLowerCase()) ||
      a.currentOccupation.toLowerCase().includes(alumniSearch.toLowerCase()) ||
      (a.city && a.city.toLowerCase().includes(alumniSearch.toLowerCase()));
    const matchesBatch = alumniBatchFilter === 'ALL' || String(a.passingYear) === alumniBatchFilter;
    return matchesSearch && matchesBatch;
  });

  const handleGenerateCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === newCertData.studentId);
    if (!st) return;

    const cert = store.generateCertificate({
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      admissionNo: st.admissionNo,
      className: st.className,
      type: newCertData.type,
      purpose: newCertData.purpose,
      issuedBy: newCertData.issuedBy
    });

    setShowGenerateCertModal(false);
    setActiveCertPreview(cert);
  };

  const handleAddIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === newIncidentData.studentId);
    if (!st) return;

    store.addDisciplineIncident({
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      className: st.className,
      incidentType: newIncidentData.incidentType,
      date: newIncidentData.date,
      severity: newIncidentData.severity,
      description: newIncidentData.description,
      actionTaken: newIncidentData.actionTaken,
      reportedBy: newIncidentData.reportedBy,
      parentNotified: newIncidentData.parentNotified,
      status: newIncidentData.status
    });

    setShowAddIncidentModal(false);
  };

  const handleAddAlumniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlumniData.studentName) return;

    store.addAlumniRecord(newAlumniData);
    setShowAddAlumniModal(false);
    setNewAlumniData({
      studentName: '',
      admissionNo: 'ADM-ALM-' + Math.floor(1000 + Math.random() * 9000),
      passingYear: 2021,
      currentOccupation: 'Software Development Engineer',
      companyOrCollege: 'Google India',
      higherEducation: 'B.Tech in Computer Science',
      email: '',
      phone: '',
      city: 'Bengaluru',
      willingToMentor: true
    });
  };

  return (
    <div id="student-welfare-module" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Welfare & Institutional Life</h1>
            <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Holistic Care
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional certifications, clinic medical logs, positive behavioral records, and alumni network
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {activeTab === 'certificates' && (
            <button
              onClick={() => setShowGenerateCertModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Certificate</span>
            </button>
          )}

          {activeTab === 'discipline' && (
            <button
              onClick={() => setShowAddIncidentModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Discipline Record</span>
            </button>
          )}

          {activeTab === 'alumni' && (
            <button
              onClick={() => setShowAddAlumniModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Alumni</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'certificates'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Certificates & TC ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'health'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Infirmary & Health ({healthRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('discipline')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'discipline'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Discipline & Conduct ({disciplineIncidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alumni')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'alumni'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Alumni Association ({alumni.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: CERTIFICATES & TC */}
      {/* ============================================================ */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search certificate no, student, admission..."
                value={certSearch}
                onChange={e => setCertSearch(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Type:</span>
              <select
                value={certTypeFilter}
                onChange={e => setCertTypeFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="Bonafide">Bonafide Certificate</option>
                <option value="Transfer">Transfer Certificate</option>
                <option value="Character">Character Certificate</option>
                <option value="Study">Study Certificate</option>
                <option value="Sports Achievement">Sports Achievement</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Certificate No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Signed Authority</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCerts.map(cert => (
                    <tr key={cert.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-blue-700">{cert.certNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cert.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono-tech">Adm: {cert.admissionNo} • {cert.className}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cert.type === 'Transfer' ? 'bg-amber-100 text-amber-800' :
                          cert.type === 'Bonafide' ? 'bg-blue-100 text-blue-800' :
                          cert.type === 'Sports Achievement' ? 'bg-purple-100 text-purple-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {cert.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{cert.purpose}</td>
                      <td className="py-3.5 px-4 font-mono-tech text-slate-700">{cert.issueDate}</td>
                      <td className="py-3.5 px-4 text-slate-700">{cert.issuedBy}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveCertPreview(cert)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition"
                        >
                          View Certificate
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
      {/* TAB 2: HEALTH & INFIRMARY */}
      {/* ============================================================ */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search by student, admission, allergy..."
                value={healthSearch}
                onChange={e => setHealthSearch(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Blood Group:</span>
              <select
                value={bloodGroupFilter}
                onChange={e => setBloodGroupFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHealth.map(h => (
              <div key={h.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{h.studentName}</h3>
                      <div className="text-[11px] text-slate-500 font-mono-tech">Adm: {h.admissionNo} • {h.className}</div>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center font-mono-tech text-xs border border-rose-200">
                      {h.bloodGroup}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Allergies / Sensitivities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {h.allergies.map((all, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${all.toLowerCase().includes('none') ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-700'}`}>
                            {all}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Chronic Conditions:</span>
                      <span className="font-medium text-slate-700">{h.chronicConditions.join(', ')}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Doctor's Notes:</span>
                      <span className="text-slate-600 italic">{h.doctorNotes}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Contact:</span>
                    <span className="font-semibold text-slate-800">{h.emergencyContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-mono-tech text-blue-600 font-bold">{h.emergencyPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vaccinations:</span>
                    <span className="text-emerald-700 font-bold">{h.vaccinationsStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DISCIPLINE & CONDUCT */}
      {/* ============================================================ */}
      {activeTab === 'discipline' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search case no, student, incident..."
                value={disciplineSearch}
                onChange={e => setDisciplineSearch(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Incident Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Description & Action Taken</th>
                    <th className="py-3 px-4">Parent Notified</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDiscipline.map(inc => (
                    <tr key={inc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-slate-800">{inc.caseNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{inc.studentName} ({inc.className})</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{inc.incidentType}</td>
                      <td className="py-3.5 px-4 font-mono-tech text-slate-600">{inc.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                          inc.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <div className="font-medium text-slate-800">{inc.description}</div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">{inc.actionTaken}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {inc.parentNotified ? (
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Notified
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[11px]">Pending Call</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {inc.status}
                        </span>
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
      {/* TAB 4: ALUMNI NETWORK */}
      {/* ============================================================ */}
      {activeTab === 'alumni' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search alumni name, company, city, role..."
                value={alumniSearch}
                onChange={e => setAlumniSearch(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Batch Year:</span>
              <select
                value={alumniBatchFilter}
                onChange={e => setAlumniBatchFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Batches</option>
                <option value="2023">Batch of 2023</option>
                <option value="2022">Batch of 2022</option>
                <option value="2021">Batch of 2021</option>
                <option value="2020">Batch of 2020</option>
                <option value="2019">Batch of 2019</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlumni.map(alm => (
              <div key={alm.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono-tech">
                      Class of {alm.passingYear}
                    </span>
                    {alm.willingToMentor && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Mentorship Available
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2">{alm.studentName}</h3>
                  <div className="text-xs font-semibold text-blue-600 mt-0.5">{alm.currentOccupation}</div>
                  <div className="text-xs text-slate-500">{alm.companyOrCollege} • {alm.city}</div>
                  {(alm.higherEducation || alm.degreeObtained) && (
                    <div className="text-[11px] text-slate-400 mt-1">Degree: {alm.higherEducation || alm.degreeObtained}</div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono-tech text-slate-700">{alm.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="font-mono-tech text-slate-700">{alm.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: GENERATE CERTIFICATE */}
      {/* ============================================================ */}
      {showGenerateCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Issue Institutional Certificate</h2>
              <button onClick={() => setShowGenerateCertModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateCertSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Select Student *</label>
                <select
                  value={newCertData.studentId}
                  onChange={e => setNewCertData({ ...newCertData, studentId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo}) — {s.className} ({s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Certificate Type *</label>
                  <select
                    value={newCertData.type}
                    onChange={e => setNewCertData({ ...newCertData, type: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Bonafide">Bonafide Certificate</option>
                    <option value="Transfer">Transfer Certificate (TC)</option>
                    <option value="Character">Character Certificate</option>
                    <option value="Study">Study Certificate</option>
                    <option value="Sports Achievement">Sports Achievement</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Issuing Purpose *</label>
                  <input
                    type="text"
                    required
                    value={newCertData.purpose}
                    onChange={e => setNewCertData({ ...newCertData, purpose: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="e.g. Passport / Higher Education"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Signed Authority *</label>
                <input
                  type="text"
                  required
                  value={newCertData.issuedBy}
                  onChange={e => setNewCertData({ ...newCertData, issuedBy: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="e.g. Principal Office"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateCertModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Generate & View Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PRINTABLE OFFICIAL CERTIFICATE */}
      {/* ============================================================ */}
      {activeCertPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setActiveCertPreview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Canvas */}
            <div className="border-4 border-double border-amber-900/30 p-8 rounded-xl bg-amber-50/20 text-center space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase font-serif">
                  {schoolProfile.name}
                </h2>
                <div className="text-xs text-slate-500">
                  Institutional Campus, Knowledge Park • Tel: {schoolProfile.phone}
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-amber-900/20 py-2">
                <span className="font-serif font-bold text-base tracking-widest text-amber-950 uppercase">
                  {activeCertPreview.type} Certificate
                </span>
              </div>

              <div className="text-left space-y-4 text-xs leading-relaxed font-serif">
                <div className="flex justify-between text-slate-500 font-mono-tech text-[11px]">
                  <span>Ref No: <strong>{activeCertPreview.certNo}</strong></span>
                  <span>Date of Issue: <strong>{activeCertPreview.issueDate}</strong></span>
                </div>

                <p className="indent-8 text-sm">
                  This is to certify that <strong>{activeCertPreview.studentName}</strong>, bearing 
                  Admission Number <strong>{activeCertPreview.admissionNo}</strong>, Class <strong>{activeCertPreview.className}</strong>, is / was a bonafide 
                  scholar of this institution during the academic period.
                </p>

                <p className="indent-8 text-sm">
                  Purpose of Issuance: <em>{activeCertPreview.purpose}</em>.
                </p>

                <p className="indent-8 text-sm">
                  During their tenure at our academy, their conduct, discipline, and general moral character 
                  have been found to be <strong>Satisfactory and Exemplary</strong>.
                </p>
              </div>

              {/* Seal & Signatures */}
              <div className="pt-12 grid grid-cols-3 items-end text-xs font-serif">
                <div className="text-center">
                  <div className="w-24 border-b border-slate-400 mx-auto mb-1"></div>
                  <span className="text-[11px] text-slate-600">Prepared By</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-800/40 mx-auto flex items-center justify-center text-[9px] uppercase font-bold text-amber-900/60 rotate-12">
                    Official Seal
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-slate-900 mx-auto mb-1 font-mono-tech text-xs text-slate-800">
                    {activeCertPreview.issuedBy}
                  </div>
                  <span className="text-[11px] text-slate-600 font-bold">Principal / Authority</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setActiveCertPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD DISCIPLINE RECORD */}
      {/* ============================================================ */}
      {showAddIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Log Student Disciplinary Action</h2>
              <button onClick={() => setShowAddIncidentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncidentSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Select Student *</label>
                <select
                  value={newIncidentData.studentId}
                  onChange={e => setNewIncidentData({ ...newIncidentData, studentId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo}) — {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Incident Category *</label>
                  <select
                    value={newIncidentData.incidentType}
                    onChange={e => setNewIncidentData({ ...newIncidentData, incidentType: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Academic Dishonesty">Academic Dishonesty</option>
                    <option value="Late Coming">Late Coming</option>
                    <option value="Misconduct">Misconduct</option>
                    <option value="Uniform Violation">Uniform Violation</option>
                    <option value="Vandalism">Vandalism</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Incident Severity *</label>
                  <select
                    value={newIncidentData.severity}
                    onChange={e => setNewIncidentData({ ...newIncidentData, severity: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="LOW">Low (Minor Infraction)</option>
                    <option value="MEDIUM">Medium (Repeated / Intermediate)</option>
                    <option value="HIGH">High (Severe Conduct Issue)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Detailed Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newIncidentData.description}
                  onChange={e => setNewIncidentData({ ...newIncidentData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="Detail the circumstances of the incident..."
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Action Taken / Resolution *</label>
                <input
                  type="text"
                  required
                  value={newIncidentData.actionTaken}
                  onChange={e => setNewIncidentData({ ...newIncidentData, actionTaken: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="e.g. Parental counseling convened and written reflection logged"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="parentNotifiedCheck"
                  checked={newIncidentData.parentNotified}
                  onChange={e => setNewIncidentData({ ...newIncidentData, parentNotified: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="parentNotifiedCheck" className="text-slate-700 font-medium">
                  Parents / Guardian have been notified telephonically or in person
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddIncidentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
                >
                  Save Discipline Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD ALUMNI */}
      {/* ============================================================ */}
      {showAddAlumniModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Register School Alumni</h2>
              <button onClick={() => setShowAddAlumniModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAlumniSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Alumnus Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newAlumniData.studentName}
                    onChange={e => setNewAlumniData({ ...newAlumniData, studentName: e.target.value })}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Passing Year *</label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    required
                    value={newAlumniData.passingYear}
                    onChange={e => setNewAlumniData({ ...newAlumniData, passingYear: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono-tech"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Current Occupation / Role *</label>
                  <input
                    type="text"
                    required
                    value={newAlumniData.currentOccupation}
                    onChange={e => setNewAlumniData({ ...newAlumniData, currentOccupation: e.target.value })}
                    placeholder="e.g. Research Scientist"
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Organization / University *</label>
                  <input
                    type="text"
                    required
                    value={newAlumniData.companyOrCollege}
                    onChange={e => setNewAlumniData({ ...newAlumniData, companyOrCollege: e.target.value })}
                    placeholder="e.g. AIIMS Delhi"
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newAlumniData.email}
                    onChange={e => setNewAlumniData({ ...newAlumniData, email: e.target.value })}
                    placeholder="alumni@example.com"
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono-tech"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Current City</label>
                  <input
                    type="text"
                    value={newAlumniData.city}
                    onChange={e => setNewAlumniData({ ...newAlumniData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="mentorCheck"
                  checked={newAlumniData.willingToMentor}
                  onChange={e => setNewAlumniData({ ...newAlumniData, willingToMentor: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="mentorCheck" className="text-slate-700 font-medium">
                  Willing to mentor current high-school students in career pathways
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAlumniModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Register Alumnus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
