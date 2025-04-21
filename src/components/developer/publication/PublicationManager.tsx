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
  PlusCircle, // Icon for Add button
  RefreshCw // Added RefreshCw icon
} from "lucide-react"; // Added more icons
// Import the type we defined in the API route
import { type PublicationWithAuthors } from "@/app/api/publications/route"; 
// Import Dialog components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
// Import the form component and its data type
import { PublicationForm, type PublicationFormData } from './PublicationForm';
// Import toast for notifications
import { toast } from "sonner";

// Define the props interface, including onClose (optional)
export interface PublicationManagerProps {
  onClose?: () => void;
}

// Define a simplified Author type for rendering (REMOVED as unused)
// interface AuthorInfo {
//   id: string;
//   name_en: string;
//   name_zh?: string | null;
// }

const PublicationManager: React.FC<PublicationManagerProps> = ({ onClose }) => {
  // Rename state to hold all publications
  const [publications, setPublications] = useState<PublicationWithAuthors[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Keep actionStates for individual row loading/disabling later
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({}); 
  // State for controlling the Add/Edit dialog
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  // State for tracking form submission status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // State to hold publication being edited (null for adding)
  const [editingPublication, setEditingPublication] = useState<PublicationWithAuthors | null>(null);

  // Rename and modify function to fetch all publications
  const fetchAllPublications = useCallback(async () => {
    setIsLoading(true); // Set loading true when fetching all
    setError(null);
    console.log("Fetching all publications...");
    try {
      // Call the new endpoint
      const response = await fetch("/api/publications"); 
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
             const errorData = await response.json();
             if (errorData && errorData.error && errorData.error.message) {
                 errorMsg = errorData.error.message;
             }
        } catch(e) { /* Ignore parsing error */ }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
          // Ensure dates are Date objects if needed (though findMany usually returns them)
          const formattedData = result.data.map((pub: PublicationWithAuthors) => ({
            ...pub,
            createdAt: pub.createdAt ? new Date(pub.createdAt) : new Date(), // Handle potential string dates
            updatedAt: pub.updatedAt ? new Date(pub.updatedAt) : new Date(),
          }));
          setPublications(formattedData);
          console.log("Fetched publications: ", formattedData.length);
      } else {
          throw new Error(result.error?.message || "Invalid data format received from API.");
      }

    } catch (err) {
      console.error("Failed to fetch publications:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to load publications: ${errorMessage}`);
      setPublications([]); // Clear list on error
    } finally {
      setIsLoading(false); 
    }
  }, []); 

  // Fetch data on component mount
  useEffect(() => {
    fetchAllPublications();
  }, [fetchAllPublications]); 

  // Helper to format authors string from the relation
  const formatAuthors = (authorsRelation: PublicationWithAuthors['authors']): string => {
      if (!authorsRelation || authorsRelation.length === 0) {
          return "No authors listed";
      }
      // Ensure pa.author exists before accessing name_en
      return authorsRelation.map(pa => pa.author?.name_en || 'Unknown Author').join(", ");
  };

  // Placeholder handlers for new actions
  const handleOpenAddForm = () => {
    setEditingPublication(null); // Ensure we are in 'add' mode
    setIsFormOpen(true);
  };

  // Handler for submitting the Add form
  const handleAddSubmit = async (data: PublicationFormData) => {
    setIsSubmitting(true);
    console.log("Submitting new publication data:", data);
    try {
        const response = await fetch('/api/publications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            const errorMsg = result.error?.message || `Failed with status: ${response.status}`;
            // Optionally show detailed validation errors from result.error.details
            let detailedErrors = '';
            if (result.error?.details) {
                detailedErrors = Object.entries(result.error.details)
                    .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
                    .join('; ');
            }
            console.error("API Error adding publication:", errorMsg, detailedErrors);
            toast.error(`Error adding publication: ${errorMsg}${detailedErrors ? ` (${detailedErrors})` : ''}`);
            throw new Error(errorMsg);
        }

        console.log("Successfully added publication:", result.data);
        toast.success("Publication added successfully!");
        setIsFormOpen(false); // Close dialog on success
        fetchAllPublications(); // Refresh the list

    } catch (error) {
        // Error is already logged and toasted in the block above usually
        // We might not need another toast here unless fetch itself failed
        if (!(error instanceof Error && error.message.startsWith('Failed with status:'))) {
            toast.error("An unexpected error occurred while adding the publication.");
            console.error("Unexpected submit error:", error);
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  // Placeholder for Edit
  const handleEdit = (pub: PublicationWithAuthors) => { 
    console.log("Edit publication:", pub.id);
    setEditingPublication(pub); // Set the publication to edit
    setIsFormOpen(true); // Open the same form dialog
    // TODO: Implement PUT request logic in a separate handler or modify handleAddSubmit
  };

  // Placeholder for Delete
  const handleDelete = async (id: number) => { 
      console.log("Delete publication:", id);
    // TODO: Implement API call DELETE /api/publications/[id]
    toast.info("Delete functionality not yet implemented.");
  };

  return (
    <div className={`p-6 rounded-lg border ${themeColors.devBorder} ${themeColors.devCardBg} shadow-md`}>
      {/* Header: Title, Add Button, Refresh Button */}
      <div className={`flex justify-between items-center mb-4 border-b pb-4 ${themeColors.devBorder}`}> 
        <h4 className={`text-lg font-semibold ${themeColors.devTitleText}`}>
          Manage Publications ({publications.length})
        </h4>
        <div className="flex items-center space-x-2">
            {/* Use DialogTrigger to wrap the Add button */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <button
                        onClick={handleOpenAddForm} // Use specific handler to clear editing state
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors`}
                        title="Add New Publication"
                    >
                        <PlusCircle size={14} className="mr-1.5" />
                        Add Publication
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700 text-gray-200">
                    <DialogHeader>
                        {/* Dynamic title based on add/edit mode */}
                        <DialogTitle className="text-green-400">
                            {editingPublication ? 'Edit Publication' : 'Add New Publication'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 max-h-[70vh] overflow-y-auto pr-2"> 
                        {/* Render the form inside the dialog */}
                        <PublicationForm 
                            key={editingPublication?.id ?? 'add'} // Force re-render on mode change
                            // Pass initialData only if editing
                            initialData={editingPublication ? editingPublication : undefined} 
                            // Pass the correct submit handler based on mode (add for now)
                            onSubmit={handleAddSubmit} 
                            onCancel={() => setIsFormOpen(false)} 
                            isLoading={isSubmitting}
                        />
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* Refresh Button - Apply styles similar to Add button */}
            <button
              onClick={fetchAllPublications}
              disabled={isLoading || isSubmitting} 
              // Apply the same classes as the Add button
              className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors disabled:opacity-50`}
              title="Refresh List"
            >
              {/* Keep the loading spinner logic */}
              {isLoading ? (
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                  <RefreshCw size={14} className="mr-1.5" /> // Added RefreshCw icon
              )}
              {/* Add the text */}
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-6">
          <Loader2 size={24} className={`animate-spin ${themeColors.devDescText}`} />
          <span className={`ml-2 ${themeColors.devDescText}`}>Loading publications...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`my-4 p-3 rounded-md text-sm flex items-center bg-red-900/50 text-red-300`}>
          <Inbox size={16} className="mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && publications.length === 0 && (
        <div className={`text-center py-6 ${themeColors.devDescText}`}>
          <Inbox size={32} className="mx-auto mb-2" />
          No publications found.
        </div>
      )}

      {/* Publications List */}
      {!isLoading && !error && publications.length > 0 && (
        <ul className="space-y-4">
          {publications.map((pub) => (
            <li
              key={pub.id}
              className={`p-4 rounded-md border ${themeColors.devBorder} bg-gray-700/30 flex flex-col gap-3`}
            >
              {/* Top section: Title and Links */}
              <div className="flex justify-between items-start gap-2">
                <h5 className={`font-medium flex-1 ${themeColors.devTitleText}`}>
                  {pub.title || "No Title"}
                </h5>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  {pub.dblp_url && (
                    <a 
                        href={pub.dblp_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="DBLP Link"
                        className={`${themeColors.devDescText} hover:text-indigo-400 transition-colors flex items-center gap-1`}
                    >
                        DBLP
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
              {/* Middle section: Authors (Formatted) */}
              {pub.authors && pub.authors.length > 0 && (
                  <div className={`text-xs flex items-start gap-1.5 ${themeColors.devDescText}`}>
                      <Users size={14} className="flex-shrink-0 mt-0.5" />
                      <span className="flex-1 break-words">
                          {formatAuthors(pub.authors)}
                      </span>
                  </div>
              )}
              {/* Bottom section: Venue, Year, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs mt-1">
                <div className={`flex items-center gap-2 ${themeColors.devDescText}`}>
                    <Calendar size={14} />
                    <span>{pub.year || "N/A"}</span>
                    {pub.venue && <span className="italic"> - {pub.venue}</span>}
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        // Call handleEdit with the publication data
                        onClick={() => handleEdit(pub)} 
                        disabled={isSubmitting || actionStates[pub.id.toString()]} 
                        className={`p-1.5 rounded text-indigo-400 hover:bg-gray-600 transition-colors disabled:opacity-50`}
                        title="Edit Publication"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={() => handleDelete(pub.id)}
                        disabled={isSubmitting || actionStates[pub.id.toString()]}
                        className={`p-1.5 rounded text-red-400 hover:bg-gray-600 transition-colors disabled:opacity-50`}
                        title="Delete Publication"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PublicationManager;
