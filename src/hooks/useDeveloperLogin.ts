"use client"; // Hooks used in client components need this

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSessionStorage } from "usehooks-ts"; // Restore import
// Remove direct credential/permission imports as they are handled by the API now
/*
import {
  developerCredentials,
  developerPermissions,
  DeveloperPermission,
  DeveloperCredential,
} from "@/config/developerCredentials";
*/
// Only import the data, not the type
import { developerMotd } from "@/config/developerMotd";
// Import the Zustand store hook
import { useAuthStore } from '@/store/authStore';

// Define MotdLine locally
interface MotdLine {
  text: string;
  requiresConfirmation?: boolean;
}

// Define API response types (matching the API route)
interface LoginSuccessResponse {
  success: true;
  permissions: string[];
  isFullAccess: boolean;
}
interface LoginErrorResponse {
  success: false;
  error: { code: string; message: string };
}
type LoginApiResponse = LoginSuccessResponse | LoginErrorResponse;

// Define Login Stages Type (can be shared or defined here)
export type LoginStage =
  | "awaitingPassword"
  | "validating"
  | "unlocking"
  | "welcome"
  | "loginComplete";

// Define the shape of the data returned by the login API
interface LoginResponse {
  success: boolean;
  permissions?: string[];
  isFullAccess?: boolean;
  error?: string;
  attemptsRemaining?: number;
  locked?: boolean;
}

// Define the return type for the hook
export interface UseDeveloperLoginReturn {
  username: string;
  password: string;
  error: string | null;
  loginStage: LoginStage;
  attemptsRemaining: number;
  isLocked: boolean;
  lockoutMessage: string | null;
  displayMotd: boolean;
  isMotdComplete: boolean;
  motdContent: MotdLine[];
  motdIndex: number;
  processingIndex: number;
  spinnerChar: string;
  usernameInputRef: React.RefObject<HTMLInputElement | null>;
  passwordInputRef: React.RefObject<HTMLInputElement | null>;
  motdContainerRef: React.RefObject<HTMLDivElement | null>;
  handleUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>;
  skipMotd: () => void;
  handleMotdComplete: () => void;
  currentBootMessageIndex: number;
  bootMessages: string[];
  handleLogout: () => void;
  loggedInUsername: string | null;
  handleSkipAnimation: () => void;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MOTD_LINE_DELAY = 150; // ms delay between lines
const MOTD_SPINNER_DELAY = 100; // ms delay for spinner animation
const SPINNER_CHARS = ["|", "/", "-", "\\"];

// --- Define Boot Messages ---
const bootMessages = [
  "Initializing core system... ",
  "Loading kernel modules....... [ OK ]",
  "Mounting virtual filesystems... [ OK ]",
  "Checking disk integrity........ [ OK ]",
  "Starting authentication service... [ OK ]",
  "Loading user profile........... [ OK ]",
  "Finalizing system setup....... ",
  "System unlocked. Stand by... ",
];
const BOOT_MESSAGE_INTERVAL = 300; // ms between messages
const FINAL_BOOT_PAUSE = 500; // ms after last message before welcome

// Utility function to calculate remaining lockout time
const calculateRemainingLockout = (lockoutTime: number | null): number => {
  if (!lockoutTime) return 0;
  const remaining = lockoutTime - Date.now();
  return remaining > 0 ? remaining : 0;
};

// Define localStorage keys
const AUTH_DETAILS_KEY = 'developerAuthDetails';

// Define type for temporary auth data storage
interface TempAuthData {
    permissions: string[];
    isFullAccess: boolean;
    username: string; // Keep username for potential use
}

// Define type for persisted auth data in localStorage
interface PersistedAuthData extends TempAuthData {
    timestamp: number; // Add timestamp for potential expiry logic later
}

export const useDeveloperLogin = (): UseDeveloperLoginReturn => {
  const router = useRouter();
  const zustandLogin = useAuthStore((state) => state.login);
  const zustandLogout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loggedInUsernameFromStore = useAuthStore((state) => state.username);

  // --- State Variables ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Add state for temporary auth data storage
  const [tempAuthData, setTempAuthData] = useState<TempAuthData | null>(null);
  // Initialize loginStage based on persisted state
  const [loginStage, setLoginStage] = useState<LoginStage>(() => {
    // Check localStorage only on the client side
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem(AUTH_DETAILS_KEY);
      if (storedAuth) {
        try {
          // Use the more specific type for parsing
          const parsedAuth: PersistedAuthData = JSON.parse(storedAuth);
          // Check for required fields including username
          if (parsedAuth && parsedAuth.username && parsedAuth.permissions && typeof parsedAuth.isFullAccess === 'boolean') {
            // Don't update Zustand here, do it in useEffect
            return "loginComplete"; // Start in complete state
          }
        } catch (e) {
          console.error("Error parsing stored auth details:", e);
          localStorage.removeItem(AUTH_DETAILS_KEY); // Clear invalid item
        }
      }
    }
    return "awaitingPassword"; // Default state
  });
  const [error, setError] = useState<string | null>(null);
  const [motdContent] = useState<MotdLine[]>(developerMotd);
  // Adjust initial MOTD display based on initial login stage
  const [displayMotd, setDisplayMotd] = useState(loginStage === 'awaitingPassword');
  const [isMotdComplete, setIsMotdComplete] = useState(loginStage !== 'awaitingPassword');
  const [motdIndex, setMotdIndex] = useState(0);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [spinnerChar, setSpinnerChar] = useState(SPINNER_CHARS[0]);
  const [currentBootMessageIndex, setCurrentBootMessageIndex] = useState(-1);

  const [loginAttempts, setLoginAttempts] = useSessionStorage<number>(
    "devLoginAttempts",
    MAX_LOGIN_ATTEMPTS,
  );
  const [lockoutTime, setLockoutTime] = useSessionStorage<number | null>(
    "devLockoutTime",
    null,
  );

  // --- Refs ---
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const motdContainerRef = useRef<HTMLDivElement>(null);
  const lockoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const motdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spinnerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Refs for timers to clear them on skip ---
  const bootMessageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bootTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const welcomeKeyListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null);

  // --- Derived State ---
  const attemptsRemaining = loginAttempts;
  const remainingLockoutTime = calculateRemainingLockout(lockoutTime);
  const isLocked = remainingLockoutTime > 0;
  const lockoutMessage = isLocked
    ? `Too many failed attempts. Account locked. Please wait ${Math.ceil(remainingLockoutTime / 1000)} seconds.`
    : null;

  // --- Effects ---

  // Effect to initialize Zustand state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem(AUTH_DETAILS_KEY);
      if (storedAuth) {
        try {
          // Use the specific type
          const parsedAuth: PersistedAuthData = JSON.parse(storedAuth);
          // Only update Zustand if it's not already authenticated and parsed data is valid
          if (parsedAuth && parsedAuth.username && parsedAuth.permissions && typeof parsedAuth.isFullAccess === 'boolean' && !isAuthenticated) {
            console.log("Restoring auth state from localStorage...");
            // Pass username to zustandLogin
            zustandLogin(parsedAuth.username, parsedAuth.permissions, parsedAuth.isFullAccess);
            // Ensure login stage reflects the restored state
            if (loginStage !== 'loginComplete') {
                setLoginStage('loginComplete');
                setIsMotdComplete(true);
                setDisplayMotd(false);
            }
          }
        } catch (e) {
          console.error("Error parsing stored auth details during mount:", e);
          localStorage.removeItem(AUTH_DETAILS_KEY);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep dependencies minimal for mount effect

  useEffect(() => {
    if (!displayMotd || isMotdComplete) return;

    spinnerTimerRef.current = setInterval(() => {
      setSpinnerChar(
        (prev) =>
          SPINNER_CHARS[
            (SPINNER_CHARS.indexOf(prev) + 1) % SPINNER_CHARS.length
          ],
      );
    }, MOTD_SPINNER_DELAY);

    motdTimerRef.current = setInterval(() => {
      setMotdIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= motdContent.length) {
          clearInterval(motdTimerRef.current!);
          clearInterval(spinnerTimerRef.current!);
          setProcessingIndex(-1);
          if (!isMotdComplete) {
            handleMotdCompleteInternal();
          }
          return prevIndex;
        } else {
          setProcessingIndex(nextIndex);
          return nextIndex;
        }
      });
    }, MOTD_LINE_DELAY);

    return () => {
      if (motdTimerRef.current) clearInterval(motdTimerRef.current);
      if (spinnerTimerRef.current) clearInterval(spinnerTimerRef.current);
    };
  }, [displayMotd, isMotdComplete, motdContent.length]);

  useEffect(() => {
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
      lockoutTimerRef.current = null;
    }
    if (isLocked) {
      lockoutTimerRef.current = setInterval(() => {
        const newRemaining = calculateRemainingLockout(lockoutTime);
        if (newRemaining <= 0) {
          setLockoutTime(null);
          setLoginAttempts(MAX_LOGIN_ATTEMPTS);
          setError(null);
          if (lockoutTimerRef.current) {
            clearInterval(lockoutTimerRef.current);
            lockoutTimerRef.current = null;
          }
          if (isMotdComplete) {
            usernameInputRef.current?.focus();
          }
        }
      }, 1000);
    }
    return () => {
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
        lockoutTimerRef.current = null;
      }
    };
  }, [
    isLocked,
    lockoutTime,
    setLoginAttempts,
    isMotdComplete,
  ]);

  useEffect(() => {
    if (isMotdComplete && !isLocked && loginStage === "awaitingPassword") {
      const focusTimeout = setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(focusTimeout);
    }
  }, [isMotdComplete, isLocked, loginStage]);

  // --- MODIFIED Effect for Boot Animation (unlocking stage) ---
  useEffect(() => {
    let bootInterval: NodeJS.Timeout | null = null;
    let welcomeTimeout: NodeJS.Timeout | null = null;

    if (loginStage === "unlocking") {
      setCurrentBootMessageIndex(0); // Start showing messages
      bootInterval = setInterval(() => {
        setCurrentBootMessageIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= bootMessages.length) {
            // Last message shown, clear interval and set timeout for welcome stage
            if (bootInterval) clearInterval(bootInterval);
            
            // --- MODIFICATION --- 
            // Just set the stage to welcome. DO NOT update Zustand/localStorage here.
            welcomeTimeout = setTimeout(() => {
              console.log("Boot sequence complete. Setting stage to welcome.");
              setLoginStage("welcome");
            }, FINAL_BOOT_PAUSE);
            // --- END MODIFICATION --- 
            
            return prevIndex; // Stay at the last index
          } else {
            return nextIndex;
          }
        });
      }, BOOT_MESSAGE_INTERVAL);
    } else {
      // Reset index if stage changes away from unlocking
      setCurrentBootMessageIndex(-1); 
    }

    // Cleanup function
    return () => {
      if (bootInterval) clearInterval(bootInterval);
      if (welcomeTimeout) clearTimeout(welcomeTimeout);
    };
  // REMOVED zustandLogin from dependencies here
  }, [loginStage]); 

  // --- Helper to finalize login (used by skip and welcome Enter) ---
  const finalizeLogin = useCallback(() => {
    if (tempAuthData) {
      console.log("Finalizing login...");
      // Persist auth details to localStorage
      const authDataToPersist: PersistedAuthData = {
          ...tempAuthData,
          timestamp: Date.now(),
      };
      localStorage.setItem(AUTH_DETAILS_KEY, JSON.stringify(authDataToPersist));

      // Update Zustand store with the temporarily stored auth data
      zustandLogin(tempAuthData.username, tempAuthData.permissions, tempAuthData.isFullAccess);

      setLoginStage("loginComplete"); // Mark login as fully complete
      setTempAuthData(null); // Clear temporary data
    } else {
        console.warn("Attempted to finalize login without tempAuthData.");
    }
  }, [tempAuthData, zustandLogin]);

  // --- MOTD Handlers (Keep them defined before they are used/returned) ---
  const handleMotdCompleteInternal = useCallback(() => {
    if (motdTimerRef.current) clearInterval(motdTimerRef.current);
    if (spinnerTimerRef.current) clearInterval(spinnerTimerRef.current);
    setMotdIndex(motdContent.length);
    setProcessingIndex(-1);
    setIsMotdComplete(true);
    setDisplayMotd(false);
  }, [motdContent.length]);

  const skipMotd = useCallback(() => {
    handleMotdCompleteInternal();
  }, [handleMotdCompleteInternal]);

  const handleMotdComplete = useCallback(() => {
    handleMotdCompleteInternal();
  }, [handleMotdCompleteInternal]);

  // --- Skip Animation Handler ---
  const handleSkipAnimation = useCallback(() => {
    if ((loginStage === "unlocking" || loginStage === "welcome") && tempAuthData) {
      console.log(`Skip requested during stage: ${loginStage}. Finalizing...`);

      // Clear any running animation timers
      if (bootMessageIntervalRef.current) {
        clearInterval(bootMessageIntervalRef.current);
        bootMessageIntervalRef.current = null;
      }
      if (bootTimeoutRef.current) {
        clearTimeout(bootTimeoutRef.current);
        bootTimeoutRef.current = null;
      }
       if (welcomeKeyListenerRef.current) {
          window.removeEventListener("keydown", welcomeKeyListenerRef.current);
          welcomeKeyListenerRef.current = null;
      }

      finalizeLogin();
    } else {
        console.log(`Skip ignored. Stage: ${loginStage}, TempAuthData: ${!!tempAuthData}`);
    }
  }, [loginStage, tempAuthData, finalizeLogin]);

  // --- Login Handler ---
  const handleLogin = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      if (event) event.preventDefault();
      if (isLocked || loginStage !== "awaitingPassword") return;

      setLoginStage("validating");
      setError(null);
      setCurrentBootMessageIndex(-1);

      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

        const response = await fetch("/api/auth/developer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data: LoginApiResponse = await response.json();

        if (!response.ok || !data.success) {
            // ... (error handling: set error, decrement attempts, potential lockout)
            const errorMessage = data.success === false
                ? data.error.message
                : `API Error: ${response.status} ${response.statusText}`;
            setError(errorMessage);
            const newAttempts = loginAttempts - 1;
            setLoginAttempts(newAttempts);
            if (newAttempts <= 0) {
                const newLockoutTime = Date.now() + LOCKOUT_DURATION;
                setLockoutTime(newLockoutTime);
                setError(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 1000 / 60} minutes.`);
            } else {
                setError(`${errorMessage} ${newAttempts} attempts remaining.`);
            }
            setLoginStage("awaitingPassword");
            passwordInputRef.current?.select();
            return;
        }

        // --- Login Successful --- 
        if (data.success === true) {
          console.log("Login successful. API Response:", data);
          setTempAuthData({
            username: username,
            permissions: data.permissions,
            isFullAccess: data.isFullAccess,
          });
          setError(null);
          setLoginAttempts(MAX_LOGIN_ATTEMPTS);
          setLockoutTime(null);
          setLoginStage("unlocking"); // Move to unlocking stage
          console.log("Stage set to unlocking. Temp Auth Data:", { /* ... */ });
        }
      } catch (err: any) {
        console.error("Login fetch error:", err);
        setError("Failed to connect to authentication service.");
        setLoginStage("awaitingPassword");
      }
    },
    [
      username, // Keep username as dependency
      password,
      isLocked,
      loginStage,
      loginAttempts,
      setLoginAttempts,
      setLockoutTime,
    ],
  );

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
    },
    [],
  );

  const handlePasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );

  // --- Implement Logout Logic --- 
  const handleLogout = useCallback(() => {
    console.log("Handling logout...");
    localStorage.removeItem(AUTH_DETAILS_KEY); // Clear persisted auth
    zustandLogout(); // Reset Zustand state
    setUsername(""); // Clear sensitive state if needed
    setPassword("");
    setTempAuthData(null);
    // Reset login stage, attempts, lockout etc.
    setLoginStage("awaitingPassword");
    setIsMotdComplete(false);
    setDisplayMotd(true);
    setMotdIndex(0);
    setError(null);
    setLoginAttempts(MAX_LOGIN_ATTEMPTS);
    setLockoutTime(null);
    // Optionally redirect if needed, or let the page component handle it
    // router.push('/'); // Example redirect
  }, [zustandLogout, setLoginAttempts, setLockoutTime]);

  // --- Konami Code Effect (Moved after handler definitions) --- 
  // (Should only reveal login prompt now)
  useEffect(() => {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let currentIndex = 0;

    const handleKonami = (event: KeyboardEvent) => {
      // Only process if awaiting password and not locked
      if (loginStage !== 'awaitingPassword' || isLocked) return;

      if (event.key.toLowerCase() === konamiSequence[currentIndex].toLowerCase()) {
        currentIndex++;
        if (currentIndex === konamiSequence.length) {
          console.log("Konami Code detected! Revealing login prompt.");
          currentIndex = 0; // Reset sequence

          // Action: Ensure login form is ready
          if (!isMotdComplete) {
            skipMotd(); // skipMotd is now defined before usage
          }

          // Ensure focus is on the username input
          setTimeout(() => {
            usernameInputRef.current?.focus();
          }, 50);
        }
      } else {
        // Reset sequence logic
        if (event.key.toLowerCase() === konamiSequence[0].toLowerCase()) {
          currentIndex = 1;
        } else {
          currentIndex = 0;
        }
      }
    };

    // Add listener only when awaiting password and not locked
    document.addEventListener('keydown', handleKonami);
    if (loginStage === 'awaitingPassword' && !isLocked) {
        console.log("Konami Code listener active (Reveal Mode).");
    }


    return () => {
      document.removeEventListener('keydown', handleKonami);
    };
    // Dependencies are correct now
  }, [loginStage, isLocked, skipMotd, isMotdComplete]);

  // --- Effect to handle 'Enter' key press on Welcome screen ---
  useEffect(() => {
    let specificListener: ((event: KeyboardEvent) => void) | undefined;

    if (loginStage === "welcome") {
      specificListener = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
           finalizeLogin();
        }
      };
      welcomeKeyListenerRef.current = specificListener; // Store the listener
      window.addEventListener("keydown", specificListener);
    }

    // Cleanup function for this specific effect
    return () => {
      if (specificListener) {
        window.removeEventListener("keydown", specificListener);
        // Check if the ref still holds the listener we are cleaning up
        if (welcomeKeyListenerRef.current === specificListener) {
             welcomeKeyListenerRef.current = null; // Assign null on cleanup
        }
      }
    };
  }, [loginStage, finalizeLogin]);

  // --- Effect to progress after unlocking animation (MODIFIED FOR SKIP) ---
  useEffect(() => {
    let cleanupFunc = () => {}; // Initialize empty cleanup

    if (loginStage === "unlocking") {
      // --- Key listener for early Enter skip during unlocking ---
      const handleEarlyEnter = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
           handleSkipAnimation();
        }
      };
      window.addEventListener("keydown", handleEarlyEnter);
      // --------------------------------------------------------

      // Start showing boot messages
      setCurrentBootMessageIndex(0);

      bootMessageIntervalRef.current = setInterval(() => { // Store interval ID
          // ... (boot message interval logic) ...
      }, BOOT_MESSAGE_INTERVAL);


      // Define cleanup for this effect
      cleanupFunc = () => {
        window.removeEventListener("keydown", handleEarlyEnter); // Remove early Enter listener
        if (bootMessageIntervalRef.current) {
          clearInterval(bootMessageIntervalRef.current);
          bootMessageIntervalRef.current = null;
        }
        if (bootTimeoutRef.current) {
          clearTimeout(bootTimeoutRef.current);
          bootTimeoutRef.current = null;
        }
        setCurrentBootMessageIndex(-1); // Reset on cleanup
      };
    }

    return cleanupFunc; // Return the specific cleanup function
  }, [loginStage, handleSkipAnimation]); // Add handleSkipAnimation dependency

  // --- MOTD Effects and other logic remain largely unchanged ---
  // ... (useEffect for MOTD animation, etc.) ...

  // --- Return Values ---
  return {
    username,
    password,
    error,
    loginStage,
    attemptsRemaining,
    isLocked,
    lockoutMessage,
    displayMotd,
    isMotdComplete,
    motdContent,
    motdIndex,
    processingIndex,
    spinnerChar,
    usernameInputRef,
    passwordInputRef,
    motdContainerRef,
    handleUsernameChange,
    handlePasswordChange,
    handleLogin,
    skipMotd,
    handleMotdComplete,
    currentBootMessageIndex,
    bootMessages,
    handleLogout,
    loggedInUsername: loggedInUsernameFromStore,
    handleSkipAnimation,
  };
};
