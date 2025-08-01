"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Publication } from "@prisma/client"; // Import Prisma type
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import { themeColors } from "@/styles/theme";
import PendingPublicationEditor from "./PendingPublicationEditor"; // Import the editor

// Interface for publications fetched from the pending API
// Ensure this interface correctly extends the Prisma Publication type
// which should already include raw_authors: string | null
interface PendingPublication extends Publication {
  // The 'authors' relation is optional and depends on the API query
  authors?: { id: string; name_en: string; name_zh: string | null }[];
  // Explicitly add raw_authors to the interface
  raw_authors: string | null;
}

// Helper to display authors concisely
const formatAuthors = (
  authorsRelation: PendingPublication["authors"], // Explicitly name the relation parameter
  rawAuthorsField: string | null, // Explicitly name the raw string field parameter
) => {
  // Prioritize the structured relation if available
  if (authorsRelation && authorsRelation.length > 0) {
    return authorsRelation.map((a) => a.name_en).join(", ");
  }
  // Fallback to the raw string field
  if (rawAuthorsField) {
    // Basic parsing for display
    const authorsList = rawAuthorsField.split(/ and /i);
    const displayAuthors = authorsList.slice(0, 3).join(", ");
    return authorsList.length > 3 ? `${displayAuthors}...` : displayAuthors;
  }
  return "N/A";
};

const PendingPublicationsPage: React.FC = () => {
  const [pendingPublications, setPendingPublications] = useState<
    PendingPublication[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPublicationId, setEditingPublicationId] = useState<
    string | null
  >(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which item is being deleted

  // Fetch pending publications
  const fetchPendingPublications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/publications/pending");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP Error: ${response.status}`);
      }
      const data: PendingPublication[] = await response.json();
      setPendingPublications(data);
    } catch (err) {
      console.error("Failed to fetch pending publications:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pending publications.",
      );
      setPendingPublications([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchPendingPublications();
  }, [fetchPendingPublications]);

  // Handler to open the editor
  const handleEditOrApprove = (id: string) => {
    console.log("Opening editor for:", id);
    setError(null); // Clear previous errors when opening editor
    setShowSuccessMessage(null); // Clear success message
    setEditingPublicationId(id);
  };

  // Handler to delete a pending publication
  const handleDelete = async (id: string) => {
    if (deletingId) return; // Prevent double clicks
    if (
      !window.confirm(
        "Are you sure you want to delete this pending publication? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeletingId(id);
    setError(null);
    setShowSuccessMessage(null);
    console.log("Deleting pending publication:", id);

    try {
      const response = await fetch(`/api/publications/pending/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP Error: ${response.status}`);
      }
      // Remove from list on success - Use toString() for comparison
      setPendingPublications((prev) => prev.filter((pub) => pub.id.toString() !== id));
      setShowSuccessMessage("Publication deleted successfully.");
      // Auto-hide success message after a few seconds
      setTimeout(() => setShowSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to delete pending publication:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete publication.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Handler for successful save/approve from the editor
  const handleSaveSuccess = async (
    updatedPublication: Publication,
  ): Promise<void> => {
    console.log("Saved and approved:", updatedPublication);
    // Remove the approved publication from the pending list - Use toString()
    setPendingPublications((prev) =>
      prev.filter((pub) => pub.id.toString() !== updatedPublication.id.toString()),
    );
    setEditingPublicationId(null); // Close the editor
    setShowSuccessMessage("Publication approved and saved successfully!");
    // Auto-hide success message
    // Use Promise to ensure the timeout completes before setting message to null
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setShowSuccessMessage(null);
  };

  // Handler for cancelling the edit
  const handleCancelEdit = () => {
    console.log("Cancelled edit");
    setEditingPublicationId(null);
  };

  // --- Rendering Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2
          size={32}
          className={`animate-spin ${themeColors.devDescText}`}
        />
        <span className={`ml-3 ${themeColors.devDescText}`}>
          Loading pending publications...
        </span>
      </div>
    );
  }

  // Error display remains the same
  if (error && !editingPublicationId) {
    // Only show main error if editor isn't open
    return (
      <div
        className={`my-4 p-4 rounded-md text-sm flex items-center bg-red-900/50 text-red-300 border border-red-700`}
      >
        <AlertCircle size={18} className="mr-3 flex-shrink-0" />
        <div>
          <p className="font-medium">Error Loading Data</p>
          <p>{error}</p>
          <button
            onClick={fetchPendingPublications}
            className={`mt-2 text-xs underline hover:text-white ${isLoading ? "opacity-50" : ""}`}
            disabled={isLoading}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className={`text-2xl font-semibold mb-6 ${themeColors.devTitleText}`}>
        Pending Publications Review
      </h2>

      {showSuccessMessage && (
        <div
          className={`mb-4 p-3 rounded-md text-sm flex items-center bg-green-900/60 text-green-300 border border-green-700`}
        >
          <CheckCircle size={16} className="mr-2 flex-shrink-0" />
          {showSuccessMessage}
        </div>
      )}

      {/* Display general error here if not loading and editor is closed */}
      {error && !editingPublicationId && (
        <div
          className={`mb-4 p-3 rounded-md text-sm flex items-center bg-red-900/50 text-red-300 border border-red-700`}
        >
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {pendingPublications.length === 0 && !isLoading && (
        <p className={`${themeColors.devDescText}`}>
          No pending publications found.
        </p>
      )}

      {pendingPublications.length > 0 && (
        <div
          className={`overflow-x-auto rounded-lg border ${themeColors.devBorder} ${themeColors.devCardBg} shadow-md`}
        >
          <table className="min-w-full divide-y divide-gray-700">
            <thead className={`${themeColors.devHeaderBg}`}>
              <tr>
                <th
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}
                >
                  Title
                </th>
                <th
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}
                >
                  Authors (Raw/Parsed)
                </th>
                <th
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}
                >
                  Venue
                </th>
                <th
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}
                >
                  Year
                </th>
                <th
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}
                >
                  Added
                </th>
                <th
                  scope="col"
                  className={`px-4 py-3 text-center text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${themeColors.devBorder} ${themeColors.devDescText}`}
            >
              {pendingPublications.map((pub: PendingPublication) => (
                <tr key={pub.id} className={`${themeColors.devRowHover}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-100">
                    {pub.title || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {/* Pass the correct fields to formatAuthors */}
                    {formatAuthors(pub.authors, pub.raw_authors)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {pub.venue || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {/* Ensure comparison is valid, year is number | null */}
                    {pub.year?.toString() || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {pub.createdAt
                      ? new Date(pub.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm space-x-2 whitespace-nowrap">
                    <button
                      // Pass id as string
                      onClick={() => handleEditOrApprove(pub.id.toString())}
                      // Compare id as string
                      disabled={deletingId === pub.id.toString()}
                      className="inline-flex items-center px-2.5 py-1 border border-blue-600 rounded text-xs font-medium text-blue-400 hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                      title="Edit or Approve"
                    >
                      <Check size={14} className="mr-1" /> Approve / Edit
                    </button>
                    <button
                      // Pass id as string
                      onClick={() => handleDelete(pub.id.toString())}
                      // Compare id as string
                      disabled={deletingId === pub.id.toString()}
                      className={`inline-flex items-center px-2.5 py-1 border border-red-600 rounded text-xs font-medium text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50 ${deletingId === pub.id.toString() ? "animate-pulse" : ""}`}
                      title="Delete Pending Entry"
                    >
                      {/* Compare id as string */}
                      {deletingId === pub.id.toString() ? (
                        <Loader2 size={14} className="mr-1 animate-spin" />
                      ) : (
                        <Trash2 size={14} className="mr-1" />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal/Section */}
      {editingPublicationId && (
        <PendingPublicationEditor
          publicationId={editingPublicationId}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancelEdit}
          // You might need to pass fetchPendingPublications or similar if the editor needs to refresh the list itself
        />
      )}
    </div>
  );
};

export default PendingPublicationsPage;
