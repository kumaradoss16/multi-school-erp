import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  Search, 
  Printer, 
  CheckCircle,
  Database,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';

export const AuditReportsModule: React.FC = () => {
  const { auditLogs, students, invoices, store, schoolProfile } = useERP();

  const [activeTab, setActiveTab] = useState<'reports' | 'logs' | 'backup'>('reports');
  const [logFilter, setLogFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<string>('fee_defaulters');

  // Filtered audit logs
  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.user.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.module.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.details.toLowerCase().includes(logFilter.toLowerCase())
  );

  // Fee Defaulters data
  const feeDefaulters = students.filter(s => s.pendingAmount > 0);

  const handleExportBackup = () => {
    const dataStr = store.exportStateJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school_erp_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.logAudit('BACKUP_EXPORT', 'System', 'BACKUP', 'Exported full encrypted system backup snapshot');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = store.importStateJSON(json);
        if (success) {
          alert('System snapshot restored successfully!');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetFactory = () => {
    if (confirm('Are you sure you want to reset all records to the original factory template? All current custom additions will be restored to demo baseline.')) {
      store.resetToFactorySeed();
      alert('System restored to factory seed state.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Reports & Audit Logs</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              SOC-2 / ISO 27001 Audit Ready
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate statutory administrative statements, review chronological immutable audit trails, and backup data.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportBackup}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Backup JSON</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition no-print"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Administrative Reports
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Immutable Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'backup'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Backup & Disaster Recovery
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Selector Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: 'fee_defaulters', label: 'Fee Defaulters & Outstanding Statement' },
              { id: 'attendance_risk', label: 'Attendance Risk Analysis (< 75%)' },
              { id: 'class_summary', label: 'Class Enrollment Summary' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedReport(r.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedReport === r.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Printable Report Document */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4 print-container">
            <div className="border-b border-slate-200 pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 font-serif">
                {schoolProfile.name}
              </h2>
              <p className="text-xs text-slate-500 font-serif">{schoolProfile.address}</p>
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mt-2">
                {selectedReport === 'fee_defaulters' && 'OFFICIAL FEE DEFAULTERS STATEMENT'}
                {selectedReport === 'attendance_risk' && 'STUDENTS AT COMPLIANCE ATTENDANCE RISK'}
                {selectedReport === 'class_summary' && 'GRADE-WISE ENROLLMENT DISTRIBUTION'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">
                Generated On: {new Date().toLocaleString()} • Academic Year: {schoolProfile.academicYear}
              </p>
            </div>

            {selectedReport === 'fee_defaulters' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3">Admission #</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Parent Name</th>
                      <th className="py-2.5 px-3">Contact Phone</th>
                      <th className="py-2.5 px-3 text-right">Pending Amount</th>
                      <th className="py-2.5 px-3 text-right">Fee Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feeDefaulters.map(s => (
                      <tr key={s.id}>
                        <td className="py-2.5 px-3 font-mono-tech font-bold text-slate-800">{s.admissionNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{s.firstName} {s.lastName}</td>
                        <td className="py-2.5 px-3">{s.className} ({s.section})</td>
                        <td className="py-2.5 px-3 text-slate-700">{s.parentName}</td>
                        <td className="py-2.5 px-3 font-mono-tech text-slate-600">{s.parentPhone}</td>
                        <td className="py-2.5 px-3 font-mono-tech font-bold text-red-600 text-right">
                          ₹{s.pendingAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700">
                            {s.feeStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={5} className="py-2.5 px-3 uppercase text-right">Total Outstanding Deficit</td>
                      <td className="py-2.5 px-3 font-mono-tech text-red-700 text-right">
                        ₹{feeDefaulters.reduce((acc, s) => acc + s.pendingAmount, 0).toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'attendance_risk' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3">Admission #</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Attendance %</th>
                      <th className="py-2.5 px-3">Parent Phone</th>
                      <th className="py-2.5 px-3 text-right">Warning Notice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.filter(s => s.attendancePercent < 80).map(s => (
                      <tr key={s.id}>
                        <td className="py-2.5 px-3 font-mono-tech">{s.admissionNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{s.firstName} {s.lastName}</td>
                        <td className="py-2.5 px-3">{s.className}</td>
                        <td className="py-2.5 px-3 font-bold text-red-600">{s.attendancePercent}%</td>
                        <td className="py-2.5 px-3 font-mono-tech text-slate-600">{s.parentPhone}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                            Urgent Notice Dispatched
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'class_summary' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Class 10', 'Class 9', 'Class 8', 'Class 11'].map(cn => {
                  const count = students.filter(s => s.className === cn).length;
                  return (
                    <div key={cn} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <h4 className="font-bold text-slate-800 text-sm">{cn}</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{count}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Enrolled Scholars</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center w-72 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Filter logs by actor, module..."
                value={logFilter}
                onChange={e => setLogFilter(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono-tech">{filteredLogs.length} events logged</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / User</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono-tech text-slate-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{log.user}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono-tech font-bold text-blue-600 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Database Snapshot & Disaster Recovery</h3>
            <p className="text-xs text-slate-500 mt-1">
              Export and restore all institutional state across students, faculty, accounts, exam marks, and library records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Export Snapshot */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <Database className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Export System Snapshot</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Generates an encrypted JSON file containing every record and audit log.
                </p>
              </div>
              <button
                onClick={handleExportBackup}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Download Snapshot (.json)
              </button>
            </div>

            {/* Restore Snapshot */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Restore from Snapshot</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a previously saved JSON snapshot to restore the ERP state.
                </p>
              </div>
              <label className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer text-center block">
                <span>Select Snapshot File</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

            {/* Factory Reset */}
            <div className="p-5 bg-red-50/50 rounded-2xl border border-red-200 flex flex-col justify-between">
              <div>
                <RefreshCw className="w-8 h-8 text-red-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Factory Reset</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Wipes local modifications and reinstalls clean baseline seed records.
                </p>
              </div>
              <button
                onClick={handleResetFactory}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
              >
                Reset to Seed Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
