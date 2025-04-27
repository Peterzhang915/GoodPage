"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, AlertTriangle, Save, GripVertical, X, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react'; // Added LinkIcon, ChevronDown, ChevronUp
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { themeColors } from "@/styles/theme";

// --- Constants for client-side use ---
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit - Should match API route

// Define ProjectType enum locally if not imported (matching schema.prisma)
enum ProjectType { MAIN = 'MAIN', FORMER = 'FORMER' }

// Define the type for a project based on likely Prisma schema
interface Project {
    id: number;
    title: string;
    description: string;
    image_url: string | null; // Image URL can be optional
    link_url: string | null; // Link URL can be optional
    display_order: number;
    is_visible: boolean;
    createdAt: string;
    updatedAt: string;
    type: ProjectType; // Add the type field
}

// Reusable API fetch function (keep or move to utils)
async function fetchApi(url: string, options: RequestInit = {}) {
    try {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error?.message || `Request failed with status ${res.status}`);
        }
        return data.data;
    } catch (error: any) {
        console.error(`API call to ${url} failed:`, error);
        throw new Error(error.message || 'An unknown API error occurred.');
    }
}

// New helper function for uploading images
async function uploadImageApi(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    // Assume endpoint /api/upload/project-image exists and handles 'file' field
    // It should return { success: true, data: { url: "..." } } on success
    // And { success: false, error: { message: "..." } } on failure
    const apiUrl = '/api/upload/project-image'; // Define the upload endpoint

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header for FormData, browser does it
        });

        const result = await res.json();

        if (!res.ok || !result.success || !result.data?.url) {
            throw new Error(result.error?.message || `Upload failed with status ${res.status}`);
        }

        return result.data.url;
    } catch (error: any) {
        console.error(`Image upload to ${apiUrl} failed:`, error);
        throw new Error(error.message || 'An unknown upload error occurred.');
    }
}

const ProjectsEditor: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State for adding new item
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectLinkUrl, setNewProjectLinkUrl] = useState('');
    const [newProjectFile, setNewProjectFile] = useState<File | null>(null); // State for the selected file
    const [newProjectImagePreviewUrl, setNewProjectImagePreviewUrl] = useState<string | null>(null); // State for image preview URL
    const [isAdding, setIsAdding] = useState(false);
    // State for inline editing
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingItemTitle, setEditingItemTitle] = useState('');
    const [editingItemDescription, setEditingItemDescription] = useState('');
    const [editingItemImageUrl, setEditingItemImageUrl] = useState(''); // Temporary: will change later
    const [editingItemLinkUrl, setEditingItemLinkUrl] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false); // For image upload status
    const [isAddFormOpen, setIsAddFormOpen] = useState(true); // State for add form collapse
    const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectType>(ProjectType.MAIN); // Filter state

    const apiBaseUrl = '/api/homepage/projects'; // Base URL for projects API

    // Fetch items
    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch ALL projects initially
            const data = await fetchApi(apiBaseUrl);
            setProjects(data || []);
            // Note: Filtering is now done client-side based on projectTypeFilter
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // Add item - default to MAIN type
    const handleAddItem = async () => {
        if (!newProjectTitle.trim()) return; // Require at least a title
        setIsAdding(true);
        setError(null);
        let imageUrl: string | null = null;

        try {
            // 1. Upload image if selected
            if (newProjectFile) {
                try {
                    imageUrl = await uploadImageApi(newProjectFile);
                } catch (uploadError: any) {
                    throw new Error(`Image upload failed: ${uploadError.message}`);
                }
            }

            // 2. Create the project item - explicitly set type to MAIN
            const newItem = await fetchApi(apiBaseUrl, {
                method: 'POST',
                body: JSON.stringify({
                    title: newProjectTitle.trim(),
                    description: newProjectDescription.trim(),
                    image_url: imageUrl,
                    link_url: newProjectLinkUrl.trim() || null,
                    type: projectTypeFilter // Set type based on the current filter
                }),
            });

            // 3. Update state and reset form
            setProjects(prev => [...prev, newItem]);
            setNewProjectTitle('');
            setNewProjectDescription('');
            setNewProjectLinkUrl('');
            setNewProjectFile(null);
            setNewProjectImagePreviewUrl(null);

        } catch (err: any) {
            setError(`Failed to add project: ${err.message}`);
        } finally {
            setIsAdding(false);
        }
    };

    // Handler for selecting/dropping an image for the new project
    const handleNewProjectImageSelect = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        let file: File | null = null;
        if ('dataTransfer' in event) { // Drag event
            event.preventDefault();
            event.stopPropagation();
            file = event.dataTransfer.files?.[0] || null;
        } else if ('target' in event) { // Change event from input
            file = event.target.files?.[0] || null;
        }

        if (file && file.type.startsWith('image/')) {
            // Basic client-side validation (API does more thorough checks)
            if (file.size > MAX_FILE_SIZE) {
                 alert(`File is too large (Max ${MAX_FILE_SIZE / 1024 / 1024}MB).`);
                 return;
            }
            // You could add MIME type check here too if desired, but API handles it

            setNewProjectFile(file);
            // Generate preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProjectImagePreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // Clear if invalid file dropped/selected
            setNewProjectFile(null);
            setNewProjectImagePreviewUrl(null);
        }
    };

    // Function to clear the selected image
    const clearNewProjectImage = () => {
        setNewProjectFile(null);
        setNewProjectImagePreviewUrl(null);
        // If using a file input, clear its value
        const fileInput = document.getElementById('new-project-image-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Delete item
    const handleDeleteItem = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        const originalItems = [...projects];
        setProjects(prev => prev.filter(item => item.id !== id));
        setError(null);
        try {
            await fetchApi(`${apiBaseUrl}/${id}`, { method: 'DELETE' });
            // TODO: Add call to delete associated image from storage if necessary
        } catch (err: any) { setError(`Failed to delete project: ${err.message}`); setProjects(originalItems); }
    };

    // Start Edit
    const handleEditItem = (id: number) => {
        const item = projects.find(i => i.id === id);
        if (item) {
            setEditingItemId(id);
            setEditingItemTitle(item.title);
            setEditingItemDescription(item.description);
            setEditingItemImageUrl(item.image_url || '');
            setEditingItemLinkUrl(item.link_url || '');
            setError(null);
            setIsSavingEdit(false);
        }
    };

    // Cancel Edit
    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingItemTitle('');
        setEditingItemDescription('');
        setEditingItemImageUrl('');
        setEditingItemLinkUrl('');
    };

    // Save Edit (excluding image for now)
    const handleSaveEdit = async () => {
        if (!editingItemId || !editingItemTitle.trim()) return; // Title is required
        const originalItem = projects.find(i => i.id === editingItemId);
        // Check if only non-image fields changed
        const changed = originalItem?.title !== editingItemTitle.trim() ||
                       originalItem.description !== editingItemDescription.trim() ||
                       originalItem.link_url !== (editingItemLinkUrl.trim() || null);

        if (!changed) { // If only image might have changed (handled separately), or nothing changed
             handleCancelEdit();
             return;
        }

        setIsSavingEdit(true); setError(null);
        const originalItems = projects.map(i => ({...i}));
        // Update local state optimistically for non-image fields
        setProjects(prev => prev.map(i => i.id === editingItemId ? {
            ...i,
            title: editingItemTitle.trim(),
            description: editingItemDescription.trim(),
            link_url: editingItemLinkUrl.trim() || null
            // image_url is handled separately by upload/paste/drag-drop
        } : i));

        try {
            await fetchApi(`${apiBaseUrl}/${editingItemId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title: editingItemTitle.trim(),
                    description: editingItemDescription.trim(),
                    link_url: editingItemLinkUrl.trim() || null,
                    // image_url is not sent here, updated via image upload mechanism
                }),
            });
            handleCancelEdit(); // Close edit mode after successful save
        } catch (err: any) {
            setError(`Failed to save changes: ${err.message}`);
            setProjects(originalItems); // Revert optimistic update on error
        }
        finally { setIsSavingEdit(false); }
    };

    // Placeholder for image update logic (will be called by drag/paste handlers)
    const handleUpdateImage = async (id: number, imageUrl: string) => {
        setIsUploadingImage(true); // Or a specific state for this item
        setError(null);
        const originalItems = projects.map(i => ({...i}));
        // Optimistic UI update
        setProjects(prev => prev.map(p => p.id === id ? { ...p, image_url: imageUrl } : p));
        try {
            await fetchApi(`${apiBaseUrl}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ image_url: imageUrl }),
            });
            // Potentially close edit mode if open? Depends on UX decision.
        } catch (err: any) {
            setError(`Failed to update image: ${err.message}`);
            setProjects(originalItems); // Revert on error
        } finally {
            setIsUploadingImage(false);
        }
    };


    // Toggle Visibility
    const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
        const newVisibility = !currentVisibility;
        const originalItems = projects.map(i => ({...i}));
        setProjects(prev => prev.map(i => i.id === id ? { ...i, is_visible: newVisibility } : i));
        setError(null);
        try {
            await fetchApi(`${apiBaseUrl}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ is_visible: newVisibility }),
            });
        } catch (err: any) { setError(`Failed to update visibility: ${err.message}`); setProjects(originalItems); }
    };

    // Dnd Sensors
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    // Dnd Drag End
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = projects.findIndex(i => i.id.toString() === active.id);
            const newIndex = projects.findIndex(i => i.id.toString() === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(projects, oldIndex, newIndex);
            setProjects(reordered);
            const updates = reordered.map((item: Project, index: number) => ({ id: item.id, display_order: index }));
            setIsSavingOrder(true); setError(null);
            try {
                await fetchApi(`${apiBaseUrl}/reorder`, { // Needs endpoint /api/homepage/projects/reorder
                    method: 'PUT',
                    body: JSON.stringify({ items: updates }),
                });
                setProjects(reordered.map((item, index) => ({ ...item, display_order: index })));
            } catch (err: any) { setError(`Failed to save order: ${err.message}`); /* Keep reordered state */ }
            finally { setIsSavingOrder(false); }
        }
    };

    // Filtered projects based on the current state
    const filteredProjects = projects.filter(p => p.type === projectTypeFilter);

    // --- Render ---
    return (
        <div className="p-6 h-full flex flex-col">
            {/* Error Display */}
            {error && (
                <div className={`${themeColors.errorBg} ${themeColors.errorText} p-3 rounded-md mb-4 flex items-center`}>
                    <AlertTriangle size={18} className="mr-2" /><span>{error}</span>
                </div>
            )}

             {/* Add Form */}
             <div className="mb-6 border rounded-md ${themeColors.devBorder} ${themeColors.devMutedBg}">
                <div
                    className={`flex items-center justify-between p-4 cursor-pointer`}
                    onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                    aria-expanded={isAddFormOpen}
                    aria-controls="add-project-form-content"
                >
                    <h3 className={`text-lg font-medium ${themeColors.devText}`}>Add New Project</h3>
                    {isAddFormOpen ? <ChevronUp size={20} className={themeColors.devDescText} /> : <ChevronDown size={20} className={themeColors.devDescText} />}
                </div>

                <AnimatePresence initial={false}>
                    {isAddFormOpen && (
                        <motion.div
                            id="add-project-form-content"
                            key="content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } }}
                            exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                            className="overflow-hidden" // Important for height animation
                        >
                            <div className="p-4 pt-0 space-y-3"> {/* Removed outer padding, add padding here */}
                                {/* Text Inputs */}
                                <input type="text" value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} placeholder="Project title..."
                                    className={`w-full px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50`}
                                    disabled={isAdding || isLoading}
                                />
                                <textarea value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="Project description..." rows={3}
                                    className={`w-full px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50 resize-y`}
                                    disabled={isAdding || isLoading}
                                />
                                {/* Image Upload Area */}
                                <div className="space-y-1">
                                    <label className={`block text-sm font-medium ${themeColors.devDescText}`}>Project Image (Optional)</label>
                                    <div
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${themeColors.devBorder} border-dashed rounded-md ${themeColors.devCardBg}`}
                                        onDrop={handleNewProjectImageSelect}
                                        onDragOver={(e) => e.preventDefault()} // Necessary to allow drop
                                    >
                                        <div className="space-y-1 text-center">
                                            {newProjectImagePreviewUrl ? (
                                                <div className="relative group w-32 h-32 mx-auto mb-2">
                                                    <img src={newProjectImagePreviewUrl} alt="New project preview" className="w-full h-full object-cover rounded-md" />
                                                    <button
                                                        onClick={clearNewProjectImage}
                                                        className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        title="Remove image"
                                                        type="button"
                                                    >
                                                        <X size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <svg className={`mx-auto h-12 w-12 ${themeColors.devDescText}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label
                                                    htmlFor="new-project-image-input"
                                                    className={`relative cursor-pointer ${themeColors.devMutedBg} rounded-md font-medium ${themeColors.devAccent} hover:text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500 px-1`}
                                                >
                                                    <span>Upload a file</span>
                                                    <input id="new-project-image-input" name="new-project-image-input" type="file" className="sr-only" accept="image/*" onChange={handleNewProjectImageSelect} disabled={isAdding || isLoading} />
                                                </label>
                                                <p className={`pl-1 ${themeColors.devDescText}`}>or drag and drop</p>
                                            </div>
                                            <p className={`text-xs ${themeColors.devDescText}`}>PNG, JPG, GIF, WEBP, SVG up to ${MAX_FILE_SIZE / 1024 / 1024}MB</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Link URL Input */}
                                <input type="text" value={newProjectLinkUrl} onChange={(e) => setNewProjectLinkUrl(e.target.value)} placeholder="Link URL (e.g., https://github.com/)..."
                                    className={`w-full px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50`}
                                    disabled={isAdding || isLoading}
                                />
                                <button onClick={handleAddItem} disabled={isAdding || isLoading || !newProjectTitle.trim()} title="Add Project"
                                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${themeColors.devButtonText} ${themeColors.devButtonBg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
                                >
                                    {isAdding ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Plus size={16} className="mr-1" />} Add Project
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Project Type Filter Buttons */}
            <div className="mb-4 flex space-x-2">
                <button
                    onClick={() => setProjectTypeFilter(ProjectType.MAIN)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${projectTypeFilter === ProjectType.MAIN
                            ? `${themeColors.devButtonBg} ${themeColors.devButtonText}`
                            : `${themeColors.devMutedBg} ${themeColors.devDescText} hover:${themeColors.devText}`
                        }`}
                >
                    Main Projects
                </button>
                <button
                    onClick={() => setProjectTypeFilter(ProjectType.FORMER)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${projectTypeFilter === ProjectType.FORMER
                            ? `${themeColors.devButtonBg} ${themeColors.devButtonText}`
                            : `${themeColors.devMutedBg} ${themeColors.devDescText} hover:${themeColors.devText}`
                        }`}
                >
                    Former Projects
                </button>
            </div>

            {/* List - Apply CSS scrollbar hiding trick */}
            <div className={`flex-1 overflow-y-auto pr-4 -mr-4`}>
                 {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className={`h-8 w-8 ${themeColors.devAccent} animate-spin`} /></div>
                 : filteredProjects.length === 0 ? <div className={`${themeColors.devText} text-center py-10`}>No {projectTypeFilter === ProjectType.MAIN ? 'main' : 'former'} projects found.</div>
                 : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={filteredProjects.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
                            <ul className="space-y-4"> {/* Increased spacing for project items */}
                                <AnimatePresence initial={false}>
                                    {filteredProjects.map((item) => (
                                        <SortableProjectItem
                                            key={item.id} item={item} isEditing={editingItemId === item.id} isSavingEdit={isSavingEdit} isUploadingImage={isUploadingImage}
                                            editingTitle={editingItemTitle} editingDescription={editingItemDescription} editingImageUrl={editingItemImageUrl} editingLinkUrl={editingItemLinkUrl}
                                            onEditStart={handleEditItem}
                                            onEditChangeTitle={(value) => setEditingItemTitle(value)}
                                            onEditChangeDescription={(value) => setEditingItemDescription(value)}
                                            onEditChangeImageUrl={(value) => setEditingItemImageUrl(value)} // Temp handler
                                            onEditChangeLinkUrl={(value) => setEditingItemLinkUrl(value)}
                                            onEditSave={handleSaveEdit} onEditCancel={handleCancelEdit}
                                            onDelete={handleDeleteItem} onToggleVisibility={handleToggleVisibility}
                                            onUpdateImage={handleUpdateImage} // Pass down the image update handler
                                            disabled={!!editingItemId && editingItemId !== item.id || isSavingOrder || isAdding} // Disable others during edit/add/order save
                                            setError={setError}
                                            setIsUploadingImage={setIsUploadingImage}
                                        />
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
};


// --- Sortable Project Item Component ---
interface SortableProjectItemProps {
    item: Project;
    isEditing: boolean; isSavingEdit: boolean; isUploadingImage: boolean;
    editingTitle: string; editingDescription: string; editingImageUrl: string; editingLinkUrl: string;
    onEditStart: (id: number) => void;
    onEditChangeTitle: (value: string) => void; onEditChangeDescription: (value: string) => void; onEditChangeImageUrl: (value: string) => void; onEditChangeLinkUrl: (value: string) => void;
    onEditSave: () => void; onEditCancel: () => void;
    onDelete: (id: number) => void; onToggleVisibility: (id: number, currentVisibility: boolean) => void;
    onUpdateImage: (id: number, imageUrl: string) => Promise<void>; // Handler for image updates
    disabled: boolean;
    setError: (error: string | null) => void;
    setIsUploadingImage: (isUploading: boolean) => void;
}

function SortableProjectItem({
    item, isEditing, isSavingEdit, isUploadingImage, editingTitle, editingDescription, editingImageUrl, editingLinkUrl,
    onEditStart, onEditChangeTitle, onEditChangeDescription, onEditChangeImageUrl, onEditChangeLinkUrl, onEditSave, onEditCancel,
    onDelete, onToggleVisibility, onUpdateImage, disabled,
    setError, setIsUploadingImage
}: SortableProjectItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id.toString(), disabled: isEditing }); // Disable sorting while editing this item
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 10 : 'auto' };

    // Placeholder Image Upload Handler (Drag/Drop/Paste Logic will go here)
    const handleImageDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (isUploadingImage || isSavingEdit || disabled) return; // Prevent upload if busy

        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) { // Basic check, more thorough check happens in API
            console.log("Dropped file:", file.name);
            setError(null); // Clear previous errors
             try {
                 setIsUploadingImage(true); // Use the passed setter
                 const imageUrl = await uploadImageApi(file); // *** Call the actual upload function ***
                 await onUpdateImage(item.id, imageUrl); // Update the item via parent handler
                 onEditChangeImageUrl(imageUrl); // Update the preview URL in edit state
             } catch (uploadError: any) {
                 setError(`Image upload failed: ${uploadError.message}`); // Use the passed setter
             } finally {
                 setIsUploadingImage(false); // Use the passed setter
             }
        }
    }, [item.id, onUpdateImage, isUploadingImage, isSavingEdit, disabled, setError, setIsUploadingImage, onEditChangeImageUrl]); // Added onEditChangeImageUrl dependency

    const handleImagePaste = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
        if (isUploadingImage || isSavingEdit || disabled) return;
        setError(null); // Clear error on new attempt
        const items = event.clipboardData.items;
        let imageFile: File | null = null;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    imageFile = file;
                    break; // Handle first image found
                }
            }
        }

        if (imageFile) {
            console.log("Pasted image:", imageFile.name);
            try {
                 setIsUploadingImage(true);
                 const imageUrl = await uploadImageApi(imageFile); // *** Call the actual upload function ***
                 await onUpdateImage(item.id, imageUrl); // Update the item via parent handler
                 onEditChangeImageUrl(imageUrl); // Update the preview URL in edit state
             } catch (uploadError: any) {
                 setError(`Image upload failed: ${uploadError.message}`);
             } finally {
                 setIsUploadingImage(false);
             }
        }
    }, [item.id, onUpdateImage, isUploadingImage, isSavingEdit, disabled, setError, setIsUploadingImage, onEditChangeImageUrl]); // Added onEditChangeImageUrl dependency

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Necessary to allow dropping
        event.stopPropagation();
    };


    return (
        <motion.li
            ref={setNodeRef}
            style={style}
            layoutId={`project-item-${item.id}`}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
            className={`flex items-start p-4 rounded-lg ${themeColors.devMutedBg} border ${themeColors.devBorder} relative ${isEditing ? 'ring-2 ring-indigo-500' : ''} ${disabled && !isEditing ? 'opacity-60' : ''}`} // Highlight when editing, dim when disabled
        >
            {/* Drag Handle (only active when not editing) */}
           {!isEditing && (
             <div {...attributes} {...listeners} className={`${themeColors.devDescText} mr-3 mt-1 cursor-grab touch-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} aria-label="Drag to reorder"><GripVertical size={18} /></div>
           )}
           {/* Move handle inside if editing to prevent overlap */}
           {isEditing && <div className={`${themeColors.devDescText} mr-3 mt-1 opacity-50 cursor-not-allowed`}><GripVertical size={18} /></div>}


            {/* Image Area (Left Side) */}
            <div
                className={`w-24 h-24 md:w-32 md:h-32 mr-4 flex-shrink-0 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded overflow-hidden flex items-center justify-center relative group ${isEditing ? 'cursor-pointer' : ''}`} // Make interactive in edit mode
                onDrop={isEditing ? handleImageDrop : undefined}
                onDragOver={isEditing ? handleDragOver : undefined}
                onPaste={isEditing ? handleImagePaste : undefined}
                tabIndex={isEditing ? 0 : -1} // Make focusable for paste when editing
                title={isEditing ? "Drop or paste an image here to replace" : ""}
            >
                {isUploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <Loader2 className={`h-6 w-6 ${themeColors.devAccent} animate-spin`} />
                    </div>
                )}
                {isEditing && !isUploadingImage && (
                     <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center text-white text-xs text-center p-1 transition-opacity duration-200 ${item.image_url ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                        {item.image_url ? "Drop/Paste Image" : "Drop/Paste Image Here"}
                    </div>
                )}
                {item.image_url && !isEditing ? ( // Display image if not editing
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : isEditing && editingImageUrl ? ( // Show current/editing image URL in edit mode (could also show preview)
                     <img src={editingImageUrl} alt="Editing preview" className="w-full h-full object-cover" />
                ): ( // Placeholder if no image
                    <span className={`${themeColors.devDescText} text-xs`}>No Image</span>
                )}

            </div>


            {/* Main Content Area (Center) */}
            <div className="flex-grow flex flex-col mr-4 space-y-1">
                {isEditing ? (
                    // Editing State: Input fields
                    <div className="space-y-2">
                        <input type="text" value={editingTitle} onChange={(e) => onEditChangeTitle(e.target.value)} placeholder="Title" autoFocus
                               className={`w-full px-2 py-1 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded shadow-sm ${themeColors.devText} focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50`}
                               disabled={isSavingEdit || isUploadingImage}
                               onKeyDown={(e) => { if (e.key === 'Enter') onEditSave(); if (e.key === 'Escape') onEditCancel(); }}/>
                        <textarea value={editingDescription} onChange={(e) => onEditChangeDescription(e.target.value)} placeholder="Description" rows={3}
                               className={`w-full px-2 py-1 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded shadow-sm ${themeColors.devText} focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50 resize-y min-h-[60px]`}
                               disabled={isSavingEdit || isUploadingImage}
                               onKeyDown={(e) => { if (e.key === 'Escape') onEditCancel(); }}/>
                         <input type="text" value={editingLinkUrl} onChange={(e) => onEditChangeLinkUrl(e.target.value)} placeholder="Link URL (optional)"
                               className={`w-full px-2 py-1 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded shadow-sm ${themeColors.devText} focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50`}
                               disabled={isSavingEdit || isUploadingImage}
                               onKeyDown={(e) => { if (e.key === 'Enter') onEditSave(); if (e.key === 'Escape') onEditCancel(); }}/>
                    </div>
                ) : (
                    // Display State: Title, Description, Link
                    <>
                        <span className={`font-semibold ${item.is_visible ? themeColors.devText : themeColors.devDisabledText} text-base`}>{item.title}</span>
                        <p className={`${item.is_visible ? themeColors.devDescText : themeColors.devDisabledText} text-sm`}>{item.description}</p>
                        {item.link_url && (
                            <a href={item.link_url} target="_blank" rel="noopener noreferrer" title={item.link_url}
                               className={`inline-flex items-center text-xs ${item.is_visible ? themeColors.devAccent : themeColors.devDisabledText} hover:underline break-all`}>
                                <LinkIcon size={12} className="mr-1 flex-shrink-0"/> {item.link_url}
                            </a>
                        )}
                    </>
                )}
            </div>

            {/* Action Buttons (Right Side) */}
            <div className="flex flex-col space-y-1 ml-2 self-start flex-shrink-0">
                {isEditing ? (
                    <>
                        <button onClick={onEditSave} disabled={isSavingEdit || isUploadingImage || !editingTitle.trim()} title="Save Changes" className={`${themeColors.devDescText} hover:text-green-500 transition-colors disabled:opacity-50`}>{isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}</button>
                        <button onClick={onEditCancel} disabled={isSavingEdit || isUploadingImage} title="Cancel Edit" className={`${themeColors.devDescText} hover:text-gray-400 transition-colors disabled:opacity-50`}><X size={16} /></button>
                    </>
                ) : (
                    <>
                        <button onClick={() => onToggleVisibility(item.id, item.is_visible)} disabled={disabled} title={item.is_visible ? "Hide" : "Show"} className={`${item.is_visible ? themeColors.devDescText : themeColors.devDisabledText} hover:${themeColors.devAccent} transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{item.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                        <button onClick={() => onEditStart(item.id)} disabled={disabled} title="Edit" className={`${themeColors.devDescText} hover:${themeColors.devAccent} transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(item.id)} disabled={disabled} title="Delete" className={`${themeColors.devDescText} hover:text-red-500 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}><Trash2 size={16} /></button>
                    </>
                )}
            </div>
        </motion.li>
    );
}


export default ProjectsEditor; 