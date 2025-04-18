"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserCog,
  KeyRound,
  ClipboardCopy,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { themeColors } from "@/styles/theme";

// Placeholder for Member data structure (adjust based on actual query later)
interface SimpleMember {
  id: string;
  username: string | null;
  role_name: string | null;
  email: string | null;
  name_en: string;
}

interface UserManagerProps {
  onClose: () => void; // Function to close this tool view
}

const UserManager: React.FC<UserManagerProps> = ({ onClose }) => {
  const [members, setMembers] = useState<SimpleMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resettingPasswordFor, setResettingPasswordFor] = useState<
    string | null
  >(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch members from the new API endpoint
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching members from API...");
        const response = await fetch("/api/users"); // Call the new endpoint
        const data = await response.json();

        if (response.ok && data.success) {
          setMembers(data.data); // Set members from API response
        } else {
          setError(data.error || "Failed to load members.");
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []); // Run once on mount

  const handleResetPassword = useCallback(async (username: string | null) => {
    if (!username) {
      setError("Cannot reset password for user without a username.");
      return;
    }
    setResettingPasswordFor(username);
    setError(null);
    setGeneratedPassword(null);
    setCopySuccess(false);

    try {
      const response = await fetch(`/api/users/${username}/reset-password`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setGeneratedPassword(data.newPassword);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      // Keep loading state specific to the button, maybe?
      // For now, simply stop the overall loading feel after the attempt.
      setResettingPasswordFor(null); // Reset loading state regardless of success/failure
    }
  }, []);

  const handleCopyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard
        .writeText(generatedPassword)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000); // Hide success message after 2s
        })
        .catch((err) => {
          console.error("Failed to copy password: ", err);
          setError("Failed to copy password to clipboard.");
        });
    }
  };

  return (
    <div>
      <h3
        className={`text-xl font-semibold mb-6 flex items-center gap-2 ${themeColors.devTitleText ?? "text-green-400"}`}
      >
        <UserCog size={24} /> User Management
      </h3>

      {isLoading && (
        <p className={`${themeColors.devDescText}`}>Loading users...</p>
      )}
      {error && (
        <div
          className={`p-4 mb-4 text-sm ${themeColors.errorText} bg-red-100 rounded-lg`}
          role="alert"
        >
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      {generatedPassword && (
        <div
          className={`p-4 mb-4 text-sm ${themeColors.successText} bg-green-100 rounded-lg relative`}
          role="alert"
        >
          <span className="font-medium">Password Reset Successful!</span> New
          password:
          <code className="ml-2 font-bold select-all">{generatedPassword}</code>
          <button
            onClick={handleCopyToClipboard}
            title="Copy to Clipboard"
            className={`ml-3 p-1 rounded hover:bg-green-200 transition-colors ${copySuccess ? "text-blue-600" : "text-gray-600"}`}
          >
            <ClipboardCopy size={16} />
          </button>
          {copySuccess && (
            <span className="ml-2 text-xs text-blue-700">Copied!</span>
          )}
          <p className="text-xs mt-1">
            Please securely convey this password to the user.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className={`min-w-full ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-lg shadow`}
        >
          <thead
            className={`${themeColors.devMutedBg} ${themeColors.devMutedText} text-xs uppercase`}
          >
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`${themeColors.devDescText} divide-y ${themeColors.devBorder} divide-gray-700`}
          >
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.name_en}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.username || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.role_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleResetPassword(member.username)}
                      disabled={
                        !member.username ||
                        resettingPasswordFor === member.username
                      }
                      className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium ${themeColors.textWhite ?? "text-white"} ${!member.username ? "bg-gray-500 cursor-not-allowed" : resettingPasswordFor === member.username ? "bg-yellow-600 animate-pulse" : "bg-yellow-500 hover:bg-yellow-600"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-400 transition-colors disabled:opacity-50`}
                      title={
                        !member.username
                          ? "Cannot reset password without username"
                          : "Reset Password"
                      }
                    >
                      {resettingPasswordFor === member.username ? (
                        <RefreshCw size={14} className="mr-1 animate-spin" />
                      ) : (
                        <KeyRound size={14} className="mr-1" />
                      )}
                      {resettingPasswordFor === member.username
                        ? "Resetting..."
                        : "Reset Pwd"}
                    </button>
                    {/* TODO: Add Edit User button later */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Close button if needed, or rely on the Back button provided by dashboard */}
      {/* <button onClick={onClose} className="mt-6 ...">Close User Management</button> */}
    </div>
  );
};

export default UserManager;
