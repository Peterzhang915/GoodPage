'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Publication } from '@prisma/client'; // Import Prisma type
import { Loader2, AlertCircle, CheckCircle, Edit, Trash2, Check } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import PendingPublicationEditor from './PendingPublicationEditor'; // Import the editor

// Interface for publications fetched from the pending API
// (Might include relations like authors if the API provides them)
interface PendingPublication extends Publication {
    authors?: { id: string; name_en: string; name_zh: string | null }[];
}

// Helper to display authors concisely
const formatAuthors = (authors: PendingPublication['authors'], rawAuthors: string | null) => {
    if (authors && authors.length > 0) {
        return authors.map(a => a.name_en).join(', ');
    }
    if (rawAuthors) {
        // Basic parsing for display, might not be perfect
        return rawAuthors.split(/ and /i).slice(0, 3).join(', ') + (rawAuthors.split(/ and /i).length > 3 ? '...' : '');
    }
    return 'N/A';
};

const PendingPublicationsPage: React.FC = () => {
    const [pendingPublications, setPendingPublications] = useState<PendingPublication[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPublicationId, setEditingPublicationId] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null); // Track which item is being deleted

    // Fetch pending publications
    const fetchPendingPublications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/publications/pending');
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `HTTP Error: ${response.status}`);
            }
            const data: PendingPublication[] = await response.json();
            setPendingPublications(data);
        } catch (err) {
            console.error("Failed to fetch pending publications:", err);
            setError(err instanceof Error ? err.message : "Failed to load pending publications.");
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
        if (!window.confirm('Are you sure you want to delete this pending publication? This cannot be undone.')) {
            return;
        }
        setDeletingId(id);
        setError(null);
        setShowSuccessMessage(null);
        console.log("Deleting pending publication:", id);

        try {
            const response = await fetch(`/api/publications/pending/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `HTTP Error: ${response.status}`);
            }
            // Remove from list on success
            setPendingPublications(prev => prev.filter(pub => pub.id !== id));
            setShowSuccessMessage('Publication deleted successfully.');
            // Auto-hide success message after a few seconds
            setTimeout(() => setShowSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Failed to delete pending publication:", err);
            setError(err instanceof Error ? err.message : "Failed to delete publication.");
        } finally {
            setDeletingId(null);
        }
    };

    // Handler for successful save/approve from the editor
    const handleSaveSuccess = async (updatedPublication: Publication): Promise<void> => {
        console.log("Saved and approved:", updatedPublication);
        // Remove the approved publication from the pending list
        setPendingPublications(prev => prev.filter(pub => pub.id !== updatedPublication.id));
        setEditingPublicationId(null); // Close the editor
        setShowSuccessMessage('Publication approved and saved successfully!');
        // Auto-hide success message
        // Use Promise to ensure the timeout completes before setting message to null
        await new Promise(resolve => setTimeout(resolve, 3000)); 
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
                <Loader2 size={32} className={`animate-spin ${themeColors.devDescText}`} />
                <span className={`ml-3 ${themeColors.devDescText}`}>Loading pending publications...</span>
            </div>
        );
    }

    // Error display remains the same
    if (error && !editingPublicationId) { // Only show main error if editor isn't open
        return (
            <div className={`my-4 p-4 rounded-md text-sm flex items-center bg-red-900/50 text-red-300 border border-red-700`}>
                <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                <div>
                    <p className="font-medium">Error Loading Data</p>
                    <p>{error}</p>
                    <button onClick={fetchPendingPublications} className={`mt-2 text-xs underline hover:text-white ${isLoading ? 'opacity-50' : ''}`} disabled={isLoading}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <h2 className={`text-2xl font-semibold mb-6 ${themeColors.devTitleText}`}>Pending Publications Review</h2>

            {showSuccessMessage && (
                <div className={`mb-4 p-3 rounded-md text-sm flex items-center bg-green-900/60 text-green-300 border border-green-700`}>
                    <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                    {showSuccessMessage}
                </div>
            )}

            {/* Display general error here if not loading and editor is closed */}
             {error && !editingPublicationId && (
                 <div className={`mb-4 p-3 rounded-md text-sm flex items-center bg-red-900/50 text-red-300 border border-red-700`}>
                     <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                     {error}
                 </div>
             )}

            {pendingPublications.length === 0 && !isLoading && (
                <p className={`${themeColors.devDescText}`}>No pending publications found.</p>
            )}
            
            {pendingPublications.length > 0 && (
                 <div className={`overflow-x-auto rounded-lg border ${themeColors.devBorder} ${themeColors.devCardBg} shadow-md`}>
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className={`${themeColors.devHeaderBg}`}>
                            <tr>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}>Title</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}>Authors (Raw/Parsed)</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}>Venue</th>
                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}>Year</th>
                                <th scope="col" className={`px-4 py-3 text-center text-xs font-medium ${themeColors.devHeaderText} uppercase tracking-wider`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`${themeColors.devCardBg} divide-y divide-gray-700`}>
                            {pendingPublications.map((pub) => (
                                <tr key={pub.id} className={`${themeColors.devRowHover} transition-colors`}>
                                    <td className={`px-4 py-3 text-sm font-medium ${themeColors.devDescText} max-w-xs truncate`} title={pub.title}>{pub.title}</td>
                                    <td className={`px-4 py-3 text-sm ${themeColors.devDescText} max-w-xs truncate`} title={pub.raw_authors || ''}> 
                                        {formatAuthors(pub.authors, pub.raw_authors)}
                                    </td>
                                    <td className={`px-4 py-3 text-sm ${themeColors.devDescText}`}>{pub.venue || '-'}</td>
                                    <td className={`px-4 py-3 text-sm ${themeColors.devDescText}`}>{pub.year || '-'}</td>
                                    <td className={`px-4 py-3 text-center text-sm font-medium`}>
                                        <div className="flex justify-center items-center space-x-2">
                                            {/* Edit/Approve Button (opens editor) */}
                                            <button
                                                onClick={() => handleEditOrApprove(pub.id)}
                                                className={`p-1.5 rounded ${themeColors.devDescText} hover:bg-indigo-600 hover:text-white transition-colors`} 
                                                title="Edit & Approve"
                                                disabled={deletingId === pub.id}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(pub.id)}
                                                className={`p-1.5 rounded ${themeColors.devDescText} hover:bg-red-600 hover:text-white transition-colors ${deletingId === pub.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="Delete"
                                                disabled={deletingId === pub.id}
                                            >
                                                {deletingId === pub.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}

            {/* Modal container for the editor */} 
             {editingPublicationId && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                     <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                         <PendingPublicationEditor
                             publicationId={editingPublicationId}
                             onSave={handleSaveSuccess}
                             onCancel={handleCancelEdit}
                         />
                     </div>
                 </div>
             )}

        </div>
    );
};

export default PendingPublicationsPage;
