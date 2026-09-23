import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  CheckCircle, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Award,
  Sparkles,
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';

export const SettingsModule: React.FC = () => {
  const { state, store } = useERP();
  const { schoolProfile, students, staff, invoices, auditLogs, users, lastBackupDate } = state;

  const [activeTab, setActiveTab] = useState<'profile' | 'backup'>('profile');
  const [formData, setFormData] = useState({ ...schoolProfile });
  const [isSaved, setIsSaved] = useState(false);

  // Backup & Restore state
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSchoolProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDownloadBackup = () => {
    store.downloadDatabaseBackup();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const res = store.restoreDatabaseBackup(jsonContent);
        if (res.success) {
          setRestoreStatus({
            success: true,
            message: `Successfully restored database from backup (${res.metadata?.institutionName || 'Institutional ERP'}, dated ${res.metadata?.timestamp || 'unknown'}).`
          });
        } else {
          setRestoreStatus({
            success: false,
            message: res.error || 'Failed to restore backup package.'
          });
        }
      } catch (err: any) {
        setRestoreStatus({
          success: false,
          message: `Error reading backup file: ${err.message}`
        });
      } finally {
        setIsRestoring(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Profile & Settings</h1>
            {isSaved && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure official institution letterhead details, licenses, and enterprise data backup & recovery.
          </p>
        </div>

        {activeTab === 'profile' && (
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        )}
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institutional Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'backup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Data Recovery Utility</span>
        </button>
      </div>

      {/* Tab 1: Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Official School Identity</h3>
            <p className="text-slate-500 text-[11px] mb-4">
              These parameters appear dynamically on all generated ID cards, fee receipts, bonafide certificates, and progress report cards.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Board Affiliation / License #</label>
                  <input
                    type="text"
                    value={formData.affiliationNo}
                    onChange={e => setFormData({ ...formData, affiliationNo: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono-tech outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Academic Session</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono-tech outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head of School / Principal</label>
                  <input
                    type="text"
                    value={formData.principal}
                    onChange={e => setFormData({ ...formData, principal: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono-tech outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Official Contact & Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Reception Telephone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono-tech outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Administrative Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20 text-xs cursor-pointer"
            >
              Apply & Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Backup & Data Recovery Utility */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institutional Database Backup & Disaster Recovery</h3>
                <p className="text-slate-500 text-[11px]">
                  Comply with statutory data retention and recovery requirements by downloading periodic encrypted backups or restoring from archive snapshots.
                </p>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg font-mono text-[11px] font-bold border border-emerald-200/60 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Last Backup: {lastBackupDate || 'Never'}</span>
              </div>
            </div>

            {/* Database Statistics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <div className="text-lg font-bold text-slate-900 font-mono">{(students || []).length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Student Records</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <div className="text-lg font-bold text-slate-900 font-mono">{(staff || []).length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Staff Members</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <div className="text-lg font-bold text-slate-900 font-mono">{(invoices || []).length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Fee Invoices</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <div className="text-lg font-bold text-slate-900 font-mono">{(users || []).length}</div>
                <div className="text-[11px] text-slate-500 font-medium">User Accounts</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <div className="text-lg font-bold text-slate-900 font-mono">{(auditLogs || []).length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Audit Trail Logs</div>
              </div>
            </div>

            {restoreStatus && (
              <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs ${
                restoreStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {restoreStatus.success ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
                <div className="font-medium">{restoreStatus.message}</div>
              </div>
            )}

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Export Backup Card */}
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm">
                    <Download className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Export Manual Backup (.erpbackup)</h4>
                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                    Downloads an immediate, cryptographically stamped JSON backup archive containing all institutional records, student profiles, accounts, and audit histories.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup Archive</span>
                </button>
              </div>

              {/* Restore Backup Card */}
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Restore Database from Backup File</h4>
                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                    Upload a previously generated <code className="font-mono text-amber-800">.erpbackup</code> file to restore the entire ERP state and resume operations.
                  </p>
                </div>

                <div>
                  <label className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-amber-600/20 transition flex items-center justify-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{isRestoring ? 'Restoring Database...' : 'Select Backup File & Restore'}</span>
                    <input
                      type="file"
                      accept=".erpbackup,.json"
                      onChange={handleFileUpload}
                      disabled={isRestoring}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
