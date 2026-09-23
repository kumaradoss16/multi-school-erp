import React, { useState } from 'react';
import { 
  Sliders, 
  Layers, 
  ToggleRight, 
  Menu, 
  Database, 
  Palette, 
  FileText, 
  GitFork, 
  Hash, 
  Building, 
  FileCode,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { CustomizationOverview } from '../customization/CustomizationOverview';
import { ModuleFeatureManager } from '../customization/ModuleFeatureManager';
import { FeatureFlagsManager } from '../customization/FeatureFlagsManager';
import { NavigationBuilder } from '../customization/NavigationBuilder';
import { CustomFieldsManager } from '../customization/CustomFieldsManager';
import { ThemeCustomizer } from '../customization/ThemeCustomizer';
import { TemplateManager } from '../customization/TemplateManager';
import { WorkflowManager } from '../customization/WorkflowManager';
import { NumberingManager } from '../customization/NumberingManager';
import { BrandingManager } from '../customization/BrandingManager';
import { ConfigBackupVersionManager } from '../customization/ConfigBackupVersionManager';

export const CustomizationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'modules', label: 'Modules & Features', icon: Layers },
    { id: 'feature_flags', label: 'Feature Flags', icon: ToggleRight },
    { id: 'navigation', label: 'Navigation Menu', icon: Menu },
    { id: 'custom_fields', label: 'Custom Fields', icon: Database },
    { id: 'themes', label: 'Themes & UI', icon: Palette },
    { id: 'templates', label: 'Doc Templates', icon: FileText },
    { id: 'workflows', label: 'Workflows', icon: GitFork },
    { id: 'numbering', label: 'Numbering Rules', icon: Hash },
    { id: 'branding', label: 'Branding & Crest', icon: Building },
    { id: 'backups', label: 'Snapshots & Export', icon: FileCode },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Tab Navigation Pill Strip */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <CustomizationOverview 
            onNavigateTab={(tabId) => setActiveTab(tabId)}
            onOpenNewModuleModal={() => {
              setActiveTab('modules');
              setIsCreateModuleModalOpen(true);
            }}
          />
        )}

        {activeTab === 'modules' && (
          <ModuleFeatureManager 
            isCreateModalOpen={isCreateModuleModalOpen}
            setIsCreateModalOpen={setIsCreateModuleModalOpen}
          />
        )}

        {activeTab === 'feature_flags' && <FeatureFlagsManager />}
        {activeTab === 'navigation' && <NavigationBuilder />}
        {activeTab === 'custom_fields' && <CustomFieldsManager />}
        {activeTab === 'themes' && <ThemeCustomizer />}
        {activeTab === 'templates' && <TemplateManager />}
        {activeTab === 'workflows' && <WorkflowManager />}
        {activeTab === 'numbering' && <NumberingManager />}
        {activeTab === 'branding' && <BrandingManager />}
        {activeTab === 'backups' && <ConfigBackupVersionManager />}
      </div>
    </div>
  );
};
