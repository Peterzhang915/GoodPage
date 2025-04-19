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

export const useDeveloperLogin = (): UseDeveloperLoginReturn => {
  const router = useRouter();
  const zustandLogin = useAuthStore((state) => state.login);
  const zustandLogout = useAuthStore((state) => state.logout); // Get logout action
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Get current auth state

  // --- State Variables ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Initialize loginStage based on persisted state
  const [loginStage, setLoginStage] = useState<LoginStage>(() => {
    // Check localStorage only on the client side
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem(AUTH_DETAILS_KEY);
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth && parsedAuth.permissions && typeof parsedAuth.isFullAccess === 'boolean') {
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
          const parsedAuth: { permissions: string[]; isFullAccess: boolean } = JSON.parse(storedAuth);
          // Only update Zustand if it's not already authenticated
          if (parsedAuth && parsedAuth.permissions && typeof parsedAuth.isFullAccess === 'boolean' && !isAuthenticated) {
            console.log("Restoring auth state from localStorage...");
            zustandLogin(parsedAuth.permissions, parsedAuth.isFullAccess);
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
  }, []); // Run only once on mount

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
            welcomeTimeout = setTimeout(() => {
              setLoginStage("welcome");
            }, FINAL_BOOT_PAUSE);
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
  }, [loginStage]); // Only depend on loginStage

  // --- Handlers ---

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
          // 1. Store auth details in localStorage
          const authDataToStore = {
            permissions: data.permissions,
            isFullAccess: data.isFullAccess,
            // Add username for potential display later?
            username: username,
            timestamp: Date.now() // Add timestamp for potential expiration later
          };
          localStorage.setItem(AUTH_DETAILS_KEY, JSON.stringify(authDataToStore));
          console.log("Auth details saved to localStorage.");

          // 2. Update Zustand store
          zustandLogin(data.permissions, data.isFullAccess);
          console.log("Zustand store updated.");

          // 3. Reset login attempts/lockout
          setLoginAttempts(MAX_LOGIN_ATTEMPTS);
          setLockoutTime(null);

          // 4. Transition to next stage (unlocking/welcome)
          setLoginStage("unlocking");
        }
      } catch (err: any) {
        console.error("Login fetch error:", err);
        setError("Failed to connect to authentication service.");
        setLoginStage("awaitingPassword");
      }
    },
    [
      username, // Add username dependency
      password,
      isLocked,
      loginStage,
      loginAttempts,
      setLoginAttempts,
      setLockoutTime,
      zustandLogin,
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
    console.log("Logging out developer...");
    // 1. Clear localStorage
    localStorage.removeItem(AUTH_DETAILS_KEY);
    // 2. Clear Zustand store
    zustandLogout();
    // 3. Reset local state of the hook
    setUsername("");
    setPassword("");
    setError(null);
    setLoginAttempts(MAX_LOGIN_ATTEMPTS); // Reset attempts
    setLockoutTime(null); // Clear lockout
    setLoginStage("awaitingPassword"); // Go back to login prompt
    setIsMotdComplete(false); // Re-enable MOTD for next login
    setDisplayMotd(true);
    setMotdIndex(0);
    setCurrentBootMessageIndex(-1); // Reset boot sequence
    console.log("Developer logged out.");
    // Optionally redirect, though often handled by consuming component
    // router.push('/'); 
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

  // Effect to handle Enter key press in welcome stage to proceed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Enter key is pressed and the stage is welcome
      if (event.key === "Enter" && loginStage === "welcome") {
        event.preventDefault();
        console.log("Enter pressed in welcome stage, proceeding...");

        // Check the global auth state from Zustand
        // Access the store directly within the handler using useAuthStore.getState()
        const currentAuthState = useAuthStore.getState();

        if (currentAuthState.isAuthenticated) {
          // If authenticated (state already set by handleLogin/Konami/initial load),
          // simply transition to the final stage and navigate.
          console.log("Authenticated, navigating to /developer");
          setLoginStage("loginComplete");
          router.push("/developer");
        } else {
          // This case should ideally not happen if logic is correct,
          // but as a fallback, log an error and reset.
          console.error("Auth state not found in Zustand store when trying to complete login.");
          setError("An internal error occurred. Please try logging in again.");
          // Call logout to ensure clean state
          handleLogout(); // Reset everything
        }
      }
    };

    // Add listener only when in welcome stage
    if (loginStage === "welcome") {
      document.addEventListener("keydown", handleKeyDown);
      console.log("Welcome stage active, listening for Enter key...");
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      console.log("Cleaning up Enter key listener.");
    };
    // Dependency should include loginStage and potentially handleLogout
  }, [loginStage, router, handleLogout]); // Removed zustandLogin, no longer calling it here

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
  };
};
