"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Save,
  XCircle,
  Users,
  Info,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Calendar,
} from "lucide-react"; // Combined icons
import { themeColors } from "@/styles/theme";
import { Publication, Member } from "@prisma/client"; // Import Prisma types
import Select, { MultiValue } from "react-select"; // Import MultiValue
import { motion } from "framer-motion";

// Define expected props
interface PendingPublicationEditorProps {
  publicationId: string; // ID must be provided for editing
  onSaveSuccess: (updatedPublication: Publication) => Promise<void>; // Callback on successful save
  onCancel: () => void; // Callback to close the editor
}

// Type for member options in the select dropdown
interface MemberOption {
  value: string; // Member ID
  label: string; // Member Name (e.g., "Name EN (Name ZH)")
}

// Interface for the editable fields (can be a subset of Publication)
interface PublicationFormData {
  title: string;
  year: number | null;
  venue: string | null;
  pdf_url: string | null;
  abstract: string | null;
  keywords: string | null;
  ccf_rank: string | null; // Added CCF Rank field
}

// Type for the data sent in the PUT request
interface PublicationUpdatePayload
  extends Omit<PublicationFormData, "raw_authors" | "doi_url"> {
  // Omit raw_authors if not sending it back
  authorIds: string[];
  status: string; // Explicitly set status
}

// --- Utility Function to Parse Authors (REMOVE THIS IF NOT USED ELSEWHERE) ---
/* 
const parseAuthors = (rawAuthors: string | null): string[] => {
  if (!rawAuthors) return [];
  return rawAuthors
    .split(/ and /i)
    .map((author) => author.trim())
    .filter(Boolean);
};
*/

const PendingPublicationEditor: React.FC<PendingPublicationEditorProps> = ({
  publicationId,
  onSaveSuccess,
  onCancel,
}) => {
  // Use PublicationFormData for the form state
  const [formData, setFormData] = useState<PublicationFormData | null>(null);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<
    MultiValue<MemberOption>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ccfRankings, setCcfRankings] = useState<Record<string, string>>({}); // Use Record<string, string>
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(true);
  const [initialRawAuthors, setInitialRawAuthors] = useState<string | null>(
    null,
  ); // Store initial raw authors for comparison

  // --- Data Fetching ---
  const fetchPublicationData = useCallback(async () => {
    if (!publicationId) return;
    setIsLoading(true);
    setError(null);
    console.log(`Editor: Fetching data for ID: ${publicationId}`);
    try {
      // Adjust API endpoint if necessary - assuming it returns full Publication
      const response = await fetch(
        `/api/publications/pending/${publicationId}`,
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP Error: ${response.status}`);
      }
      // Expect full Publication data from API now
      const data: Publication & { authors?: { id: string }[] } =
        await response.json();

      // Validate required fields exist on data before setting state
      if (!data || typeof data.title !== "string") {
        throw new Error("Fetched data is missing required publication fields.");
      }

      setFormData({
        // Set form data based on fetched data
        title: data.title,
        year: data.year ?? null,
        venue: data.venue ?? null,
        pdf_url: data?.pdf_url ?? null,
        abstract: data?.abstract ?? null,
        keywords: data?.keywords ?? null,
        ccf_rank: data?.ccf_rank ?? null,
      });
      // setInitialRawAuthors(data?.raw_authors ?? null); // <-- Remove this line
      // Pre-select authors based on the `authors` relation returned by the API
      // This assumes the API route is updated to include authors
      if (data.authors && memberOptions.length > 0) {
        const preSelected = data.authors
          .map((author) => memberOptions.find((opt) => opt.value === author.id))
          .filter((opt): opt is MemberOption => !!opt); // Filter out undefined if member not found
        setSelectedAuthors(preSelected);
        console.log(
          "Pre-selected authors based on fetched relation:",
          preSelected,
        );
      /* Remove the fallback logic based on raw_authors
      } else if (data?.raw_authors && memberOptions.length > 0) {
        // Fallback: Attempt pre-selection based on raw_authors if relation not present
        // (Keep existing logic or refine)
        const parsedNames = parseAuthors(data.raw_authors);
        const preSelectedFallback: MemberOption[] = [];
        parsedNames.forEach((parsedName) => {
          const lowerParsed = parsedName.toLowerCase();
          const foundOption = memberOptions.find(
            (opt) =>
              opt.label.toLowerCase().includes(lowerParsed) ||
              lowerParsed.includes(
                opt.label.split("(")[0].trim().toLowerCase(),
              ),
          );
          if (
            foundOption &&
            !preSelectedFallback.some((ps) => ps.value === foundOption.value)
          ) {
            preSelectedFallback.push(foundOption);
          }
        });
        setSelectedAuthors(preSelectedFallback);
        console.log(
          "Pre-selected authors based on raw string (fallback):",
          preSelectedFallback,
        );
      */
      } else {
        setSelectedAuthors([]); // Clear if no data or members
      }

      console.log("Editor: Initialized form data", data);
    } catch (err) {
      console.error("Editor: Failed to fetch publication data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load publication data.",
      );
      setFormData(null); // Clear form data on error
    } finally {
      setIsLoading(false);
    }
    // Depend on publicationId and *after* members are loaded
  }, [publicationId, memberOptions]);

  const fetchMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch("/api/members/list");
      if (!response.ok) throw new Error("Failed to fetch members");
      const members: { id: string; name_en: string; name_zh: string | null }[] =
        await response.json();
      const options = members.map((m) => ({
        value: m.id,
        label: m.name_zh ? `${m.name_en} (${m.name_zh})` : m.name_en,
      }));
      setMemberOptions(options); // Set member options first
      console.log("Editor: Fetched members", options.length);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Could not load lab members list.");
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  const fetchCcfRankings = useCallback(async () => {
    console.log("Editor: Fetching CCF rankings...");
    try {
      // TODO: Replace with actual fetch from '/data/ccf_rankings.json' or API
      const mockRanks: Record<string, string> = {
        SIGCOMM: "A",
        MobiCom: "A",
        SIGMOD: "A",
        VLDB: "A",
        ICDE: "A",
        OSDI: "A",
        SOSP: "A",
        INFOCOM: "A",
        CCS: "A",
        NDSS: "A",
        Oakland: "A",
        "USENIX Security": "A",
        EuroSys: "B",
        FAST: "B",
        MobiSys: "B",
      };
      setCcfRankings(mockRanks);
      console.log("Editor: Fetched/mocked CCF rankings");
    } catch (error) {
      console.error("Failed to fetch CCF rankings:", error);
      // Handle error appropriately, maybe set error state
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchCcfRankings();
  }, [fetchMembers, fetchCcfRankings]);

  // Fetch publication data *after* members are available for pre-selection
  useEffect(() => {
    if (memberOptions.length > 0) {
      fetchPublicationData();
    }
  }, [memberOptions, fetchPublicationData]);

  // --- Form Handling ---
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const yearValue = value === "" ? null : parseInt(value, 10);
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: isNaN(yearValue!) ? prev.year : yearValue,
          }
        : null,
    );
  };

  const handleAuthorChange = (selectedOptions: MultiValue<MemberOption>) => {
    setSelectedAuthors(selectedOptions);
  };

  const handleCcfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value || null } : null)); // Store null if empty
  };

  // --- Save Logic ---
  const handleSave = async () => {
    if (!formData || !publicationId) return;
    setIsSaving(true);
    setError(null);

    const payload: PublicationUpdatePayload = {
      ...formData,
      year: formData.year ?? 0, // Provide default if null for payload
      authorIds: selectedAuthors.map((opt) => opt.value),
      status: "APPROVED", // Explicitly set status to APPROVED
    };

    console.log("Editor: Saving publication...", payload);

    try {
      const response = await fetch(
        `/api/publications/pending/${publicationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP Error: ${response.status}`);
      }

      const updatedPublication: Publication = await response.json();
      console.log("Editor: Save successful", updatedPublication);
      // Call the CORRECT callback prop
      await onSaveSuccess(updatedPublication);
    } catch (err) {
      console.error("Editor: Failed to save publication:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save publication changes.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- Helper Functions ---

  // Function to get suggested CCF rank based on venue
  const getSuggestedRank = () => {
    if (!formData?.venue) return null;
    const venueLower = formData.venue.toLowerCase();
    for (const [key, value] of Object.entries(ccfRankings)) {
      if (venueLower.includes(key.toLowerCase())) {
        return value; // Return the rank (e.g., 'A', 'B')
      }
    }
    return null; // No match found
  };

  // --- Rendering Logic ---
  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg shadow-lg bg-gray-800 border-gray-700 mt-6 flex justify-center items-center">
        <Loader2 size={24} className="animate-spin text-gray-400 mr-2" />
        <span className="text-gray-400">Loading editor...</span>
      </div>
    );
  }

  if (!formData) {
    // Show error if form data couldn't be loaded
    return (
      <div className="p-6 border rounded-lg shadow-lg bg-red-900/30 border-red-700 mt-6 text-red-300 flex items-center">
        <AlertCircle size={20} className="mr-3 flex-shrink-0" />
        <span>{error || "Failed to load publication data for editing."}</span>
      </div>
    );
  }

  const suggestedRank = getSuggestedRank();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 border rounded-lg shadow-lg bg-gray-800 border-gray-700 mt-6 relative"
    >
      <h3 className="text-xl font-semibold mb-5 text-indigo-400 border-b border-gray-600 pb-3">
        Edit Pending Publication
      </h3>

      {/* General Error Display within Editor */}
      {error && !isSaving && (
        <div className="mb-4 p-3 rounded-md text-sm flex items-center bg-red-900/50 text-red-300 border border-red-700">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Column 1 */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Venue */}
          <div>
            <label
              htmlFor="venue"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Venue / Conference
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year ?? ""} // Handle null for input
              onChange={handleYearChange}
              className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Authors (Raw) - Display Only */}
          {/* 
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Raw Authors (from BibTeX)
            </label>
            <p className="text-sm text-gray-400 bg-gray-700 p-2 rounded-md break-words">
              {formData.raw_authors || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Use the dropdown below to link authors to lab members.
            </p>
          </div>
          */}

          {/* Author Selection Dropdown */}
          <div>
            <label
              htmlFor="authors"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Link Lab Members as Authors{" "}
              <span className="text-red-500">*</span>
            </label>
            <Select<MemberOption, true> // Explicitly type as MultiValue
              id="authors"
              instanceId="author-select" // Unique ID for hydration
              name="authors"
              options={memberOptions}
              value={selectedAuthors}
              onChange={handleAuthorChange}
              isMulti
              isLoading={isLoadingMembers}
              closeMenuOnSelect={false}
              placeholder={
                isLoadingMembers ? "Loading members..." : "Select members..."
              }
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: themeColors.devMutedBg,
                  borderColor: themeColors.devBorder,
                  "&:hover": {
                    borderColor: themeColors.devAccent,
                  },
                  minHeight: "40px",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: themeColors.devCardBg,
                  zIndex: 20, // Ensure dropdown is above other elements
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? themeColors.devButtonBg
                    : isFocused
                      ? themeColors.devMutedBg
                      : themeColors.devCardBg,
                  color: isSelected
                    ? themeColors.textWhite
                    : themeColors.devText,
                  "&:active": {
                    backgroundColor: themeColors.devButtonDisabledBg,
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: themeColors.devButtonDisabledBg,
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: themeColors.devText,
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: themeColors.devMutedText,
                  "&:hover": {
                    backgroundColor: themeColors.errorText, // Example: Red hover for remove
                    color: themeColors.textWhite,
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: themeColors.devMutedText,
                }),
                input: (base) => ({
                  ...base,
                  color: themeColors.devText, // Use devText
                }),
              }}
            />
            {selectedAuthors.length === 0 && (
              <p className="text-xs text-yellow-500 mt-1">
                Please link at least one author.
              </p>
            )}
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          {/* PDF URL */}
          <div>
            <label
              htmlFor="pdf_url"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              PDF URL <BookOpen size={12} className="inline ml-1 opacity-70" />
            </label>
            <input
              type="text"
              id="pdf_url"
              name="pdf_url"
              value={formData.pdf_url || ""}
              onChange={handleInputChange}
              placeholder="Enter direct link to the PDF file"
              className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* CCF Rank */}
          <div>
            <label
              htmlFor="ccf_rank"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              CCF Rank (Auto-suggested based on Venue)
            </label>
            <div className="flex items-center gap-2">
              <select
                id="ccf_rank"
                name="ccf_rank"
                value={formData.ccf_rank || ""} // Controlled component
                onChange={handleCcfChange} // Use specific handler
                className="flex-grow p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">N/A or Unranked</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              {suggestedRank && formData.ccf_rank !== suggestedRank && (
                <span className="text-xs text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded">
                  Suggested: {suggestedRank}
                </span>
              )}
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label
              htmlFor="abstract"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Abstract
            </label>
            <textarea
              id="abstract"
              name="abstract"
              rows={5}
              value={formData.abstract || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Keywords */}
          <div>
            <label
              htmlFor="keywords"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Keywords (Comma-separated)
            </label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords || ""}
              onChange={handleInputChange}
              placeholder="e.g., Machine Learning, Networking, Security"
              className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-5 border-t border-gray-600 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:opacity-50"
        >
          <XCircle size={16} className="mr-2" /> Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || selectedAuthors.length === 0 || !formData.title}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          {isSaving ? "Saving & Approving..." : "Save & Approve"}
        </button>
      </div>
    </motion.div>
  );
};

export default PendingPublicationEditor;
