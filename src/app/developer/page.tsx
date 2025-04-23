"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion"; // Keep motion if Dashboard uses it
import { themeColors } from "@/styles/theme";
import DeveloperLogin from "@/components/developer/login/DeveloperLogin";
import DeveloperDashboard from "@/components/developer/DeveloperDashboard";
// Import the context hook
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
// Import the Zustand store hook
import { useAuthStore } from "@/store/authStore";
// Import the login hook to get its handleLogout function
import { useDeveloperLogin } from "@/hooks/useDeveloperLogin";

// --- Developer Page Component --- //
const DeveloperPage: React.FC = () => {
  // Get state and actions from Zustand store
  const { isAuthenticated, permissions, isFullAccess } = useAuthStore();

  // Get the logout handler from the useDeveloperLogin hook
  // Note: We might not need all return values, but we need the hook instance
  const { handleLogout: developerHookLogout } = useDeveloperLogin();

  // Local UI state remains (activeTool might be relevant for dashboard)
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);

  // Get the context setter function
  const { setIsDeveloperToolsUIVisible } = useDeveloperMode();

  // --- Effect to Scroll to Top on Mount --- 
  useEffect(() => {
    // Ensure this runs only once when the page component mounts
    console.log("DeveloperPage mounted, scrolling to top.");
    window.scrollTo(0, 0);
  }, []); // Empty dependency array ensures it runs only once on mount

  // Effect to sync showDeveloperTools with isAuthenticated
  // This controls the switch between Login and Dashboard views
  useEffect(() => {
    console.log(`Page Effect: isAuthenticated changed to ${isAuthenticated}`);
    if (isAuthenticated) {
      setIsDeveloperToolsUIVisible(true);
      setShowDeveloperTools(true); // Immediately show dashboard when authenticated
      console.log(
        "Page Effect: Auth is true. Setting showDeveloperTools=true. Permissions:",
        permissions,
        "Full Access:",
        isFullAccess,
      );
    } else {
      // Reset UI state if authentication status changes to false
      setIsDeveloperToolsUIVisible(false);
      setShowDeveloperTools(false); // Hide dashboard
      setActiveTool(null); // Reset any internal state like active tool
      console.log("Page Effect: Auth is false. Setting showDeveloperTools=false.");
    }
  }, [isAuthenticated, setIsDeveloperToolsUIVisible, permissions, isFullAccess]);

  // --- Close Tool Handler (If needed by Dashboard) ---
  const handleCloseTool = useCallback(() => {
    setActiveTool(null);
  }, []);

  // --- Effect for Body Class --- 
  useEffect(() => {
    const bodyClass = "developer-mode-active";
    // Add class only when dashboard is intended to be shown
    if (isAuthenticated && showDeveloperTools) {
      document.body.classList.add(bodyClass);
      console.log("Body Class Effect: Added class");
    } else {
      document.body.classList.remove(bodyClass);
      console.log("Body Class Effect: Removed class");
    }
    return () => {
      document.body.classList.remove(bodyClass);
      console.log("Body Class Effect: Cleanup, removed class");
    };
  }, [isAuthenticated, showDeveloperTools]);

  // --- Effect for Recording Visit --- 
  useEffect(() => {
    // Record visit only when dashboard is intended to be shown
    if (isAuthenticated && showDeveloperTools) {
      console.log("Visit Effect: Recording visit");
      fetch("/api/visit?source=developer", { method: "POST" }).catch((err) =>
        console.error("Error recording developer visit:", err),
      );
    } else {
      console.log(`Visit Effect: Skipped (isAuthenticated=${isAuthenticated}, showDeveloperTools=${showDeveloperTools})`);
    }
  }, [isAuthenticated, showDeveloperTools]);


  // --- Conditional Rendering Logic (Reverted to original) ---

  // 1. Show login form if not authenticated
  if (!isAuthenticated) {
    console.log("Rendering: Login Form (because !isAuthenticated)");
    // DeveloperLogin handles its own internal stages and animations
    return <DeveloperLogin />;
  }

  // 2. Show dashboard if authenticated and tools are meant to be shown
  //    The transition is handled by the effect setting showDeveloperTools
  if (isAuthenticated && showDeveloperTools) {
    console.log("Rendering: Dashboard (because isAuthenticated && showDeveloperTools)");
    return (
      <DeveloperDashboard
        onLogout={developerHookLogout} // Pass the logout handler from the hook
        // Potentially pass activeTool and handleCloseTool if Dashboard needs them
      />
    );
  }

  // 3. Return null as a fallback during potential brief state transitions
  //    or if authenticated but showDeveloperTools hasn't been set yet by the effect.
  console.log(`Rendering: Fallback (null) (isAuthenticated=${isAuthenticated}, showDeveloperTools=${showDeveloperTools})`);
  return null;
};

// --- Default Export Wrapper --- //
export default function DeveloperPageWrapper() {
  return <DeveloperPage />; // Ensure DeveloperProvider wraps this if context is needed here
}
