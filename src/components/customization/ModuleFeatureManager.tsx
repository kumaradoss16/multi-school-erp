import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Check, 
  X, 
  Trash2, 
  Settings2, 
  ChevronRight, 
  Shield, 
  Cpu, 
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { CustomModuleConfig, CustomModuleType, Role } from '../../types';

interface ModuleFeatureManagerProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const ModuleFeatureManager: React.FC<ModuleFeatureManagerProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen
}) => {
  const { customModules, customFeatures, store } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(customModules[0]?.id || null);

  // New Module Form State
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDisplayName, setNewModuleDisplayName] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newModuleType, setNewModuleType] = useState<CustomModuleType>('CUSTOM_DATA');
  const [newModuleCategory, setNewModuleCategory] = useState<CustomModuleConfig['category']>('Custom');
  const [newModuleIcon, setNewModuleIcon] = useState('Boxes');
  const [newModuleColor, setNewModuleColor] = useState('#2563eb');
  const [newModuleRoles, setNewModuleRoles] = useState<Role[]>(['SUPER_ADMIN', 'ADMIN']);

  const filteredModules = customModules.filter(m => {
    const matchesSearch = 
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'ALL' || m.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const activeModule = customModules.find(m => m.id === selectedModuleId) || customModules[0];
  const moduleFeatures = customFeatures.filter(f => f.moduleId === activeModule?.id);

  const availableRoles: Role[] = [
    'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 
    'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'RECEPTIONIST', 
    'HR_MANAGER', 'TRANSPORT_MANAGER', 'HOSTEL_WARDEN'
  ];

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName || !newModuleDisplayName) return;

    store.addCustomModule({
      name: newModuleName.toLowerCase().replace(/\s+/g, '_'),
      displayName: newModuleDisplayName,
      description: newModuleDesc || 'Custom school business data and lifecycle tracking entity.',
      icon: newModuleIcon,
      category: newModuleCategory,
      type: newModuleType,
      route: newModuleName.toLowerCase().replace(/\s+/g, '-'),
      sortOrder: customModules.length + 1,
      status: 'ENABLED',
      requiredRole: newModuleRoles,
      schoolScope: 'ALL',
      featuresCount: 1,
      badgeColor: newModuleColor
    });

    setIsCreateModalOpen(false);
    setNewModuleName('');
    setNewModuleDisplayName('');
    setNewModuleDesc('');
  };

  const toggleRoleSelection = (role: Role) => {
    if (newModuleRoles.includes(role)) {
      if (newModuleRoles.length > 1) {
        setNewModuleRoles(newModuleRoles.filter(r => r !== role));
      }
    } else {
      setNewModuleRoles([...newModuleRoles, role]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Module & Feature Studio</h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Enable or configure standard ERP services and provision dynamic custom data entities.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Custom Module</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search modules and entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'BUILTIN', 'CONFIGURABLE', 'CUSTOM_DATA', 'INTEGRATION'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTypeFilter === type
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Module Directory + Detail/Features Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Modules Table / List */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Module Directory ({filteredModules.length})</span>
            <span>Status & Control</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[620px]">
            {filteredModules.map((mod) => {
              const isSelected = selectedModuleId === mod.id;
              const isEnabled = mod.status === 'ENABLED';

              return (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/60 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs text-xs font-bold"
                      style={{ backgroundColor: mod.badgeColor || '#2563eb' }}
                    >
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs truncate">{mod.displayName}</span>
                        <span className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded font-semibold ${
                          mod.type === 'BUILTIN' ? 'bg-slate-100 text-slate-600' :
                          mod.type === 'CONFIGURABLE' ? 'bg-emerald-100 text-emerald-700' :
                          mod.type === 'CUSTOM_DATA' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {mod.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 truncate mt-0.5 max-w-sm">{mod.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        store.toggleCustomModuleStatus(mod.id);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center space-x-1.5 ${
                        isEnabled
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {isEnabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </button>

                    <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-blue-600' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Module Details & Sub-Features Config */}
        <div className="lg:col-span-5 space-y-4">
          {activeModule ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold"
                    style={{ backgroundColor: activeModule.badgeColor || '#2563eb' }}
                  >
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeModule.displayName}</h3>
                    <span className="text-[11px] text-slate-700 font-mono-tech">ID: {activeModule.name} | v{activeModule.version}</span>
                  </div>
                </div>

                {activeModule.isDeletable && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete custom module "${activeModule.displayName}"?`)) {
                        store.deleteCustomModule(activeModule.id);
                      }
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Module"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-700 font-medium">Description</span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{activeModule.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-700 font-medium">Category</span>
                    <p className="font-semibold text-slate-800">{activeModule.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-700 font-medium">Scope</span>
                    <p className="font-semibold text-slate-800">{activeModule.schoolScope}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-medium flex items-center space-x-1 mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Role Access Permissions</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeModule.requiredRole.map((role) => (
                      <span key={role} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-tech text-[10px]">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sub-features list */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">Features & Automation Sub-Rules</span>
                    <span className="text-[10px] text-slate-700 font-mono-tech">{moduleFeatures.length} configured</span>
                  </div>

                  {moduleFeatures.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-lg text-slate-700 text-center text-xs">
                      No optional sub-feature toggles configured for this base module.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {moduleFeatures.map((feat) => (
                        <div key={feat.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900 text-xs">{feat.name}</span>
                            <p className="text-[11px] text-slate-700">{feat.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => store.toggleFeature(feat.id)}
                            className={`p-1 transition-colors ${feat.enabled ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {feat.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-700">
              Select a module from the list to configure its attributes and security flags.
            </div>
          )}
        </div>
      </div>

      {/* Create Module Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Provision New Custom Module</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alumni Association, School Assets, Visitor Desk"
                  value={newModuleDisplayName}
                  onChange={(e) => {
                    setNewModuleDisplayName(e.target.value);
                    if (!newModuleName) {
                      setNewModuleName(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Key *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. alumni_network"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Module Type</label>
                  <select
                    value={newModuleType}
                    onChange={(e) => setNewModuleType(e.target.value as CustomModuleType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="CUSTOM_DATA">Custom Data Module</option>
                    <option value="CONFIGURABLE">Configurable Service</option>
                    <option value="INTEGRATION">Hardware / External API</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what this module manages..."
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newModuleCategory}
                    onChange={(e) => setNewModuleCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Custom">Custom</option>
                    <option value="Student Services">Student Services</option>
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accent Badge Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newModuleColor}
                      onChange={(e) => setNewModuleColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <span className="font-mono-tech text-xs text-slate-600">{newModuleColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Authorized Roles</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {availableRoles.map((role) => {
                    const isChecked = newModuleRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRoleSelection(role)}
                        className={`px-2 py-1 rounded text-[10px] font-mono-tech font-semibold transition-all ${
                          isChecked ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
