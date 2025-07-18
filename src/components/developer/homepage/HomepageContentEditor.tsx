"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, // 新闻图标
  Sparkles, // 学生兴趣图标
  FolderKanban, // 主要项目图标
  Archive, // 过往项目图标
  BookOpenCheck, // 教学图标
  Settings2, // 部分设置图标
  Loader2, // 加载图标
  X, // 关闭图标
  AlertTriangle, // 错误图标
} from "lucide-react";
import { themeColors } from "@/styles/theme";

// 定义可编辑部分的类型
type EditableSection =
  | "news"
  | "interests"
  | "mainProjects"
  | "teaching";

interface SectionConfig {
  id: EditableSection;
  title: string;
  icon: React.ElementType;
  // 实际编辑器组件的占位符
  editorComponent: React.FC<any>; // 稍后替换为具体的props
}

// --- 占位符编辑器组件 (稍后定义实际编辑器) ---
const PlaceholderEditor: React.FC<{ sectionTitle: string }> = ({ sectionTitle }) => (
  <div className="p-6 text-gray-400">
    Editing UI for <span className="font-semibold text-gray-200">{sectionTitle}</span> will be here.
  </div>
);

// 导入实际的编辑器组件
import NewsListEditor from './NewsListEditor';
import InterestPointsEditor from './InterestPointsEditor';
import ProjectsEditor from './ProjectsEditor'; // 导入实际的ProjectsEditor
import TeachingEditor from './TeachingEditor'; // 导入实际的TeachingEditor

// 移除ProjectsEditor的本地占位符定义
// const ProjectsEditor = ({ isFormer }: { isFormer: boolean }) => (
//   <PlaceholderEditor sectionTitle={isFormer ? "Former Projects" : "Main Projects"} />
// );

// 移除TeachingEditor的占位符
// const TeachingEditor = () => <PlaceholderEditor sectionTitle="Teaching" />;
// 移除SectionMetaEditor占位符，因为该部分已移除
// const SectionMetaEditor = () => <PlaceholderEditor sectionTitle="Section Settings" />;
// --- 结束占位符编辑器组件 ---


const sectionConfigurations: SectionConfig[] = [
  { id: "news", title: "News", icon: Newspaper, editorComponent: NewsListEditor },
  { id: "interests", title: "Student Interests", icon: Sparkles, editorComponent: InterestPointsEditor },
  // 直接使用导入的ProjectsEditor，暂时移除isFormer属性逻辑
  { id: "mainProjects", title: "Projects", icon: FolderKanban, editorComponent: ProjectsEditor },
  // 移除过往项目部分，已在ProjectsEditor中处理
  // { id: "formerProjects", title: "Former Projects", icon: Archive, editorComponent: () => <ProjectsEditor /> }, // 需要prop处理如果保留
  { id: "teaching", title: "Teaching", icon: BookOpenCheck, editorComponent: TeachingEditor },
  // 移除部分设置部分
  // { id: "sectionMeta", title: "Section Settings", icon: Settings2, editorComponent: SectionMetaEditor },
];

interface HomepageContentEditorProps {
  onClose?: () => void; // 可选的关闭处理函数
}

const HomepageContentEditor: React.FC<HomepageContentEditorProps> = ({ onClose }) => {
  const [selectedSection, setSelectedSection] = useState<EditableSection>("news");
  const [isLoading, setIsLoading] = useState(false); // 全局加载状态？可能每个部分单独处理
  const [error, setError] = useState<string | null>(null); // 全局错误状态？

  const CurrentEditor = sectionConfigurations.find(s => s.id === selectedSection)?.editorComponent || (() => <div>Invalid Section</div>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${themeColors.devCardBg} ${themeColors.devText} rounded-lg border ${themeColors.devBorder} shadow-xl w-full max-w-6xl h-[90vh] flex overflow-hidden`}
      >
        {/* 侧边栏导航 */}
        <aside className={`w-64 ${themeColors.devMutedBg} border-r ${themeColors.devBorder} p-4 flex flex-col`}>
          <h2 className={`text-xl font-semibold ${themeColors.devAccent} mb-6 px-2`}>Homepage Editor</h2>
          <nav className="flex-grow space-y-1">
            {sectionConfigurations.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                  selectedSection === section.id
                    ? `${themeColors.devButtonBg} ${themeColors.devButtonText} shadow-inner`
                    : `${themeColors.devDescText} hover:${themeColors.devText} hover:${themeColors.devMutedBg}`
                }`}
              >
                <section.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
           {onClose && (
             <button
                onClick={onClose}
                className={`mt-auto inline-flex items-center justify-center px-4 py-2 border ${themeColors.devBorder} rounded-md shadow-sm text-xs font-medium ${themeColors.devMutedText} hover:${themeColors.devMutedBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95`}
                title="Close Editor"
             >
                <X size={14} className="mr-1" /> Close
             </button>
            )}
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 标题（可选 - 稍后可以在此处添加保存按钮等） */}
           <div className={`${themeColors.devMutedBg} border-b ${themeColors.devBorder} px-6 py-3 flex justify-between items-center`}>
             <h3 className={`text-lg font-medium ${themeColors.devText}`}>
               {sectionConfigurations.find(s => s.id === selectedSection)?.title || 'Editor'}
             </h3>
             {/* 占位符，用于潜在的全局保存/状态指示器 */}
           </div>

          {/* 编辑器内容 */}
          <div className="flex-1 overflow-y-auto relative">
            {isLoading && (
              <div className={`${themeColors.devCardBg} bg-opacity-75 absolute inset-0 flex justify-center items-center z-10`}>
                <Loader2 className={`h-8 w-8 ${themeColors.devAccent} animate-spin`} />
              </div>
            )}
            {error && (
               <div className={`${themeColors.devCardBg} bg-opacity-90 absolute inset-0 flex flex-col justify-center items-center z-10 p-4`}>
                 <AlertTriangle className={`h-10 w-10 ${themeColors.errorText} mb-4`} />
                 <p className={`${themeColors.errorText} text-center mb-4`}>Error loading content:</p>
                 <p className={`${themeColors.devDescText} text-sm ${themeColors.devMutedBg} p-2 rounded max-w-md text-center`}>{error}</p>
                 {/* Add a retry button? */}
               </div>
            )}
            {!isLoading && !error && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedSection} // 更改key以触发动画，当部分改变时
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full" // 确保motion div占据全高
                    >
                        <CurrentEditor />
                    </motion.div>
                </AnimatePresence>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default HomepageContentEditor; 