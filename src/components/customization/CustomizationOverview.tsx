import React from 'react';
import { 
  Sliders, 
  Layers, 
  ToggleRight, 
  Palette, 
  FileText, 
  GitFork, 
  Hash, 
  Building, 
  Database, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  FileCode,
  Sparkles,
  Plus
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';

interface CustomizationOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenNewModuleModal: () => void;
}

export const CustomizationOverview: React.FC<CustomizationOverviewProps> = ({ 
  onNavigateTab,
  onOpenNewModuleModal
}) => {
  const { 
    customModules, 
    customFeatures, 
    featureFlags, 
    customFields, 
    themes, 
    activeThemeId, 
    templates, 
    workflows, 
    configSnapshots,
    auditLogs
  } = useERP();

  const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0];
  const enabledModules = customModules.filter(m => m.status === 'ENABLED').length;
  const enabledFeatures = customFeatures.filter(f => f.enabled).length;
  const enabledFlags = featureFlags.filter(f => f.enabled).length;
  const recentConfigAudits = auditLogs
    .filter(l => l.module === 'Customization' || l.action.includes('CONFIG') || l.action.includes('THEME') || l.action.includes('MODULE'))
    .slice(0, 6);

  const stats = [
    { label: 'Active Modules', value: `${enabledModules} / ${customModules.length}`, icon: Layers, color: 'text-blue-600 bg-blue-50 border-blue-200', tab: 'modules' },
    { label: 'Feature Flags', value: `${enabledFlags} Active`, icon: ToggleRight, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', tab: 'feature_flags' },
    { label: 'Custom Fields', value: `${customFields.length} Deployed`, icon: Database, color: 'text-purple-600 bg-purple-50 border-purple-200', tab: 'custom_fields' },
    { label: 'Active Theme', value: activeTheme.name.split(' ')[0], icon: Palette, color: 'text-amber-600 bg-amber-50 border-amber-200', tab: 'themes' },
    { label: 'Doc Templates', value: `${templates.length} Published`, icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', tab: 'templates' },
    { label: 'State Workflows', value: `${workflows.length} Pipelines`, icon: GitFork, color: 'text-rose-600 bg-rose-50 border-rose-200', tab: 'workflows' },
  ];

  const quickJumpCards = [
    {
      id: 'modules',
      title: 'Module & Feature Studio',
      description: 'Configure core ERP modules, custom business entities, and hardware integration layers.',
      icon: Layers,
      color: 'bg-blue-600',
      count: `${customModules.length} Modules`
    },
    {
      id: 'navigation',
      title: 'Navigation & Menu Builder',
      description: 'Customize sidebar ordering, group hierarchy, labels, icons, and role-based permissions.',
      icon: Sliders,
      color: 'bg-indigo-600',
      count: 'Full Sidebar Control'
    },
    {
      id: 'custom_fields',
      title: 'Custom Fields & Form Engine',
      description: 'Add legal, statutory, medical, and academic fields to students, staff, and admissions.',
      icon: Database,
      color: 'bg-purple-600',
      count: `${customFields.length} Custom Fields`
    },
    {
      id: 'themes',
      title: 'Theme & Design System Studio',
      description: 'Live token visualizer for enterprise brand colors, typography, sidebar density, and radii.',
      icon: Palette,
      color: 'bg-amber-600',
      count: `${themes.length} Presets`
    },
    {
      id: 'templates',
      title: 'Document & Notification Templates',
      description: 'Visual designer for CBSE certificates, smart ID cards, fee challans, SMS, and WhatsApp alerts.',
      icon: FileText,
      color: 'bg-emerald-600',
      count: `${templates.length} Templates`
    },
    {
      id: 'workflows',
      title: 'Workflow & Lifecycle Rules',
      description: 'Approval matrices for student admissions, faculty leave requests, and fee concessions.',
      icon: GitFork,
      color: 'bg-rose-600',
      count: `${workflows.length} Workflows`
    },
    {
      id: 'numbering',
      title: 'Sequence & Numbering Engine',
      description: 'Transactional sequence generators for student IDs, receipts, invoices, and certificates.',
      icon: Hash,
      color: 'bg-cyan-600',
      count: 'Transactional IDs'
    },
    {
      id: 'branding',
      title: 'Institutional Branding & Letterhead',
      description: 'Official school crest, signatures, seals, contact metadata, and automated report letterheads.',
      icon: Building,
      color: 'bg-slate-700',
      count: 'Global Propagated'
    },
    {
      id: 'backups',
      title: 'Snapshots, Versioning & Import/Export',
      description: 'Create configuration checkpoints, rollback modifications, and export JSON packages.',
      icon: FileCode,
      color: 'bg-teal-600',
      count: `${configSnapshots.length} Snapshots`
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-blue-600/30 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>SchoolERP Customization & Configuration Studio</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Configuration Center</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Dynamically customize modules, data schemas, security rules, themes, document templates, and workflows with real database-backed persistence and transactional guarantees.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenNewModuleModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/40 flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Module</span>
            </button>
            <button
              onClick={() => onNavigateTab('backups')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <FileCode className="w-4 h-4" />
              <span>Export Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigateTab(stat.tab)}
              className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all text-left group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">{stat.label}</span>
                <div className={`p-1.5 rounded-lg border ${stat.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors font-mono-tech">
                  {stat.value}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid of Main Configuration Sub-systems */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-slate-900">Customization Hubs</h2>
          <span className="text-xs font-medium text-slate-700">Click any hub to configure</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickJumpCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigateTab(card.id)}
                className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-white shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {card.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold font-mono-tech px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {card.count}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Open Builder</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Configuration Audits & Security Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Configuration Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-700">Immutable transactional log</span>
          </div>

          <div className="space-y-2.5">
            {recentConfigAudits.length === 0 ? (
              <p className="text-xs text-slate-700 py-4 text-center">No recent configuration changes recorded.</p>
            ) : (
              recentConfigAudits.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-150 flex items-start justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 font-mono-tech">{log.action}</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-medium">{log.module}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-[10px] text-slate-700 font-mono-tech">{log.timestamp}</span>
                    <div className="text-[10px] text-slate-700 font-medium">{log.user}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety & System Integrity Card */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white">System Integrity & Safety</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All runtime customizations run under strict RBAC constraints, declarative rule engines, and parameter validation. No arbitrary code execution or unvetted scripts are permitted.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero arbitrary JS/SQL execution</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transactional sequence numbering</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated snapshot versioning</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-campus tenant isolation</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono-tech">
            <span>Config Version: v3.2.0</span>
            <span className="text-emerald-400 font-semibold">ALL ENGINES ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
