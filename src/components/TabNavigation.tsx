'use client';

import { useState } from 'react';
import { Home, TestTube, BarChart3, Library, TrendingUp, Settings, Network, Globe } from 'lucide-react';

export type TabType = 'home' | 'test' | 'collections' | 'grpcweb' | 'graphrag' | 'settings';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  {
    id: 'home' as TabType,
    label: 'Home',
    icon: Home,
    description: 'Welcome and quick start'
  },
  {
    id: 'test' as TabType,
    label: 'LLM Testing',
    icon: TestTube,
    description: 'Test and compare LLM providers, prompts, and responses'
  },
  {
    id: 'collections' as TabType,
    label: 'MCP',
    icon: Library,
    description: 'Model Context Protocol integrations and collections'
  },
  {
    id: 'grpcweb' as TabType,
    label: 'gRPC-Web',
    icon: Globe,
    description: 'Browser-compatible gRPC with HTTP/1.1 and Protocol Buffers'
  },
  {
    id: 'graphrag' as TabType,
    label: 'GraphRAG',
    icon: Network,
    description: 'Graph-based Retrieval-Augmented Generation'
  },
  {
    id: 'settings' as TabType,
    label: 'Settings',
    icon: Settings,
    description: 'Configuration and preferences'
  }
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                title={tab.description}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
