import React, { useState } from 'react';
import { 
  Building, 
  Save, 
  Check
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { SchoolBrandingConfig } from '../../types';

export const BrandingManager: React.FC = () => {
  const { schoolBranding, store } = useERP();
  const [workingBranding, setWorkingBranding] = useState<SchoolBrandingConfig>({ ...schoolBranding });
  const [saveToast, setSaveToast] = useState(false);

  React.useEffect(() => {
    setWorkingBranding({ ...schoolBranding });
  }, [schoolBranding]);

  const handleSave = () => {
    store.updateSchoolBranding(workingBranding);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">Institutional Branding & Letterhead Hub</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Global school crest, CBSE affiliation metadata, authorized digital signatures, and automated report card letterheads.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            {saveToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saveToast ? 'Branding Updated!' : 'Save Branding'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Editor on Left, Live Letterhead on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input Form */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Institutional Identity Metadata
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                value={workingBranding.schoolName}
                onChange={(e) => setWorkingBranding({ ...workingBranding, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Short Name / Initials</label>
              <input
                type="text"
                value={workingBranding.shortName}
                onChange={(e) => setWorkingBranding({ ...workingBranding, shortName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={workingBranding.tagline}
                onChange={(e) => setWorkingBranding({ ...workingBranding, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affiliation Board</label>
                <input
                  type="text"
                  value={workingBranding.boardName}
                  onChange={(e) => setWorkingBranding({ ...workingBranding, boardName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affiliation / Reg No.</label>
                <input
                  type="text"
                  value={workingBranding.affiliationNo}
                  onChange={(e) => setWorkingBranding({ ...workingBranding, affiliationNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
              <input
                type="text"
                value={workingBranding.address}
                onChange={(e) => setWorkingBranding({ ...workingBranding, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={workingBranding.city}
                  onChange={(e) => setWorkingBranding({ ...workingBranding, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={workingBranding.state}
                  onChange={(e) => setWorkingBranding({ ...workingBranding, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={workingBranding.pincode}
                  onChange={(e) => setWorkingBranding({ ...workingBranding, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
                <input
                  type="text"
                  value={workingBranding.phone}
                  onChange={(e) => setWorkingBranding({ ...workingBranding, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={workingBranding.email}
                  onChange={(e) => setWorkingBranding({ ...workingBranding, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Official Letterhead Preview */}
        <div className="lg:col-span-6 bg-slate-100 rounded-xl border border-slate-200 p-5 shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Official Letterhead Preview</h3>
            <span className="text-[10px] text-slate-500 font-mono-tech">Propagated to all PDF reports</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-sm min-h-[350px] flex flex-col justify-between">
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-base mx-auto flex items-center justify-center mb-2 shadow-xs">
                {workingBranding.schoolName.charAt(0)}
              </div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                {workingBranding.schoolName}
              </h2>
              <p className="text-xs text-slate-600 font-medium italic">{workingBranding.tagline}</p>
              <div className="text-[10px] text-slate-500 mt-1">
                Affiliated to {workingBranding.boardName} | Affiliation No: {workingBranding.affiliationNo}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {workingBranding.address}, {workingBranding.city}, {workingBranding.state} - {workingBranding.pincode} | Ph: {workingBranding.phone}
              </div>
            </div>

            {/* Simulated Content Lines */}
            <div className="space-y-2 py-6 opacity-40">
              <div className="h-2.5 bg-slate-200 rounded-full w-3/4" />
              <div className="h-2.5 bg-slate-200 rounded-full w-full" />
              <div className="h-2.5 bg-slate-200 rounded-full w-5/6" />
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <div className="text-center space-y-0.5">
                <div className="w-24 h-6 border-b border-dashed border-slate-400 mx-auto" />
                <span className="font-bold text-slate-900 text-[11px] block">Principal / Authorized Signatory</span>
                <span className="text-[9px] text-slate-500 block">{workingBranding.boardName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
