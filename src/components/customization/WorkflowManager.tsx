import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  Check, 
  Save, 
  ShieldCheck, 
  Bell, 
  Clock
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { WorkflowConfig } from '../../types';

export const WorkflowManager: React.FC = () => {
  const { workflows, store } = useERP();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [saveToast, setSaveToast] = useState(false);

  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];
  const [workingWorkflow, setWorkingWorkflow] = useState<WorkflowConfig>(activeWorkflow);

  React.useEffect(() => {
    if (activeWorkflow) {
      setWorkingWorkflow(activeWorkflow);
    }
  }, [activeWorkflow]);

  const handleSave = () => {
    store.saveWorkflow(workingWorkflow);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">Workflow & Approval Lifecycle Engine</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Configure multi-tier approval matrices, SLA escalation rules, and automatic notifications for admissions and leave requests.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            {saveToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saveToast ? 'Workflow Saved!' : 'Save Workflow Rules'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {workflows.map((wf) => (
          <button
            key={wf.id}
            onClick={() => setSelectedWorkflowId(wf.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
              selectedWorkflowId === wf.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{wf.name}</span>
            <span className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded ${
              selectedWorkflowId === wf.id ? 'bg-rose-700/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {wf.states.length} Steps
            </span>
          </button>
        ))}
      </div>

      {/* Visual Pipeline Sequence Diagram */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Visual Lifecycle State Diagram</h3>
          {workingWorkflow.slaHours && (
            <span className="text-xs font-mono-tech text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-200">
              Target SLA: {workingWorkflow.slaHours} Hours
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
          {workingWorkflow.states.map((st, idx) => (
            <React.Fragment key={st.id}>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs shrink-0 w-44 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-tech font-bold text-slate-400">STAGE {idx + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color || '#e11d48' }} />
                </div>
                <span className="font-bold text-slate-900 text-xs block truncate">{st.name}</span>
                <span className="text-[10px] font-mono-tech text-slate-500 block truncate">ID: {st.id}</span>
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{idx === 0 ? '● Start' : st.isFinal ? '● Final Complete' : 'In-Progress'}</span>
                </div>
              </div>

              {idx < workingWorkflow.states.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* State Transitions Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Allowed State Transitions & Approver Roles ({workingWorkflow.transitions.length})</span>
          <span>Automated Triggers</span>
        </div>

        <div className="divide-y divide-slate-100">
          {workingWorkflow.transitions.map((trans, i) => (
            <div key={`${trans.fromState}-${trans.toState}-${i}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-xs">{trans.actionLabel}</span>
                  <span className="text-slate-400 text-xs">({trans.fromState} → {trans.toState})</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Authorized Roles: <strong>{trans.requiredRole.join(', ')}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {trans.notifyApplicant && (
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold flex items-center space-x-1">
                    <Bell className="w-3 h-3" />
                    <span>Auto-Notify Applicant</span>
                  </span>
                )}
                {trans.notifyParent && (
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold flex items-center space-x-1">
                    <Bell className="w-3 h-3" />
                    <span>Auto-Notify Parent</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
