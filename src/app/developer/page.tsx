'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion'; // Keep motion if Dashboard uses it
import { themeColors } from '@/styles/theme';
import DeveloperLogin from '@/components/developer/DeveloperLogin';
import DeveloperDashboard from '@/components/developer/DeveloperDashboard';
// Import the context hook
import { useDeveloperMode } from '@/contexts/DeveloperModeContext';

// --- Developer Page Component --- //
const DeveloperPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [grantedPermissions, setGrantedPermissions] = useState<string[] | null>(null);
  const [isFullAccess, setIsFullAccess] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);

  // Get the context setter function
  const { setIsDeveloperToolsUIVisible } = useDeveloperMode();

  // --- Login Success Handler --- 
  const handleLoginSuccess = useCallback(
    (permissions: string[], fullAccess: boolean) => {
      setIsAuthenticated(true);
      setGrantedPermissions(permissions);
      setIsFullAccess(fullAccess);
      setActiveTool(null);
      // Set context state to true BEFORE showing the tools
      setIsDeveloperToolsUIVisible(true); 
      setShowDeveloperTools(true);
      console.log(
        "Authentication successful. Setting DevToolsVisible=true. Permissions:",
        permissions,
        "Full Access:",
        fullAccess
      );
    },
    [setIsDeveloperToolsUIVisible] // Add setter to dependency array
  );

  // --- Close Tool Handler --- 
  const handleCloseTool = useCallback(() => {
    setActiveTool(null);
  }, []);

  // --- Logout Handler --- 
  const handleLogout = useCallback(() => {
    // Set context state to false on logout
    setIsDeveloperToolsUIVisible(false); 
    setIsAuthenticated(false);
    setGrantedPermissions(null);
    setIsFullAccess(false);
    setActiveTool(null);
    setShowDeveloperTools(false);
    fetch('/api/auth/developer/logout', { method: 'POST' }).catch(err => console.error("Logout API call failed:", err));
    console.log("User logged out. Setting DevToolsVisible=false.");
  }, [setIsDeveloperToolsUIVisible]); // Add setter to dependency array

  // --- Effect for Body Class --- 
  useEffect(() => {
    const bodyClass = "developer-mode-active";
    if (isAuthenticated && showDeveloperTools) { 
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
    }
    return () => {
      document.body.classList.remove(bodyClass);
    };
  }, [isAuthenticated, showDeveloperTools]);

  // --- Effect for Recording Visit --- 
  useEffect(() => {
    if (isAuthenticated && showDeveloperTools) {
      fetch("/api/visit?source=developer", { method: "POST" }).catch((err) =>
        console.error("Error recording developer visit:", err)
      );
    }
  }, [isAuthenticated, showDeveloperTools]);

  // --- Conditional Rendering Logic --- 

  if (!isAuthenticated) {
    return <DeveloperLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (isAuthenticated && showDeveloperTools) {
    return (
      <DeveloperDashboard
        permissions={grantedPermissions || []}
        isFullAccess={isFullAccess}
        onLogout={handleLogout}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onCloseTool={handleCloseTool}
      />
    );
  }

  return null;
};

// --- Default Export Wrapper --- //
export default function DeveloperPageWrapper() {
  return <DeveloperPage />;
}
