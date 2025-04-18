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

export const useDeveloperLogin = (): UseDeveloperLoginReturn => {
  const router = useRouter();
  // Get the login action from the Zustand store
  const zustandLogin = useAuthStore((state) => state.login);

  // --- State Variables ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStage, setLoginStage] = useState<LoginStage>("awaitingPassword");
  const [error, setError] = useState<string | null>(null);
  const [motdContent] = useState<MotdLine[]>(developerMotd);
  const [displayMotd, setDisplayMotd] = useState(true);
  const [isMotdComplete, setIsMotdComplete] = useState(false);
  const [motdIndex, setMotdIndex] = useState(0);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [spinnerChar, setSpinnerChar] = useState(SPINNER_CHARS[0]);
  const [authDetails, setAuthDetails] = useState<{ permissions: string[]; isFullAccess: boolean } | null>(null);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && loginStage === "welcome") {
        event.preventDefault();
        console.log("Enter pressed in welcome stage, proceeding...");
        if (authDetails) {
          zustandLogin(authDetails.permissions, authDetails.isFullAccess);
          setLoginStage("loginComplete");
          router.push("/developer");
        } else {
          console.error("Auth details missing when trying to complete login.");
          setError("An internal error occurred during login.");
          setLoginStage("awaitingPassword");
        }
      }
    };

    if (loginStage === "welcome") {
      document.addEventListener("keydown", handleKeyDown);
      console.log("Welcome stage active, listening for Enter key...");
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      console.log("Cleaning up Enter key listener.");
    };
  }, [loginStage, authDetails, router, zustandLogin]);

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
      setAuthDetails(null);
      setCurrentBootMessageIndex(-1); // Reset boot index here too

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch("/api/auth/developer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data: LoginApiResponse = await response.json();

        if (!response.ok || !data.success) {
          const errorMessage = data.success === false 
            ? data.error.message 
            : `API Error: ${response.status} ${response.statusText}`;
          setError(errorMessage);

          const newAttempts = loginAttempts - 1;
          setLoginAttempts(newAttempts);
          if (newAttempts <= 0) {
            const newLockoutTime = Date.now() + LOCKOUT_DURATION;
            setLockoutTime(newLockoutTime);
            setError(
              `Too many failed attempts. Account locked for ${
                LOCKOUT_DURATION / 1000 / 60
              } minutes.`,
            );
          } else {
            setError(`${errorMessage} ${newAttempts} attempts remaining.`);
          }
          setLoginStage("awaitingPassword");
          passwordInputRef.current?.select();
          return;
        }

        if (data.success === true) {
          setAuthDetails({ permissions: data.permissions, isFullAccess: data.isFullAccess });
          setLoginAttempts(MAX_LOGIN_ATTEMPTS);
          setLockoutTime(null);
          setLoginStage("unlocking");
        }
      } catch (err: any) {
        console.error("Login fetch error:", err);
        setError("Failed to connect to authentication service.");
        setLoginStage("awaitingPassword");
      }
    },
    [
      username,
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
  };
};
