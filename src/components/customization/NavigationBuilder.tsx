import React, { useState } from 'react';
import { 
  Sliders, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Pin, 
  RotateCcw, 
  Save, 
  Check, 
  Shield, 
  Layers, 
  Menu
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { NavigationConfigItem, Role } from '../../types';

export const NavigationBuilder: React.FC = () => {
  const { navigationConfig, store } = useERP();
  const [items, setItems] = useState<NavigationConfigItem[]>([...navigationConfig]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Sync if store changes externally
  React.useEffect(() => {
    setItems([...navigationConfig]);
  }, [navigationConfig]);

  const availableRoles: Role[] = [
    'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 
    'ACCOUNTANT', 'RECEPTIONIST', 'HR_MANAGER', 'TRANSPORT_MANAGER'
  ];

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update order indices
    const updated = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(updated);
    setHasChanges(true);
  };

  const handleLabelChange = (id: string, newCustomLabel: string) => {
    setItems(items.map(item => item.id === id ? { ...item, customLabel: newCustomLabel } : item));
    setHasChanges(true);
  };

  const handleGroupChange = (id: string, newGroup: string) => {
    setItems(items.map(item => item.id === id ? { ...item, group: newGroup } : item));
    setHasChanges(true);
  };

  const toggleVisibility = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
    setHasChanges(true);
  };

  const togglePin = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isPinned: !item.isPinned } : item));
    setHasChanges(true);
  };

  const toggleRole = (id: string, role: Role) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const currentRoles = item.roles || [];
      const updatedRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      return { ...item, roles: updatedRoles.length > 0 ? updatedRoles : ['SUPER_ADMIN'] };
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    store.updateNavigationItems(items);
    setHasChanges(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Reset navigation hierarchy and labels to system defaults?')) {
      store.resetNavigationToDefault();
      setHasChanges(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Menu className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Navigation & Sidebar Menu Builder</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Customize menu ordering, rename display labels (e.g. "Students" → "Learners"), group menus, and restrict role visibility.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all shadow-xs ${
              hasChanges 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saveToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saveToast ? 'Changes Applied!' : 'Save Navigation'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Reorder & Editor Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 text-xs font-bold text-slate-700 gap-2 items-center">
          <div className="col-span-1 text-center">Order</div>
          <div className="col-span-3">System Module & Custom Label</div>
          <div className="col-span-2">Group Section</div>
          <div className="col-span-4">Role Visibility</div>
          <div className="col-span-2 text-right">Visibility & Controls</div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
          {items.map((item, idx) => {
            return (
              <div 
                key={item.id} 
                className={`grid grid-cols-12 px-4 py-3 gap-2 items-center text-xs transition-colors ${
                  !item.visible ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Order Up/Down */}
                <div className="col-span-1 flex items-center justify-center space-x-1">
                  <span className="font-mono-tech font-bold text-slate-500 text-[11px] w-5 text-center">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col space-y-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, 'UP')}
                      className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, 'DOWN')}
                      className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* System Module & Custom Label Input */}
                <div className="col-span-3 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono-tech block">
                    Module ID: {item.moduleId} {item.shortcut && `(${item.shortcut})`}
                  </span>
                  <input
                    type="text"
                    value={item.customLabel}
                    onChange={(e) => handleLabelChange(item.id, e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Group Section */}
                <div className="col-span-2">
                  <select
                    value={item.group}
                    onChange={(e) => handleGroupChange(item.id, e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Overview">Overview</option>
                    <option value="Academics">Academics</option>
                    <option value="Student Services">Student Services</option>
                    <option value="Finance">Finance</option>
                    <option value="Administration">Administration</option>
                    <option value="Logistics">Logistics</option>
                    <option value="System">System</option>
                  </select>
                </div>

                {/* Role Visibility */}
                <div className="col-span-4 flex flex-wrap gap-1">
                  {availableRoles.map((role) => {
                    const isChecked = (item.roles || []).includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(item.id, role)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono-tech font-semibold transition-all ${
                          isChecked 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {role.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>

                {/* Visibility Toggle & Pin */}
                <div className="col-span-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => togglePin(item.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      item.isPinned 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={item.isPinned ? 'Pinned item' : 'Pin to top'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(item.id)}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
                      item.visible 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.visible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
