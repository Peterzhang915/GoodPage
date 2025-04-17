'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Unlock,
  Server,
  Edit,
  Wrench,
  Key,
  BookUp,
  FileText as LogIcon,
  Database,
  ArrowLeft,
  LogOut,
  Upload
} from 'lucide-react';
import { themeColors } from '@/styles/theme';
import ToolCard from './ToolCard'; // Assuming ToolCard is in the same directory
import NewsEditor from './NewsEditor';
import CodeServerManager from './CodeServerManager';
import OpsManager from './OpsManager';
import KeyGenerator from './KeyGenerator';
import PublicationManager from './PublicationManager';
import PhotoManager from './PhotoManager';
import MemberManager from './MemberManager';
// Import other tool components as needed

interface DeveloperDashboardProps {
  permissions: string[];
  isFullAccess: boolean;
  onLogout: () => void;
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  onCloseTool: () => void; // Handler to close the active tool
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  permissions,
  isFullAccess,
  onLogout,
  activeTool,
  setActiveTool,
  onCloseTool,
}) => {

  // Helper to check permissions
  const hasPermission = (perm: string) => permissions.includes(perm);

  return (
    <div className="container mx-auto px-4 py-12 font-mono">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative"
      >
        <h1
          className={`text-3xl sm:text-4xl font-bold ${themeColors.devTitleText ?? 'text-green-400'} mb-2 flex items-center justify-center gap-3`}
        >
          <Unlock size={36} /> Developer Toolbox{' '}
          {isFullAccess ? 'Activated' : 'Limited Access'}
        </h1>
        <p className={`${themeColors.devDescText ?? 'text-gray-400'} text-sm sm:text-base`}>
          {isFullAccess
            ? 'Core systems unlocked. Welcome, Administrator! Remember: sudo responsibly.'
            : 'Welcome! Available tools depend on your access level.'}
        </p>
         <button
            onClick={onLogout}
            className={`absolute top-0 right-0 mt-1 mr-1 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium ${themeColors.textWhite ?? 'text-white'} bg-red-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-opacity`}
            title="Logout"
          >
            <LogOut size={14} className="mr-1"/> Logout
          </button>
      </motion.div>

      {/* Conditional Rendering: Tool Cards Grid OR Active Tool View */}
      {activeTool === null ? (
        // --- Tool Cards Grid ---
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
           {/* Tool: Manage News */}
          <ToolCard
            title="Manage News"
            description="Add, edit, or delete news items."
            buttonText="Manage News"
            icon={<Edit size={16} className="mr-2" />}
            onButtonClick={() => setActiveTool('news')}
            disabled={!hasPermission('manage_news')}
            delay={0.1}
          />
          {/* Tool: Manage Publications */}
          <ToolCard
            title="Manage Publications"
            description="Upload BibTeX or manually manage publication entries."
            buttonText="Manage Publications"
            icon={<BookUp size={16} className="mr-2" />}
            onButtonClick={() => setActiveTool('publication')}
            disabled={!hasPermission('manage_publications')}
            delay={0.2}
          />
           {/* Tool: Manage Members */}
          <ToolCard
            title="Manage Members"
            description="Add, edit, or remove lab member information."
            buttonText="Manage Members"
            icon={<Unlock size={16} className="mr-2"/>}
            onButtonClick={() => setActiveTool('member')}
            disabled={!hasPermission('manage_members')}
            delay={0.3}
          />
          {/* Tool: Manage Photos */}
          <ToolCard
            title="Manage Photo Gallery"
            description="Upload photos and manage gallery settings."
            buttonText="Manage Photos"
            icon={<Upload size={16} className="mr-2"/>}
            onButtonClick={() => setActiveTool('photo')}
            disabled={!hasPermission('manage_photos')}
            delay={0.4}
          />
          {/* Tool: Manage Code Servers */}
          <ToolCard
            title="Manage Code Servers"
            description="View, add, or remove Code Server instances."
            buttonText="Manage Servers"
            icon={<Server size={16} className="mr-2" />}
            onButtonClick={() => setActiveTool('codeserver')}
            disabled={!hasPermission('manage_codeservers')}
            delay={0.5}
          />
          {/* Tool: Operations Tools - Removed as per design doc update */}
          {/* <ToolCard ... /> */}
          {/* Tool: Generate Access Key - Removed as per design doc update */}
          {/* <ToolCard ... /> */}

          {/* Tool: Database Management (Prisma Studio) - Only for full access */}
          {isFullAccess && (
             <ToolCard
               title="Database Management"
               description="Open Prisma Studio to directly manage the database."
               buttonText="Open Prisma Studio"
               icon={<Database size={16} className="mr-2" />}
               onButtonClick={() => window.open('http://localhost:5555', '_blank')} // Assuming Prisma Studio runs on 5555
               disabled={false} // Always enabled if shown
               delay={0.6}
             />
          )}

          {/* Tool: System Logs */}
          <ToolCard
            title="System Logs"
            description="View application and server logs."
            buttonText="View Logs"
            icon={<LogIcon size={16} className="mr-2" />}
            onButtonClick={() => setActiveTool('logs')}
            disabled={!hasPermission('view_logs')}
            delay={0.7}
          />
        </motion.div>
      ) : (
        // --- Active Tool View ---
        <motion.div
          key={activeTool} // Ensure animation remounts when tool changes
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`p-4 sm:p-6 rounded-lg border ${themeColors.devBorder ?? 'border-gray-700'} ${themeColors.devCardBg ?? 'bg-gray-800'} shadow-md`}
        >
          <button
            onClick={onCloseTool} // Use the passed handler
            className={`mb-4 sm:mb-6 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium ${themeColors.devDescText ?? 'text-gray-300'} hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors`}
          >
            <ArrowLeft size={16} className="mr-1 sm:mr-2" /> Back to Tools
          </button>

          {/* Render the active tool component, passing the onClose handler */} 
          {activeTool === 'news' && <NewsEditor onClose={onCloseTool} />}
          {activeTool === 'publication' && <PublicationManager onClose={onCloseTool} />}
          {activeTool === 'member' && <MemberManager onClose={onCloseTool} />}
          {activeTool === 'photo' && <PhotoManager onClose={onCloseTool} />}
          {activeTool === 'codeserver' && <CodeServerManager onClose={onCloseTool} />}
          {/* Removed OpsManager and KeyGenerator based on design doc */} 
          {/* {activeTool === 'ops' && <OpsManager onClose={onCloseTool} />} */} 
          {/* {activeTool === 'keyGenerator' && <KeyGenerator onClose={onCloseTool} />} */} 
          {activeTool === 'logs' && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${themeColors.devTitleText ?? 'text-green-400'}`}>System Logs</h3>
              <p className={`${themeColors.devDescText ?? 'text-gray-300'}`}>Log viewing functionality is under development.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DeveloperDashboard; 