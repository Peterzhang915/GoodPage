"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, Edit, UserPlus, AlertTriangle } from "lucide-react";
import Link from 'next/link';
// Placeholder - Add necessary imports if this component gets implemented

// Placeholder for Member type - ideally import from a shared types file
interface Member {
  id: string;
  name_en: string;
  name_zh?: string | null; // Make optional
  status: string; // Assuming status is a string for now
  avatar_url?: string | null; // Make optional
  // Add other relevant fields if needed for display
}

interface MemberManagerProps {
  onClose: () => void;
  // Add a prop to handle selecting a member for editing
}

const MemberManager: React.FC<MemberManagerProps> = ({ onClose }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/members"); // Assuming this endpoint exists
      if (!res.ok) {
        let errorMsg = `Failed to fetch members (Status: ${res.status})`;
        try {
            const errorData = await res.json();
            if (errorData && errorData.error && errorData.error.message) {
                errorMsg = errorData.error.message;
            }
        } catch (e) { /* Ignore parsing error */ }
        throw new Error(errorMsg);
      }
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setMembers(result.data);
      } else {
          throw new Error("Invalid data format received from API.");
      }
    } catch (err) {
      console.error("Fetch members error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching members.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="mt-10 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400">Manage Members</h2>
        <div className="flex items-center space-x-2">
           <button
             // TODO: Implement Add Member functionality
             onClick={() => alert("Add member functionality coming soon!")}
             className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
             title="Add New Member"
           >
             <UserPlus size={14} className="mr-1" /> Add Member
           </button>
          <button
            onClick={onClose}
            className={`inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors`}
            title="Back to Developer Tools"
          >
            <ArrowLeft size={14} className="mr-1" /> Back
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <span className="ml-2 text-gray-400">Loading members...</span>
          </div>
        )}
        {error && (
          <div className="flex flex-col justify-center items-center h-full text-red-400">
             <AlertTriangle size={24} className="mb-2"/>
             <p>Error loading members:</p>
             <p className="text-sm text-red-500">{error}</p>
             <button onClick={fetchMembers} className="mt-4 px-3 py-1 text-xs bg-red-700 hover:bg-red-600 text-white rounded">Retry</button>
          </div>
        )}
        {!isLoading && !error && (
          <ul className="space-y-3">
            {members.length === 0 ? (
                 <p className="text-center text-gray-500 italic mt-8">No members found.</p>
            ) : (
                 members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Basic Avatar Placeholder */}
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={`${member.name_en}'s avatar`} className="w-full h-full object-cover" />
                        ) : (
                          <span>{member.name_en.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                         <span className="font-medium text-gray-200">{member.name_en}</span>
                         {member.name_zh && <span className="text-sm text-gray-400 ml-2">({member.name_zh})</span>}
                         <span className="block text-xs text-gray-400">{member.status}</span>
                      </div>
                    </div>
                    <Link
                      href={`/developer/members/${member.id}/edit`}
                      passHref
                      className="p-1 text-gray-400 hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-indigo-500 rounded"
                      title={`Edit ${member.name_en}`}
                    >
                      {/* Keep the icon inside the link */}
                      <Edit size={16} />
                    </Link>
                  </li>
                ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MemberManager;
