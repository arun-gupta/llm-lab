'use client';

import { Settings, Key, Server } from 'lucide-react';
import { ConfigPanel } from '../ConfigPanel';
import { MCPServerManager } from '../MCPServerManager';
import { MCPSettingsPanel } from '../MCPSettingsPanel';
import { ApiKeyStatusIndicator } from '../ApiKeyStatusIndicator';
import { useState } from 'react';

export function SettingsTab() {
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showMCPServerManager, setShowMCPServerManager] = useState(false);
  const [showMCPSettingsPanel, setShowMCPSettingsPanel] = useState(false);

  const settingsSections = [
    {
      icon: Key,
      title: 'API Configuration',
      description: 'Manage your API keys and provider settings',
      action: () => setShowConfigPanel(true),
      status: '✅ Available',
      showStatus: true,
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      icon: Server,
      title: 'MCP Server Management',
      description: 'Start, stop, and monitor MCP servers for enhanced Postman integration',
      action: () => setShowMCPServerManager(true),
      status: '✅ Available',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      icon: Settings,
      title: 'MCP Settings',
      description: 'Configure token limits and MCP-specific settings',
      action: () => setShowMCPSettingsPanel(true),
      status: '✅ Available',
      bgColor: 'bg-purple-50 border-purple-200'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Settings & Configuration
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Configure your API keys, preferences, and application settings to customize your LLM Lab experience.
        </p>
      </div>



      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={index}
              onClick={section.action}
              className={`${section.bgColor || 'bg-white border-gray-200'} border rounded-lg p-6 text-left hover:shadow-lg transition-shadow hover:border-gray-300`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Icon className="w-6 h-6 text-gray-600" />
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{section.description}</p>
              {section.showStatus && (
                <div className="mb-4">
                  <ApiKeyStatusIndicator 
                    onStatusChange={() => {}} 
                    refreshTrigger={0}
                  />
                </div>
              )}
              <div className="text-xs text-gray-500 font-medium">{section.status}</div>
            </button>
          );
        })}
      </div>





      {/* Config Panel */}
      <ConfigPanel
        isOpen={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
        onConfigChange={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />

      {/* MCP Server Manager Modal */}
      {showMCPServerManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <MCPServerManager />
            </div>
            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setShowMCPServerManager(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MCP Settings Panel */}
      {showMCPSettingsPanel && (
        <MCPSettingsPanel
          isOpen={showMCPSettingsPanel}
          onClose={() => setShowMCPSettingsPanel(false)}
        />
      )}
    </div>
  );
}
