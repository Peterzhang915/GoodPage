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

  // Local UI state remains
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);

  // Get the context setter function
  const { setIsDeveloperToolsUIVisible } = useDeveloperMode();

  // Effect to sync showDeveloperTools with isAuthenticated
  // We need this because login happens in the hook, but this page controls visibility
  useEffect(() => {
    if (isAuthenticated) {
      setIsDeveloperToolsUIVisible(true);
      setShowDeveloperTools(true);
      console.log(
        "Auth state is true. Setting DevToolsVisible=true. Permissions:",
        permissions,
        "Full Access:",
        isFullAccess,
      );
    } else {
      // Reset UI state if authentication status changes to false externally (e.g., token expiry handled in store)
      setIsDeveloperToolsUIVisible(false);
      setShowDeveloperTools(false);
      setActiveTool(null);
    }
  }, [isAuthenticated, setIsDeveloperToolsUIVisible, permissions, isFullAccess]);

  // --- Close Tool Handler ---
  const handleCloseTool = useCallback(() => {
    setActiveTool(null);
  }, []);

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
        console.error("Error recording developer visit:", err),
      );
    }
  }, [isAuthenticated, showDeveloperTools]);

  // --- Conditional Rendering Logic (Updated) ---

  // Show login form if not authenticated
  if (!isAuthenticated) {
    // DeveloperLogin now handles its own logic via useDeveloperLogin hook
    return <DeveloperLogin />;
  }

  // Show dashboard if authenticated and tools are meant to be shown
  if (isAuthenticated && showDeveloperTools) {
    return (
      <DeveloperDashboard
        onLogout={developerHookLogout} // Pass the logout handler from the hook
      />
    );
  }

  // Return null or a loading indicator if needed while state syncs initially
  // or if authenticated but tools shouldn't be shown yet (though the effect handles this)
  return null;
};

// --- Default Export Wrapper --- //
export default function DeveloperPageWrapper() {
  return <DeveloperPage />;
}
