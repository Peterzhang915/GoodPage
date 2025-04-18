"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
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
  Upload,
  Users,
} from "lucide-react";
import { themeColors } from "@/styles/theme";
import ToolCard from "./ToolCard"; // Assuming ToolCard is in the same directory
import NewsEditor from "./news/NewsEditor";
import CodeServerManager from "./codeserver/CodeServerManager";
import PublicationManager from "./publication/PublicationManager";
import PhotoManager from "./photo/PhotoManager";
import MemberManager from "./user/MemberManager";
import UserManager from "./user/UserManager"; // Keeping this for now, maybe for specific user account actions?
import { useAuthStore } from "@/store/authStore";
// Import other tool components as needed

// Define the structure for a tool configuration object
interface ToolConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType; // Use ElementType for Lucide icons
  requiredPermission?: string;
  component?: React.FC<{ onClose: () => void }>; // Component expects onClose prop
  externalLink?: string;
  buttonText: string; // Explicitly define button text
}

// Configuration array for available tools
const availableTools: ToolConfig[] = [
  {
    id: "news",
    title: "Manage News",
    description: "Add, edit, or delete news items.",
    icon: Edit,
    requiredPermission: "manage_news",
    component: NewsEditor,
    buttonText: "Manage News",
  },
  {
    id: "publication",
    title: "Manage Publications",
    description: "Review pending, manually manage publication entries.",
    icon: BookUp,
    requiredPermission: "manage_publications",
    component: PublicationManager, // Assuming PublicationManager is the main entry
    buttonText: "Manage Publications",
  },
  {
    id: "member",
    title: "Manage Members",
    description: "Add, edit, or remove lab member information.",
    icon: Users,
    requiredPermission: "manage_members",
    component: MemberManager, // Use MemberManager as the component
    buttonText: "Manage Members",
  },
  {
    id: "photo",
    title: "Manage Photo Gallery",
    description: "Upload photos and manage gallery settings.",
    icon: Upload,
    requiredPermission: "manage_photos",
    component: PhotoManager,
    buttonText: "Manage Photos",
  },
  {
    id: "codeserver",
    title: "Manage Code Servers",
    description: "View, add, or remove Code Server instances.",
    icon: Server,
    requiredPermission: "manage_codeservers", // Make sure this permission exists
    component: CodeServerManager,
    buttonText: "Manage Servers",
  },
  {
    id: "db",
    title: "Database Management",
    description: "Open Prisma Studio to directly manage the database.",
    icon: Database,
    externalLink: "http://localhost:5555", // Assuming Prisma Studio runs on 5555
    requiredPermission: "manage_settings", // Example: Only allow if user can manage settings (like Root/Admin)
    buttonText: "Open Prisma Studio",
  },
  {
    id: "logs",
    title: "System Logs",
    description: "View application and server logs.",
    icon: LogIcon,
    requiredPermission: "view_logs",
    // component: SystemLogViewer, // TODO: Implement this component later
    buttonText: "View Logs (TBD)", // Indicate feature is not ready
  },
];

interface DeveloperDashboardProps {
  onLogout: () => void;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onLogout,
}) => {
  const { permissions, isFullAccess } = useAuthStore();

  const [activeTool, setActiveTool] = React.useState<string | null>(null);

  // Handler to select a tool
  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
  };

  // Handler to go back to the tool grid
  const handleGoBack = () => {
    setActiveTool(null);
  };

  // Helper to check permissions
  const hasPermission = useCallback(
    (perm?: string) => {
      if (!perm) return true; // If no permission is required, allow access
      return isFullAccess || (permissions || []).includes(perm);
    },
    [permissions, isFullAccess],
  );

  // Find the configuration for the currently active tool
  const currentToolConfig = activeTool
    ? availableTools.find((tool) => tool.id === activeTool)
    : null;

  // Filter available tools based on permissions
  const visibleTools = availableTools.filter((tool) =>
    hasPermission(tool.requiredPermission),
  );

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
          className={`text-3xl sm:text-4xl font-bold ${themeColors.devTitleText ?? "text-green-400"} mb-2 flex items-center justify-center gap-3`}
        >
          <Unlock size={36} /> Developer Toolbox{" "}
          {isFullAccess ? "Activated" : "Limited Access"}
        </h1>
        <p
          className={`${themeColors.devDescText ?? "text-gray-400"} text-sm sm:text-base`}
        >
          {isFullAccess
            ? "Core systems unlocked. Welcome, Administrator! Remember: sudo responsibly."
            : "Welcome! Available tools depend on your access level."}
        </p>
        <button
          onClick={onLogout}
          className={`absolute top-0 right-0 mt-1 mr-1 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium ${themeColors.textWhite ?? "text-white"} bg-red-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-opacity`}
          title="Logout"
        >
          <LogOut size={14} className="mr-1" /> Logout
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
          {/* Dynamically render visible tools */}
          {visibleTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              buttonText={tool.buttonText}
              icon={<tool.icon size={16} className="mr-2" />}
              onButtonClick={
                tool.component ? () => handleToolSelect(tool.id) : undefined
              }
              externalLink={tool.externalLink}
              disabled={!tool.component && !tool.externalLink} // Disable if no component and no link
              delay={0.1 + index * 0.05} // Stagger animation
            />
          ))}
        </motion.div>
      ) : (
        // --- Active Tool View ---
        <motion.div
          key={activeTool} // Ensure animation remounts when tool changes
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`p-4 sm:p-6 rounded-lg border ${themeColors.devBorder ?? "border-gray-700"} ${themeColors.devCardBg ?? "bg-gray-800"} shadow-md`}
        >
          <button
            onClick={handleGoBack} // Use the internal handler
            className={`mb-4 sm:mb-6 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-600 rounded-md shadow-sm text-xs sm:text-sm font-medium ${themeColors.devDescText ?? "text-gray-300"} hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors`}
          >
            <ArrowLeft size={16} className="mr-1 sm:mr-2" /> Back to Tools
          </button>

          {/* Render the active tool component dynamically */}
          {currentToolConfig?.component && (
            <currentToolConfig.component onClose={handleGoBack} />
          )}
          {/* Handle cases where the tool might not have a component (e.g., logs TBD) or is invalid */}
          {!currentToolConfig?.component && activeTool !== "db" && (
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${themeColors.devTitleText ?? "text-green-400"}`}
              >
                Tool Not Available
              </h3>
              <p className={`${themeColors.devDescText ?? "text-gray-300"}`}>
                The selected tool '{currentToolConfig?.title || activeTool}' is
                currently under development or does not have an associated
                interface.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DeveloperDashboard;
