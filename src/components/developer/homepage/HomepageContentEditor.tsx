"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, // Icon for News
  Sparkles, // Icon for Student Interests
  FolderKanban, // Icon for Main Projects
  Archive, // Icon for Former Projects
  BookOpenCheck, // Icon for Teaching
  Settings2, // Icon for Section Settings
  Loader2, // Icon for Loading
  X, // Icon for Close
  AlertTriangle, // Icon for Error
} from "lucide-react";
import { themeColors } from "@/styles/theme";

// Define the types for editable sections
type EditableSection =
  | "news"
  | "interests"
  | "mainProjects"
  | "teaching";

interface SectionConfig {
  id: EditableSection;
  title: string;
  icon: React.ElementType;
  // Placeholder for the actual editor component
  editorComponent: React.FC<any>; // Replace 'any' with specific props later
}

// --- Placeholder Editor Components (Define actual editors later) ---
const PlaceholderEditor: React.FC<{ sectionTitle: string }> = ({ sectionTitle }) => (
  <div className="p-6 text-gray-400">
    Editing UI for <span className="font-semibold text-gray-200">{sectionTitle}</span> will be here.
  </div>
);

// Import the actual Editor components
import NewsListEditor from './NewsListEditor';
import InterestPointsEditor from './InterestPointsEditor';
import ProjectsEditor from './ProjectsEditor'; // Import the actual ProjectsEditor
import TeachingEditor from './TeachingEditor'; // Import the actual TeachingEditor

// Remove the local placeholder definition for ProjectsEditor
// const ProjectsEditor = ({ isFormer }: { isFormer: boolean }) => (
//   <PlaceholderEditor sectionTitle={isFormer ? "Former Projects" : "Main Projects"} />
// );

// Remove placeholder for TeachingEditor
// const TeachingEditor = () => <PlaceholderEditor sectionTitle="Teaching" />;
// Remove SectionMetaEditor placeholder as the section is removed
// const SectionMetaEditor = () => <PlaceholderEditor sectionTitle="Section Settings" />;
// --- End Placeholder Editor Components ---


const sectionConfigurations: SectionConfig[] = [
  { id: "news", title: "News", icon: Newspaper, editorComponent: NewsListEditor },
  { id: "interests", title: "Student Interests", icon: Sparkles, editorComponent: InterestPointsEditor },
  // Use the imported ProjectsEditor directly, remove isFormer prop logic for now
  { id: "mainProjects", title: "Projects", icon: FolderKanban, editorComponent: ProjectsEditor },
  // Remove Former Projects section, handled within ProjectsEditor now
  // { id: "formerProjects", title: "Former Projects", icon: Archive, editorComponent: () => <ProjectsEditor /> }, // Needs prop handling if kept
  { id: "teaching", title: "Teaching", icon: BookOpenCheck, editorComponent: TeachingEditor },
  // Remove Section Settings section
  // { id: "sectionMeta", title: "Section Settings", icon: Settings2, editorComponent: SectionMetaEditor },
];

interface HomepageContentEditorProps {
  onClose?: () => void; // Optional close handler
}

const HomepageContentEditor: React.FC<HomepageContentEditorProps> = ({ onClose }) => {
  const [selectedSection, setSelectedSection] = useState<EditableSection>("news");
  const [isLoading, setIsLoading] = useState(false); // Global loading state? Maybe per section later.
  const [error, setError] = useState<string | null>(null); // Global error state?

  const CurrentEditor = sectionConfigurations.find(s => s.id === selectedSection)?.editorComponent || (() => <div>Invalid Section</div>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${themeColors.devCardBg} ${themeColors.devText} rounded-lg border ${themeColors.devBorder} shadow-xl w-full max-w-6xl h-[90vh] flex overflow-hidden`}
      >
        {/* Sidebar Navigation */}
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

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header (Optional - Can add Save buttons etc. here later) */}
           <div className={`${themeColors.devMutedBg} border-b ${themeColors.devBorder} px-6 py-3 flex justify-between items-center`}>
             <h3 className={`text-lg font-medium ${themeColors.devText}`}>
               {sectionConfigurations.find(s => s.id === selectedSection)?.title || 'Editor'}
             </h3>
             {/* Placeholder for potential global save/status indicators */}
           </div>

          {/* Editor Content */}
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
                        key={selectedSection} // Change key to trigger animation on section change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full" // Ensure motion div takes full height if needed
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