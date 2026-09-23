import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Sliders, 
  Eye, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { CustomFieldDefinition, CustomFieldEntityType, CustomFieldType, Role } from '../../types';
import { ConfigurationService } from '../../services/configurationService';

export const CustomFieldsManager: React.FC = () => {
  const { customFields, store } = useERP();
  const [selectedEntity, setSelectedEntity] = useState<CustomFieldEntityType>('STUDENT');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'FIELDS_LIST' | 'FORM_SIMULATOR'>('FIELDS_LIST');

  // New Field State
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('TEXT');
  const [fieldSection, setFieldSection] = useState('General Information');
  const [placeholder, setPlaceholder] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isFilterable, setIsFilterable] = useState(false);
  const [optionsText, setOptionsText] = useState('');
  const [validationRegex, setValidationRegex] = useState('');
  const [helpText, setHelpText] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER']);

  // Simulator test inputs state
  const [simulatedValues, setSimulatedValues] = useState<Record<string, any>>({});
  const [simulatedErrors, setSimulatedErrors] = useState<Record<string, string>>({});
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  const entityTypes: { id: CustomFieldEntityType; label: string }[] = [
    { id: 'STUDENT', label: 'Student Profile' },
    { id: 'STAFF', label: 'Staff & Faculty' },
    { id: 'ADMISSION', label: 'Admission Applications' },
    { id: 'FEE', label: 'Fee Invoices & Payments' },
    { id: 'CLASS', label: 'Classes & Sections' },
    { id: 'ASSET', label: 'School Fixed Assets' },
    { id: 'VISITOR', label: 'Visitor Logs' },
    { id: 'ALUMNI', label: 'Alumni Network' },
  ];

  const fieldTypesList: { id: CustomFieldType; label: string }[] = [
    { id: 'TEXT', label: 'Text (Single Line)' },
    { id: 'TEXTAREA', label: 'Textarea (Multi-line)' },
    { id: 'NUMBER', label: 'Number (Integer)' },
    { id: 'DECIMAL', label: 'Decimal / Percentage' },
    { id: 'CURRENCY', label: 'Currency (₹ / $)' },
    { id: 'DATE', label: 'Date Picker' },
    { id: 'DATETIME', label: 'Date & Time' },
    { id: 'BOOLEAN', label: 'Boolean (Yes/No Switch)' },
    { id: 'SELECT', label: 'Dropdown Select' },
    { id: 'MULTISELECT', label: 'Multi-Select Pills' },
    { id: 'EMAIL', label: 'Email Address' },
    { id: 'PHONE', label: 'Phone / Mobile Number' },
    { id: 'URL', label: 'Web URL / Link' },
    { id: 'FILE', label: 'File Attachment / PDF' },
    { id: 'IMAGE', label: 'Image Upload' },
    { id: 'COLOR', label: 'Color Picker' }
  ];

  const filteredFields = customFields.filter(f => f.entityType === selectedEntity);

  const availableRoles: Role[] = [
    'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 
    'ACCOUNTANT', 'RECEPTIONIST', 'HR_MANAGER', 'HOSTEL_WARDEN'
  ];

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName || !fieldKey) return;

    const options = optionsText ? optionsText.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    store.addCustomField({
      entityType: selectedEntity,
      fieldName,
      fieldKey: fieldKey.replace(/[^a-zA-Z0-9_]/g, ''),
      fieldType,
      section: fieldSection || 'Custom Attributes',
      placeholder,
      isRequired,
      isUnique,
      isSearchable,
      isFilterable,
      options,
      validationRegex: validationRegex || undefined,
      helpText: helpText || undefined,
      visibleToRoles: selectedRoles,
      order: filteredFields.length + 1
    });

    setIsModalOpen(false);
    setFieldName('');
    setFieldKey('');
    setPlaceholder('');
    setOptionsText('');
    setValidationRegex('');
    setHelpText('');
  };

  const handleTestSimulatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    filteredFields.forEach(field => {
      const val = simulatedValues[field.fieldKey];
      const validation = ConfigurationService.validateFieldValue(field, val);
      if (!validation.isValid && validation.errorMessage) {
        errors[field.fieldKey] = validation.errorMessage;
      }
    });

    setSimulatedErrors(errors);
    if (Object.keys(errors).length === 0) {
      setSimulatedSuccess(true);
      setTimeout(() => setSimulatedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Custom Fields & Data Schema Studio</h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Extend core ERP entities with custom attributes, statutory legal fields, select options, and regex validations.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('FIELDS_LIST')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'FIELDS_LIST' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Field Schemas
            </button>
            <button
              onClick={() => setActiveTab('FORM_SIMULATOR')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'FORM_SIMULATOR' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Simulator
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Field</span>
          </button>
        </div>
      </div>

      {/* Entity Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {entityTypes.map((ent) => (
          <button
            key={ent.id}
            onClick={() => setSelectedEntity(ent.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
              selectedEntity === ent.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{ent.label}</span>
            <span className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded ${
              selectedEntity === ent.id ? 'bg-purple-700/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {customFields.filter(f => f.entityType === ent.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* View 1: Fields Schema List */}
      {activeTab === 'FIELDS_LIST' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Configured Fields for {entityTypes.find(e => e.id === selectedEntity)?.label} ({filteredFields.length})</span>
            <span>Rules & Role Visibility</span>
          </div>

          {filteredFields.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Database className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">No custom fields defined for {selectedEntity}.</p>
              <p className="text-slate-400 max-w-sm mx-auto">Click "Add Custom Field" to attach new attributes to this business entity.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredFields.map((field) => (
                <div key={field.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{field.fieldName}</span>
                      <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-semibold">
                        {field.fieldType}
                      </span>
                      <span className="text-[10px] font-mono-tech text-slate-400">key: {field.fieldKey}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                      <span>Section: <strong className="text-slate-700">{field.section}</strong></span>
                      {field.isRequired && <span className="text-red-500 font-bold">● Required</span>}
                      {field.isUnique && <span className="text-blue-600 font-semibold">● Unique</span>}
                      {field.options && <span className="text-slate-600">Options: {field.options.join(', ')}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                      {field.visibleToRoles.slice(0, 3).map(r => (
                        <span key={r} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-mono-tech">
                          {r}
                        </span>
                      ))}
                      {field.visibleToRoles.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-mono-tech">+{field.visibleToRoles.length - 3}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete custom field "${field.fieldName}"?`)) {
                          store.deleteCustomField(field.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 2: Live Interactive Form Simulator */}
      {activeTab === 'FORM_SIMULATOR' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Interactive Form Simulator: {entityTypes.find(e => e.id === selectedEntity)?.label}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify input rendering, validation regex constraints, and error messaging in real-time.
              </p>
            </div>
            {simulatedSuccess && (
              <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Validation Passed!</span>
              </span>
            )}
          </div>

          {filteredFields.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No custom fields to simulate for this entity.</p>
          ) : (
            <form onSubmit={handleTestSimulatorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFields.map((field) => {
                  const hasError = !!simulatedErrors[field.fieldKey];

                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-800">
                        {field.fieldName} {field.isRequired && <span className="text-red-500">*</span>}
                      </label>

                      {field.fieldType === 'TEXT' || field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY' || field.fieldType === 'EMAIL' || field.fieldType === 'PHONE' ? (
                        <input
                          type={field.fieldType === 'NUMBER' || field.fieldType === 'CURRENCY' ? 'number' : 'text'}
                          placeholder={field.placeholder || `Enter ${field.fieldName.toLowerCase()}...`}
                          value={simulatedValues[field.fieldKey] || ''}
                          onChange={(e) => setSimulatedValues({ ...simulatedValues, [field.fieldKey]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden ${
                            hasError ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white'
                          }`}
                        />
                      ) : field.fieldType === 'TEXTAREA' ? (
                        <textarea
                          rows={2}
                          placeholder={field.placeholder}
                          value={simulatedValues[field.fieldKey] || ''}
                          onChange={(e) => setSimulatedValues({ ...simulatedValues, [field.fieldKey]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden ${
                            hasError ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-white'
                          }`}
                        />
                      ) : field.fieldType === 'SELECT' ? (
                        <select
                          value={simulatedValues[field.fieldKey] || ''}
                          onChange={(e) => setSimulatedValues({ ...simulatedValues, [field.fieldKey]: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
                        >
                          <option value="">-- Select Option --</option>
                          {(field.options || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.fieldType === 'BOOLEAN' ? (
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="checkbox"
                            checked={!!simulatedValues[field.fieldKey]}
                            onChange={(e) => setSimulatedValues({ ...simulatedValues, [field.fieldKey]: e.target.checked })}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs text-slate-700">Yes / Enabled</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.placeholder || 'Enter value...'}
                          value={simulatedValues[field.fieldKey] || ''}
                          onChange={(e) => setSimulatedValues({ ...simulatedValues, [field.fieldKey]: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
                        />
                      )}

                      {hasError && (
                        <p className="text-[11px] text-red-500 font-medium flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{simulatedErrors[field.fieldKey]}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedValues({});
                    setSimulatedErrors({});
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Test Validate Inputs
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Add Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Attach Custom Field</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddField} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Field Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aadhaar Card Number"
                    value={fieldName}
                    onChange={(e) => {
                      setFieldName(e.target.value);
                      if (!fieldKey) {
                        setFieldKey(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Key *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. aadhaarNumber"
                    value={fieldKey}
                    onChange={(e) => setFieldKey(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Type</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {fieldTypesList.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Form Section</label>
                  <input
                    type="text"
                    placeholder="e.g. Identity, Academics, Statutory"
                    value={fieldSection}
                    onChange={(e) => setFieldSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {(fieldType === 'SELECT' || fieldType === 'MULTISELECT') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dropdown Options (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Option 1, Option 2, Option 3"
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Validation Regex (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ^[0-9]{12}$"
                    value={validationRegex}
                    onChange={(e) => setValidationRegex(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-tech text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Placeholder Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 12-digit number..."
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-slate-700">Mandatory (Required)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnique}
                    onChange={(e) => setIsUnique(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-slate-700">Enforce Unique Value</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSearchable}
                    onChange={(e) => setIsSearchable(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-slate-700">Searchable in Bar</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFilterable}
                    onChange={(e) => setIsFilterable(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-slate-700">Filterable in Tables</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Attach Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
