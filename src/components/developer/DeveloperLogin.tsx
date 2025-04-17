'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Image component
import { themeColors } from '@/styles/theme'; // Assuming theme colors are defined here
import { motion } from 'framer-motion';

// Props for the component (e.g., a callback for successful login)
interface DeveloperLoginProps {
  onLoginSuccess: (permissions: string[], isFullAccess: boolean) => void; // Callback after successful authentication
}

// Define ASCII Art and MOTD
const SYSTEM_LOCKED_ASCII = `
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗    ██╗      ██████╗  ██████╗██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║    ██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║    ██║     ██║   ██║██║     █████╔╝ █████╗  ██║  ██║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║    ██║     ██║   ██║██║     ██╔═██╗ ██╔══╝  ██║  ██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║    ███████╗╚██████╔╝╚██████╗██║  ██╗███████╗██████╔╝
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝    ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ 
`;

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

// Initial MOTD messages
const INITIAL_MOTD: { text: string; requiresConfirmation?: boolean }[] = [
  { text: "[INFO] Security subsystems initialized." , requiresConfirmation: true },
  { text: "[INFO] Network interface eth0 active."    , requiresConfirmation: true },
  { text: "[WARN] Audit logging enabled. All actions are recorded." },
  { text: "> Awaiting developer authentication protocol..." }
];

// Simple separator line
const SEPARATOR = "--------------------------------------------------------------------------";

// Simple text progress bar component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const filledLength = Math.round(50 * (progress / 100));
    const emptyLength = 50 - filledLength;
    const bar = `[${'#'.repeat(filledLength)}${'.'.repeat(emptyLength)}] ${progress}%`;
    return <span className="text-cyan-400">{bar}</span>;
};

// Define Login Stages Type
type LoginStage = 'awaitingPassword' | 'showingProgress' | 'showingWelcomeScreen' | 'loginComplete';

const DeveloperLogin: React.FC<DeveloperLoginProps> = ({ onLoginSuccess }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(null);

  // Simplified MOTD State
  const [motdIndex, setMotdIndex] = useState(0); // Which line index are we up to?
  const [processingLineIndex, setProcessingLineIndex] = useState<number>(-1); // Which line index is currently animating? (-1 means none)
  const [spinnerChar, setSpinnerChar] = useState('/'); // Current spinner character

  // State for post-login animation
  const [isShowingSuccessAnimation, setIsShowingSuccessAnimation] = useState(false);
  const [progress, setProgress] = useState(0);

  // Add loginStage state
  const [loginStage, setLoginStage] = useState<LoginStage>('awaitingPassword');

  // Refs to store auth data for later use
  const permissionsRef = useRef<string[]>([]);
  const isFullAccessRef = useRef<boolean>(false);

  // --- Focus input on mount or stage change ---
  useEffect(() => {
    if (loginStage === 'awaitingPassword' && !isLocked) {
      inputRef.current?.focus();
    }
  }, [loginStage, isLocked]);

  // --- Set last login time on client mount to avoid hydration mismatch ---
  useEffect(() => {
    setLastLoginTime(new Date().toLocaleString());
  }, []); // Empty dependency array ensures this runs only once on the client

  // --- NEW: useEffect for Spinner Animation --- 
  useEffect(() => {
      let spinnerInterval: NodeJS.Timeout | undefined = undefined;
      if (processingLineIndex !== -1) {
          const spinnerFrames = ['/', '-', '\\', '|'];
          let currentFrameIndex = 0;
          spinnerInterval = setInterval(() => {
              currentFrameIndex = (currentFrameIndex + 1) % spinnerFrames.length;
              setSpinnerChar(spinnerFrames[currentFrameIndex]);
          }, 150);
      }

      return () => {
          if (spinnerInterval) clearInterval(spinnerInterval);
      };
  }, [processingLineIndex]); // Run when the processing line changes

  // --- NEW: useEffect for Driving MOTD Line Progression --- 
  useEffect(() => {
    // Only run if we are in the password stage and haven't finished all lines
    if (loginStage === 'awaitingPassword' && motdIndex < INITIAL_MOTD.length) {
        const currentLineInfo = INITIAL_MOTD[motdIndex];
        let lineTimer: NodeJS.Timeout | undefined = undefined;
        let okTimer: NodeJS.Timeout | undefined = undefined;

        if (currentLineInfo.requiresConfirmation) {
            // Start processing this line
            setProcessingLineIndex(motdIndex);

            // Set timer to finish processing and move to next line
            const totalDelay = 1500 + Math.random() * 500;
            okTimer = setTimeout(() => {
                setProcessingLineIndex(-1); // Stop processing animation
                // Use another timeout to ensure state update before advancing index
                setTimeout(() => setMotdIndex(prev => prev + 1), 50);
            }, totalDelay);

        } else {
            // No confirmation needed, just wait a bit and move to next line
            lineTimer = setTimeout(() => {
                setMotdIndex(prev => prev + 1);
            }, 150 + Math.random() * 100);
        }

        // Cleanup timers if component unmounts or dependencies change
        return () => {
            if (lineTimer) clearTimeout(lineTimer);
            if (okTimer) clearTimeout(okTimer);
            // Spinner interval is cleaned up by the other useEffect
        };
    }
  }, [loginStage, motdIndex]); // Depend on stage and current line index

  useEffect(() => { // Progress bar animation effect
    if (loginStage === 'showingProgress') {
        setProgress(0); 
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setLoginStage('showingWelcomeScreen');
                    return 100;
                }
                // Decrease increment from 10 to 4 to slow down animation
                return prev + 4; 
            });
        }, 100); // Keep interval at 100ms for smoothness
        return () => clearInterval(interval);
    }
  }, [loginStage]); 

  useEffect(() => { // Enter Key Listener
    if (loginStage === 'showingWelcomeScreen') {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          console.log('Enter pressed, proceeding...');
          onLoginSuccess(permissionsRef.current, isFullAccessRef.current);
          setLoginStage('loginComplete');
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [loginStage, onLoginSuccess]); 

  const handleLogin = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (loginStage !== 'awaitingPassword' || !inputValue || isLoading || isLocked) return;
    setIsLoading(true);
    setError(null);
    setLockoutMessage(null);
    try {
      const response = await fetch('/api/auth/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputValue }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok && data.success) {
        console.log('Login Successful via API! Starting progress...');
        permissionsRef.current = data.permissions || [];
        isFullAccessRef.current = data.isFullAccess || false;
        setIsShowingSuccessAnimation(true); 
        setLoginStage('showingProgress');
      } else {
        console.log('Login Failed via API:', data.error);
        setError(`[ERROR] ${data.error || 'Authentication failed.'}`);
        setInputValue('');
        setIsShowingSuccessAnimation(false);
        const currentAttempts = data.attemptsRemaining ?? attemptsRemaining - 1;
        const willLock = data.locked ?? currentAttempts <= 0;
        if (willLock) {
             setIsLocked(true);
             setLockoutMessage(data.error || `Too many failed attempts. Account locked.`);
             setAttemptsRemaining(0);
        } else {
             setAttemptsRemaining(currentAttempts);
             if (!document.hidden) {
                setTimeout(() => inputRef.current?.focus(), 0);
             }
        }
      }
    } catch (networkError) {
      console.error('Network error during login:', networkError);
      setError('[NETWORK ERROR] Could not connect to the server. Please try again later.');
      setIsLoading(false);
      setIsShowingSuccessAnimation(false);
      if (!isLocked && !document.hidden) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  }; 

  const renderHearts = () => {
    if (attemptsRemaining <= 0 || isLocked) return null;
    const hearts = Array.from({ length: attemptsRemaining });
    return (
        <div className="inline-flex items-center gap-1 ml-2">
            {hearts.map((_, index) => {
                const isLastHeart = attemptsRemaining === 1 && index === 0;
                return (
                    <Image
                        key={`heart-${index}`}
                        src="/images/icons/pixel-heart-red.png"
                        alt="Heart icon"
                        width={16}
                        height={16}
                        className={`inline-block align-middle ${isLastHeart ? 'animate-tremble' : ''}`}
                        unoptimized
                    />
                );
            })}
        </div>
    );
  };

  return (
    <div className={`font-mono text-sm sm:text-base w-full flex flex-col flex-grow p-4 sm:p-6 items-center min-h-full`}>

      {/* Stage 1: Awaiting Password */} 
      {loginStage === 'awaitingPassword' && (
        <>
          {/* ASCII Art - Conditional Display */}
          <pre
            className={`${themeColors.devTitleText ?? 'text-green-400'} mb-4 text-xs sm:text-sm leading-tight overflow-x-auto whitespace-pre w-full`}
            aria-hidden="true"
          >
            {SYSTEM_LOCKED_ASCII} 
          </pre>
          {/* Separator only shown in awaitingPassword stage */} 
          <div className="text-gray-600 mb-4 w-full">{SEPARATOR}</div>
          {/* MOTD - Dynamically Rendered */}
          <div className="mb-4 whitespace-pre-wrap text-gray-400 w-full min-h-[4em]">
            {INITIAL_MOTD.map((lineInfo, index) => {
              // Only render lines up to the current index
              if (index > motdIndex) return null;

              const baseText = lineInfo.text;
              
              // Case 1: Current line being processed with spinner
              if (index === processingLineIndex) {
                return <div key={index}>{`${baseText} [${spinnerChar}]`}</div>;
              }
              
              // Case 2: Line already processed and required confirmation
              if (index < motdIndex && lineInfo.requiresConfirmation) {
                return <div key={index}>{`${baseText} [ OK ]`}</div>;
              }
              
              // Case 3: Line already processed (no confirmation needed) or current line (no confirmation needed)
              return <div key={index}>{baseText}</div>;
            })}
          </div>
          {/* Separator only shown in awaitingPassword stage */} 
          <div className="text-gray-600 mb-4 w-full">{SEPARATOR}</div>
          {/* Static initial text - Hide during success animation? Optional. */}
          <div className="mb-4 whitespace-pre-wrap w-full"> 
              {lastLoginTime ? `Last login: ${lastLoginTime} from 127.0.0.1\n` : '\n'} 
              <span className={`${themeColors.devTitleText ?? 'text-yellow-500'}`}>WARNING:</span>{` Unauthorized access prohibited. Activity may be monitored.\n`}
          </div>
          {/* Command Prompt and Input Area / Success Animation */}
          <form onSubmit={handleLogin} className="w-full flex flex-col">
              <div className="flex items-center">
                  <span className={`${themeColors.devTitleText ?? 'text-green-400'}`}>[root@goodlab ~]$</span>
                  <span className="ml-2">login --developer-access</span>
              </div>
              <div className="mt-1 flex items-center">
              <label htmlFor="dev-password" className="mr-2 shrink-0">Password or Key:</label>
              <input
                  ref={inputRef}
                  id="dev-password"
                  name="password"
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading || isLocked}
                  className={`flex-grow bg-transparent border-none outline-none focus:ring-0 ${themeColors.devDescText ?? 'text-gray-300'} placeholder-gray-500 caret-green-400 ${isLocked ? 'cursor-not-allowed' : ''}`}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
              />
              </div>

              {/* Feedback Area */} 
              <div className="mt-4 whitespace-pre-wrap min-h-[3em]">
              {error && !isLocked && (
                  <div className={`${themeColors.errorText ?? 'text-red-500'}`}>
                      <span>{error}</span>
                      {renderHearts()} 
                  </div>
              )}
              {isLocked && (
                  <div className={`${themeColors.warningText ?? 'text-orange-500'}`}>{lockoutMessage || `[SYSTEM LOCKED] Too many failed attempts.`}</div>
              )}
              </div>
              <button type="submit" disabled={isLoading || isLocked} className="hidden"></button>
          </form>
        </>
      )}

      {/* Stage 2: Showing Progress */} 
      {loginStage === 'showingProgress' && (
        <div className="flex flex-col items-center flex-grow w-full h-full pt-20">
            <pre
              className={`${themeColors.devTitleText ?? 'text-green-400'} mb-4 text-xs sm:text-sm leading-tight overflow-x-auto whitespace-pre w-full text-center`}
              aria-hidden="true"
            >
                {SYSTEM_UNLOCKED_ASCII} 
            </pre>
            <div className="text-cyan-400 mb-2">Unlocking system modules...</div>
            <ProgressBar progress={progress} />
        </div>
      )}

      {/* Stage 3: Showing Welcome Screen */} 
      {loginStage === 'showingWelcomeScreen' && (
        <div className="flex flex-col items-center justify-center flex-grow text-center w-full h-full">
            <pre
              className={`${themeColors.devTitleText ?? 'text-green-400'} mb-6 text-xs sm:text-sm leading-tight overflow-x-auto whitespace-pre`}
              aria-hidden="true"
            >
                {GOODLAB_ASCII}
            </pre>
            <div className="mb-6 text-gray-300 text-sm sm:text-base leading-relaxed">
                Hark! The digital gates swing wide!<br />
                By key authenticated, access granted!<br />
                Enter now, esteemed colleague,<br />
                the hallowed halls of Nanchang University's<br />
                most esteemed computer laboratory.<br />
                Where silicon dreams take flight on digital wings!<br />
                <span className="block mt-2 font-semibold">Welcome to the GOOD Lab!</span>
            </div>
            <div className={`${themeColors.devTitleText ?? 'text-yellow-500'} animate-pulse text-lg`}>
                Press Enter to continue...
            </div>
        </div>
      )}

       {/* Stage 4: Login Complete */} 
      {loginStage === 'loginComplete' && (
          <div className="text-gray-500">Loading Developer Tools...</div>
      )}

    </div>
  );
};

export default DeveloperLogin;
