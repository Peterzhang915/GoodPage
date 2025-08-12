"use client";

import React, { RefObject, FormEvent } from "react";
import Image from "next/image";
import { LoginStage } from "@/hooks/useDeveloperLogin";
import TextProgressBar from "./TextProgressBar";

// Define props for the LoginInputForm component
interface LoginInputFormProps {
  usernameValue: string;
  passwordValue: string;
  onUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void> | void;
  loginStage: LoginStage;
  error: string | null;
  attemptsRemaining: number;
  isLocked: boolean;
  lockoutMessage: string | null;
  usernameInputRef: RefObject<HTMLInputElement | null>;
  passwordInputRef: RefObject<HTMLInputElement | null>;
}

// Define Separator locally if not imported (assuming it's defined in DeveloperLogin.tsx)
const Separator = () => (
  <div className="text-gray-600 my-2">
    --------------------------------------------------------------------------
  </div>
);

const LoginInputForm: React.FC<LoginInputFormProps> = ({
  usernameValue,
  passwordValue,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  loginStage,
  error,
  attemptsRemaining,
  isLocked,
  lockoutMessage,
  usernameInputRef,
  passwordInputRef,
}) => {
  // Define the handler within the component to ensure correct type context
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    if (onSubmit) {
      // Call the passed onSubmit function (which might be async)
      const result = onSubmit(event);
      // Handle potential promise return if necessary (optional)
      if (result instanceof Promise) {
        result.catch((err) => {
          console.error("Error in onSubmit handler:", err);
          // Handle potential errors from the async submit function if needed
        });
      }
    }
  };

  // Determine if inputs should be disabled
  const isDisabled = isLocked || loginStage === "validating";

  return (
    <form onSubmit={handleSubmit} className="">
      {/* Lockout Message */}
      {isLocked && lockoutMessage && (
        <div className="text-red-500 font-bold p-3 bg-red-900/30 border border-red-700 rounded mb-4 text-sm">
          {lockoutMessage}
        </div>
      )}

      {/* Username Input */}
      <div className="mb-1">
        <label htmlFor="dev-username" className="mr-1 text-green-400 text-sm">
          Username:
        </label>
        <input
          ref={usernameInputRef}
          id="dev-username"
          type="text"
          value={usernameValue}
          onChange={onUsernameChange}
          autoComplete="username"
          disabled={isDisabled}
          className={`px-1 py-0.5 bg-transparent text-green-400 focus:outline-none caret-cyan-400 disabled:opacity-50 text-sm align-baseline`}
          size={30}
        />
      </div>

      {/* Password Input */}
      <div className="mb-1">
        <label htmlFor="dev-password" className="mr-1 text-green-400 text-sm">
          Password:
        </label>
        <input
          ref={passwordInputRef}
          id="dev-password"
          type="password"
          value={passwordValue}
          onChange={onPasswordChange}
          autoComplete="current-password"
          disabled={isDisabled}
          className={`px-1 py-0.5 bg-transparent text-green-400 focus:outline-none caret-cyan-400 disabled:opacity-50 text-sm align-baseline`}
          size={30}
        />
      </div>

      {/* Status/Error Area */}
      <div className="mt-2 text-sm font-medium min-h-[1.25rem]">
        {loginStage === "validating" && (
          <div className="flex items-center text-yellow-400">
            <TextProgressBar interval={80} total={25} />
            <span className="ml-2">Validating credentials...</span>
          </div>
        )}
        {loginStage === "awaitingPassword" && error && !isLocked && (
          <>
            <Separator />
            <div className="text-red-500">[ERROR] {error}</div>
          </>
        )}
      </div>

      {/* Hidden submit button */}
      <button type="submit" disabled={isDisabled} className="hidden"></button>
    </form>
  );
};

export default LoginInputForm;
