"use client";

import React, { useState } from "react";
import { themeColors } from "@/styles/theme";
import { BookUp, Clock, Upload, FileText, Database } from "lucide-react";

// 导入管理器组件
import PublishedManager from "../modules/published/PublishedManager";
import PendingManager from "../modules/pending/PendingManager";
import YamlImportManager from "../modules/yaml-import/YamlImportManager";
import DblpImportManager from "../modules/dblp-import/DblpImportManager";

interface MainPublicationContainerProps {
  className?: string;
}

type TabType = 'published' | 'pending' | 'import' | 'dblp-import';

/**
 * 主出版物管理容器组件
 * 包含已发布、待审核和导入功能的标签页
 */
const MainPublicationContainer: React.FC<MainPublicationContainerProps> = ({
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('published');

  const tabs = [
    {
      id: 'published' as TabType,
      label: 'Published',
      icon: BookUp,
      component: PublishedManager
    },
    {
      id: 'pending' as TabType,
      label: 'Pending Review',
      icon: Clock,
      component: PendingManager
    },
    {
      id: 'import' as TabType,
      label: 'Import YAML',
      icon: Upload,
      component: YamlImportManager
    },
    {
      id: 'dblp-import' as TabType,
      label: 'DBLP Import',
      icon: Database,
      component: DblpImportManager
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || PublishedManager;

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* 标签页导航 */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? `border-blue-500 ${themeColors.devAccent} text-blue-400`
                    : `border-transparent ${themeColors.devDescText} hover:${themeColors.devText} hover:border-gray-600`
                }`}
              >
                <Icon className={`mr-2 h-5 w-5 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 标签页内容 */}
      <div className="min-h-[600px]">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default MainPublicationContainer;
