"use client";

import React, { useState, useEffect, useCallback } from "react";
import { themeColors } from "@/styles/theme";
// import BibtexUploader from "./BibtexUploader"; // Note: This import will break after BibtexUploader is deleted. Needs to be removed or refactored later.
import {
  Loader2,
  Inbox,
  Edit3,
  Check,
  Trash2,
  ExternalLink,
  BookOpen,
  Users,
  Calendar,
} from "lucide-react"; // Added more icons

// Define the props interface, including onClose
export interface PublicationManagerProps {
  onClose?: () => void;
}

// Define a type for the pending publication data we expect from the API
interface PendingPublication {
  id: string;
  title: string;
  year: number | null;
  venue: string | null;
  raw_authors: string | null;
  doi_url: string | null; // Add DOI for display
  pdf_url: string | null; // Add PDF link for display
  createdAt: Date; // Or string if serialized differently
}

const PublicationManager: React.FC<PublicationManagerProps> = ({ onClose }) => {
  const [pendingPublications, setPendingPublications] = useState<
    PendingPublication[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({}); // Track loading state per item { [pubId]: isLoading }

  // Function to fetch pending publications (wrapped in useCallback)
  const fetchPendingPublications = useCallback(async () => {
    // Don't set loading if already loading (prevents flicker on refresh)
    // setIsLoading(true);
    setError(null);
    console.log("Fetching pending publications...");
    try {
      const response = await fetch("/api/publications/pending");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }
      const data: PendingPublication[] = await response.json();
      // Convert string date back to Date object if necessary
      const formattedData = data.map((pub) => ({
        ...pub,
        createdAt: new Date(pub.createdAt),
      }));
      setPendingPublications(formattedData);
      console.log("Fetched pending publications: ", formattedData.length);
    } catch (err) {
      console.error("Failed to fetch pending publications:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to load pending publications: ${errorMessage}`);
      setPendingPublications([]); // Clear list on error
    } finally {
      setIsLoading(false); // Ensure loading is set to false even if fetch was quick
    }
  }, []); // Empty dependency array means this function is created once

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingPublications();
  }, [fetchPendingPublications]); // Include fetch function in dependency array

  // Helper to set loading state for a specific action
  const setActionLoading = (id: string, isLoading: boolean) => {
    setActionStates((prev) => ({ ...prev, [id]: isLoading }));
  };

  // --- Handler Functions ---
  const handleApprove = (id: string) => {
    console.log("Approve:", id);
    // TODO: Implement API call to update status to 'approved'
    // On success: fetchPendingPublications();
  };

  const handleEdit = (id: string) => {
    console.log("Edit:", id);
    // TODO: Implement logic to open an editor form for this publication
  };

  const handleReject = async (id: string) => {
    if (actionStates[id]) return; // Prevent double-clicks

    if (
      !window.confirm(
        `Are you sure you want to reject and delete this pending publication? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setActionLoading(id, true);
    setError(null);

    try {
      const response = await fetch(`/api/publications/pending/${id}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        console.log("Successfully rejected and deleted publication:", id);
        // Optimistic UI update (remove immediately)
        // setPendingPublications(prev => prev.filter(pub => pub.id !== id));
        // Fetch the updated list for consistency
        await fetchPendingPublications();
      } else {
        let errorData = { error: `Failed with status: ${response.status}` };
        try {
          errorData = await response.json();
        } catch (e) {
          /* Ignore */
        }
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }
    } catch (err) {
      console.error("Failed to reject publication:", id, err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to reject publication (ID: ${id}): ${errorMessage}`);
    } finally {
      setActionLoading(id, false);
    }
  };

  return (
    <div>
      <div className="space-y-8">
        {/* Section 1: BibTeX Upload - Pass the callback */}
        {/* <BibtexUploader onUploadComplete={fetchPendingPublications} /> */}
        {/* Commented out as BibtexUploader is deleted */}

        {/* Section 2: Pending Review List */}
        <div
          className={`p-6 rounded-lg border ${themeColors.devBorder} ${themeColors.devCardBg} shadow-md`}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className={`text-lg font-semibold ${themeColors.devTitleText}`}>
              Pending Review ({pendingPublications.length})
            </h4>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchPendingPublications();
              }}
              disabled={isLoading}
              className={`p-1.5 rounded ${themeColors.devDescText} hover:bg-gray-700 transition-colors disabled:opacity-50`}
              title="Refresh List"
            >
              <Loader2 size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {isLoading &&
            pendingPublications.length === 0 && ( // Show loader only if list is empty initially
              <div className="flex justify-center items-center py-6">
                <Loader2
                  size={24}
                  className={`animate-spin ${themeColors.devDescText}`}
                />
                <span className={`ml-2 ${themeColors.devDescText}`}>
                  Loading pending items...
                </span>
              </div>
            )}

          {error && (
            <div
              className={`my-4 p-3 rounded-md text-sm flex items-center bg-red-900/50 text-red-300`}
            >
              <Inbox size={16} className="mr-2 flex-shrink-0" /> {error}
            </div>
          )}

          {!isLoading && !error && pendingPublications.length === 0 && (
            <div className={`text-center py-6 ${themeColors.devDescText}`}>
              <Inbox size={32} className="mx-auto mb-2" />
              No publications pending review.
            </div>
          )}

          {!error &&
            pendingPublications.length > 0 && ( // Render list even if loading in background
              <ul className="space-y-4">
                {pendingPublications.map((pub) => (
                  <li
                    key={pub.id}
                    className={`p-4 rounded-md border ${themeColors.devBorder} bg-gray-700/30 flex flex-col gap-3`}
                  >
                    {/* Top section: Title and Links */}
                    <div className="flex justify-between items-start gap-2">
                      <h5
                        className={`font-medium flex-1 ${themeColors.devTitleText}`}
                      >
                        {pub.title || "No Title"}
                      </h5>
                      <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                        {pub.doi_url && (
                          <a
                            href={`https://doi.org/${pub.doi_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={pub.doi_url}
                            className={`${themeColors.devDescText} hover:text-indigo-400 transition-colors flex items-center gap-1`}
                          >
                            <ExternalLink size={12} /> DOI
                          </a>
                        )}
                        {pub.pdf_url && (
                          <a
                            href={pub.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${themeColors.devDescText} hover:text-indigo-400 transition-colors flex items-center gap-1`}
                          >
                            <BookOpen size={12} /> PDF
                          </a>
                        )}
                      </div>
                    </div>
                    {/* Middle section: Authors */}
                    {pub.raw_authors && (
                      <div
                        className={`text-xs flex items-start gap-1.5 ${themeColors.devDescText}`}
                      >
                        <Users size={14} className="flex-shrink-0 mt-0.5" />
                        <span className="flex-1 break-words">
                          {pub.raw_authors}
                        </span>
                      </div>
                    )}
                    {/* Bottom section: Venue, Year, Added Date, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                      <div
                        className={`flex items-center gap-3 ${themeColors.devMutedText}`}
                      >
                        {pub.venue && (
                          <span
                            className="flex items-center gap-1"
                            title="Venue"
                          >
                            <Inbox size={12} />
                            {pub.venue}
                          </span>
                        )}
                        {pub.year && (
                          <span
                            className="flex items-center gap-1"
                            title="Year"
                          >
                            <Calendar size={12} />
                            {pub.year}
                          </span>
                        )}
                        <span
                          className="flex items-center gap-1"
                          title={`Added on ${pub.createdAt.toLocaleString()}`}
                        >
                          Added: {pub.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(pub.id)}
                          disabled={actionStates[pub.id]}
                          className="inline-flex items-center px-2 py-1 border border-green-600 rounded text-xs font-medium text-green-400 hover:bg-green-900/50 transition-colors disabled:opacity-50"
                          title="Approve this publication"
                        >
                          <Check size={12} className="mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleEdit(pub.id)}
                          disabled={actionStates[pub.id]}
                          className="inline-flex items-center px-2 py-1 border border-blue-600 rounded text-xs font-medium text-blue-400 hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                          title="Edit before approving"
                        >
                          <Edit3 size={12} className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleReject(pub.id)}
                          disabled={actionStates[pub.id]}
                          className={`inline-flex items-center px-2 py-1 border border-red-600 rounded text-xs font-medium text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50 ${actionStates[pub.id] ? "animate-pulse" : ""}`}
                          title="Reject and delete this entry"
                        >
                          {actionStates[pub.id] ? (
                            <Loader2 size={12} className="mr-1 animate-spin" />
                          ) : (
                            <Trash2 size={12} className="mr-1" />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default PublicationManager;
