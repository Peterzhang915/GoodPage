"use client";

import React from "react";
import { motion } from "framer-motion"; // Import motion
import { useDeveloperLogin } from "@/hooks/useDeveloperLogin";
import MotdDisplay from "@/components/developer/login/MotdDisplay";
import LoginInputForm from "@/components/developer/login/LoginInputForm";
import { themeColors } from "@/styles/theme"; // Keep for overall component styling
import TextProgressBar from "./TextProgressBar"; // Import the progress bar

// Define ASCII Art constant
const SYSTEM_LOCKED_ASCII = `
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗    ██╗      ██████╗  ██████╗██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║    ██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║    ██║     ██║   ██║██║     █████╔╝ █████╗  ██║  ██║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║    ██║     ██║   ██║██║     ██╔═██╗ ██╔══╝  ██║  ██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║    ███████╗╚██████╔╝╚██████╗██║  ██╗███████╗██████╔╝
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝    ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ 
`;

// Add SYSTEM_UNLOCKED ASCII Art
const SYSTEM_UNLOCKED_ASCII = `
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗    ██╗   ██╗███╗   ██╗██╗      ██████╗  ██████╗██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║    ██║   ██║████╗  ██║██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║    ██║   ██║██╔██╗ ██║██║     ██║   ██║██║     █████╔╝ █████╗  ██║  ██║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║    ██║   ██║██║╚██╗██║██║     ██║   ██║██║     ██╔═██╗ ██╔══╝  ██║  ██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║    ╚██████╔╝██║ ╚████║███████╗╚██████╔╝╚██████╗██║  ██╗███████╗██████╔╝
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝     ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ 
`;

// Add GOODLAB ASCII Art
const GOODLAB_ASCII = `

 ██████╗  ██████╗  ██████╗ ██████╗ ██╗      █████╗ ██████╗ 
██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗██║     ██╔══██╗██╔══██╗
██║  ███╗██║   ██║██║   ██║██║  ██║██║     ███████║██████╔╝
██║   ██║██║   ██║██║   ██║██║  ██║██║     ██╔══██║██╔══██╗
╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████╗██║  ██║██████╔╝
 ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝ 

`;

// Simple separator line component or just a styled div
const Separator = () => (
  <div className="text-gray-600 my-2">
    {/* Adjust length and character as needed */}
    --------------------------------------------------------------------------
  </div>
);

const DeveloperLogin: React.FC = () => {
  const {
    // State & Derived State from Hook
    username,
    password,
    error,
    loginStage,
    motdContent,
    displayMotd,
    isMotdComplete,
    attemptsRemaining,
    isLocked,
    lockoutMessage,
    motdIndex,
    processingIndex,
    spinnerChar,

    // Refs from Hook (for input components)
    usernameInputRef,
    passwordInputRef,
    motdContainerRef, // Needed for MotdDisplay

    // Handlers (destructure the correct ones)
    handleUsernameChange,
    handlePasswordChange,
    handleLogin,
    handleMotdComplete,
    skipMotd,
    // Get boot message state
    currentBootMessageIndex,
    bootMessages,
  } = useDeveloperLogin();

  // Determine which ASCII art to display
  const currentAsciiArt = 
    loginStage === "unlocking" ? SYSTEM_UNLOCKED_ASCII :
    loginStage === "welcome" ? GOODLAB_ASCII :
    SYSTEM_LOCKED_ASCII; // Default or during awaiting/validating

  return (
    <div
      // Main container: full height, padding, flex column
      // Remove explicit background color to inherit from body
      className={`flex flex-col h-screen p-4 font-mono ${themeColors.devText ?? 'text-gray-200'}`}
    >
      {/* Section 1: ASCII Art (Dynamically changes) */}
      <motion.div 
        key={loginStage} // Add key to trigger animation on change
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
         <div
           className={`whitespace-pre font-mono text-xs ${themeColors.devTitleText ?? 'text-green-400'} flex-shrink-0`}
         >
           {currentAsciiArt}
         </div>
      </motion.div>

      {/* Separator 1 - Only show before MOTD/Login Form */}
      {(loginStage === "awaitingPassword" || loginStage === "validating") && <Separator />}

      {/* Section 2: MOTD (Only shown in initial stages) */}
      {(loginStage === "awaitingPassword" || loginStage === "validating") && (
        <div 
          className="overflow-y-auto flex-shrink-0" 
          style={{ maxHeight: '40vh' }} 
        >
          <MotdDisplay
            lines={motdContent}
            currentIndex={motdIndex}
            processingIndex={processingIndex}
            spinnerChar={spinnerChar}
          />
        </div>
      )}

      {/* Section 3: Login Form or Progress/Welcome Messages */}
      <div className="mt-4 flex-grow flex flex-col">
        {/* Show Login Form only when awaiting password or validating */}
        {(loginStage === "awaitingPassword" || loginStage === "validating") && isMotdComplete && (
          <motion.div
            key="login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }} 
          >
            {/* Separator *inside* the form section, only when form is visible */}
            <Separator /> 
            <LoginInputForm
              usernameValue={username}
              passwordValue={password}
              onUsernameChange={handleUsernameChange}
              onPasswordChange={handlePasswordChange}
              onSubmit={handleLogin} 
              loginStage={loginStage} // Pass loginStage
              error={error}
              attemptsRemaining={attemptsRemaining}
              isLocked={isLocked}
              lockoutMessage={lockoutMessage}
              usernameInputRef={usernameInputRef} 
              passwordInputRef={passwordInputRef} 
            />
          </motion.div>
        )}

        {/* Show Unlocking Progress with Boot Messages */}
        {loginStage === "unlocking" && (
          <motion.div
            key="unlocking-progress" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex-grow flex flex-col pt-4" 
          >
            <div className="mb-4 space-y-1 text-sm text-yellow-400">
              {bootMessages.slice(0, currentBootMessageIndex + 1).map((msg, index) => (
                <div key={index}>{msg}</div>
              ))}
            </div>
            <TextProgressBar total={30} interval={50} /> 
          </motion.div>
        )}

        {/* Show Welcome Message */}
        {loginStage === "welcome" && (
          <motion.div
            key="welcome-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            // Adjust layout: remove justify-center, add pt-4
            className="flex-grow flex flex-col items-start text-base text-green-400 font-mono pl-4 pt-4" 
          >
            {/* Render the multi-line welcome message */}
            <div className="whitespace-pre-wrap">
              {`> Wake up, ${username}...`}
            </div>
            <div className="whitespace-pre-wrap">
              {`> The Matrix has you... Accessing the GOOD core.`}
            </div>
            <div className="whitespace-pre-wrap mt-1 text-gray-500">
              {`> // Authentication sequence complete. GOOD Dev Terminal active.`}
            </div>
            <div className="mt-4 text-lg font-semibold">
              [Press ENTER to engage]
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer (Ensure mt-auto pushes it to the bottom) */}
      <div className="mt-auto pt-4 text-xs text-gray-500 text-left flex-shrink-0">
        GoodPage Developer Access Terminal
      </div>
    </div>
  );
};

export default DeveloperLogin;
