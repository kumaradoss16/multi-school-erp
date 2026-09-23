import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Eye, 
  Save, 
  Check, 
  QrCode, 
  Smartphone, 
  Mail, 
  Printer,
  CreditCard
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { TemplateConfig, TemplateCategory } from '../../types';
import { ConfigurationService } from '../../services/configurationService';

export const TemplateManager: React.FC = () => {
  const { templates, schoolBranding, schoolProfile, store } = useERP();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('CERTIFICATE');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.find(t => t.category === 'CERTIFICATE')?.id || templates[0]?.id || ''
  );
  const [saveToast, setSaveToast] = useState(false);

  const filteredTemplates = templates.filter(t => t.category === selectedCategory);
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || filteredTemplates[0] || templates[0];

  const [workingTemplate, setWorkingTemplate] = useState<TemplateConfig>(activeTemplate);

  React.useEffect(() => {
    if (activeTemplate) {
      setWorkingTemplate(activeTemplate);
    }
  }, [activeTemplate]);

  const categoryList: { id: TemplateCategory; label: string; icon: any }[] = [
    { id: 'CERTIFICATE', label: 'Certificates & Diplomas', icon: FileText },
    { id: 'ID_CARD', label: 'Student & Staff ID Cards', icon: CreditCard },
    { id: 'RECEIPT', label: 'Fee Receipts', icon: Printer },
    { id: 'INVOICE', label: 'Billing Invoices', icon: Printer },
    { id: 'SMS', label: 'SMS Gateway Alerts', icon: Smartphone },
    { id: 'WHATSAPP', label: 'WhatsApp Reminders', icon: Smartphone },
    { id: 'EMAIL', label: 'Email Notifications', icon: Mail }
  ];

  const availableVariables = [
    '{{student_name}}', '{{admission_no}}', '{{class_name}}', 
    '{{parent_name}}', '{{school_name}}', '{{academic_year}}', 
    '{{date}}', '{{fee_amount}}', '{{issue_date}}', '{{receipt_no}}', 
    '{{exam_name}}', '{{dob}}', '{{bus_route}}', '{{blood_group}}'
  ];

  const insertVariable = (variable: string) => {
    setWorkingTemplate({
      ...workingTemplate,
      contentBody: (workingTemplate.contentBody || '') + ' ' + variable
    });
  };

  const handleSave = () => {
    store.saveTemplate(workingTemplate);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Sample data payload for live interpolation
  const sampleData = {
    student_name: 'Aarav Sharma',
    admission_no: 'STU-2025-0012',
    class_name: 'Grade 10-A',
    parent_name: 'Rajesh Sharma',
    school_name: schoolBranding.schoolName || schoolProfile.name,
    academic_year: '2024-2025',
    date: new Date().toLocaleDateString('en-GB'),
    fee_amount: '₹ 24,500',
    issue_date: new Date().toLocaleDateString('en-GB'),
    receipt_no: 'REC-2025-0142',
    exam_name: 'Annual Board Examination 2025',
    dob: '14/08/2009',
    bus_route: 'Route 4 (Green Valley Express)',
    blood_group: 'O+ve'
  };

  const interpolatedPreview = ConfigurationService.interpolateTemplate(
    workingTemplate?.contentBody || '',
    sampleData
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Document & Notification Template Studio</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Visual template editor for CBSE transfer certificates, smart ID cards, fee challans, and SMS/WhatsApp notifications.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            {saveToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saveToast ? 'Template Saved!' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categoryList.map((cat) => {
          const Icon = cat.icon;
          const count = templates.filter(t => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                const first = templates.find(t => t.category === cat.id);
                if (first) setSelectedTemplateId(first.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded ${
                selectedCategory === cat.id ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split: Template List & Editor on Left, Live Render Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Template Selector & Editor */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Template Blueprint Configuration</h3>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {filteredTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
              ))}
            </select>
          </div>

          {workingTemplate && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={workingTemplate.name}
                  onChange={(e) => setWorkingTemplate({ ...workingTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Dynamic Variables Chips Shelf */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Insert Dynamic Data Variable (Click to Append)
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                  {availableVariables.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-[11px] font-mono-tech font-semibold text-slate-700 shadow-xs transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Content / HTML */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Body Content / HTML</label>
                <textarea
                  rows={9}
                  value={workingTemplate.contentBody}
                  onChange={(e) => setWorkingTemplate({ ...workingTemplate, contentBody: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workingTemplate.qrVerificationEnabled}
                    onChange={(e) => setWorkingTemplate({ ...workingTemplate, qrVerificationEnabled: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">Digital QR Verification</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workingTemplate.signatureRequired}
                    onChange={(e) => setWorkingTemplate({ ...workingTemplate, signatureRequired: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">Institutional Seal & Sign</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Document Output Preview */}
        <div className="lg:col-span-6 bg-slate-100 rounded-xl border border-slate-300/80 p-5 shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm">Live Interpolated Document Preview</h3>
            </div>
            <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
              Sample Data Bound
            </span>
          </div>

          {/* Rendered Document Card */}
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-md min-h-[380px] flex flex-col justify-between space-y-4">
            {/* Header with School Branding */}
            <div className="text-center pb-3 border-b-2 border-slate-800">
              <h2 className="font-serif text-lg font-bold text-slate-900 uppercase tracking-wide">
                {schoolBranding.schoolName}
              </h2>
              <p className="text-[11px] text-slate-500">{schoolBranding.tagline} • Affiliation: {schoolBranding.affiliationNo}</p>
              <p className="text-[10px] text-slate-400">{schoolBranding.address}, {schoolBranding.city} • Ph: {schoolBranding.phone}</p>
              <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white text-[11px] font-bold rounded uppercase tracking-wider">
                {workingTemplate?.name}
              </div>
            </div>

            {/* Interpolated Body Text */}
            <div 
              className="text-xs text-slate-800 leading-relaxed space-y-3 py-2"
              dangerouslySetInnerHTML={{ __html: interpolatedPreview }}
            />

            {/* Footer with Seal and Signature */}
            <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-[11px]">
              {workingTemplate?.qrVerificationEnabled ? (
                <div className="flex items-center space-x-2 p-1.5 bg-slate-50 border border-slate-200 rounded">
                  <QrCode className="w-8 h-8 text-slate-800" />
                  <span className="text-[9px] font-mono-tech text-slate-500 leading-tight">
                    Scan to Verify<br />Record Integrity
                  </span>
                </div>
              ) : <div />}

              {workingTemplate?.signatureRequired && (
                <div className="text-center space-y-1">
                  <div className="w-16 h-8 mx-auto border-b border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 italic">
                    [Signature]
                  </div>
                  <span className="font-bold text-slate-800 block text-[10px]">Authorized Signatory</span>
                  <span className="text-[9px] text-slate-400 block">{schoolBranding.boardName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
