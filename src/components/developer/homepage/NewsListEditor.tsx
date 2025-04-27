"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, AlertTriangle, Save, GripVertical, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { themeColors } from "@/styles/theme";

// Define the type for a news item based on our Prisma schema
interface NewsItem {
    id: number;
    content: string;
    display_order: number;
    is_visible: boolean;
    createdAt: string; // Assuming string representation from JSON
    updatedAt: string;
}

// Function to make API calls (could be moved to a dedicated api client later)
async function fetchApi(url: string, options: RequestInit = {}) {
    try {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
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


const NewsListEditor: React.FC = () => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newItemContent, setNewItemContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // State for inline editing
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingItemContent, setEditingItemContent] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false); // State for saving order
    const [isAddFormOpen, setIsAddFormOpen] = useState(true); // State for add form collapse

    // Fetch news items
    const loadNews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchApi('/api/homepage/news');
            setNewsItems(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    // Handle adding a new item
    const handleAddItem = async () => {
        if (!newItemContent.trim()) return; // Don't add empty items
        setIsAdding(true);
        setError(null);
        try {
            const newItem = await fetchApi('/api/homepage/news', {
                method: 'POST',
                body: JSON.stringify({ content: newItemContent.trim() }),
            });
            setNewsItems(prevItems => [...prevItems, newItem]); // Add to the end for now
            setNewItemContent(''); // Clear input
        } catch (err: any) {
            setError(`Failed to add item: ${err.message}`);
        } finally {
            setIsAdding(false);
        }
    };

    // TODO: Implement Delete
    const handleDeleteItem = async (id: number) => {
        // Optimistic UI update: Remove immediately and add back on error?
        // For simplicity, let's remove after successful API call first.

        // Prevent accidental deletion (optional but recommended)
        if (!window.confirm('Are you sure you want to delete this news item?')) {
            return;
        }

        // Find the item to potentially add back on error (or just use ID)
        // const itemToDelete = newsItems.find(item => item.id === id);

        // Update state immediately for responsiveness (Optimistic Update)
        const originalItems = [...newsItems];
        setNewsItems(prevItems => prevItems.filter(item => item.id !== id));
        setError(null); // Clear previous errors

        try {
            await fetchApi(`/api/homepage/news/${id}`, {
                method: 'DELETE',
            });
            // If API succeeds, state is already updated.
        } catch (err: any) {
            console.error("Delete failed:", err);
            setError(`Failed to delete item: ${err.message}`);
            // Rollback UI on error
            setNewsItems(originalItems);
        }
    };

    // TODO: Implement Edit (Inline? Modal?)
    const handleEditItem = (id: number) => {
        const itemToEdit = newsItems.find(item => item.id === id);
        if (itemToEdit) {
            setEditingItemId(id);
            setEditingItemContent(itemToEdit.content);
            setError(null); // Clear errors when starting edit
            setIsSavingEdit(false); // Reset saving state
        }
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingItemContent('');
    };

    const handleSaveEdit = async () => {
        if (!editingItemId || !editingItemContent.trim()) return;

        const originalContent = newsItems.find(item => item.id === editingItemId)?.content;
        if (originalContent === editingItemContent.trim()) {
            // No change, just cancel edit
            handleCancelEdit();
            return;
        }

        setIsSavingEdit(true);
        setError(null);

        // Optimistic Update
        const originalItems = newsItems.map(item => ({ ...item }));
        setNewsItems(prevItems =>
            prevItems.map(item =>
                item.id === editingItemId ? { ...item, content: editingItemContent.trim() } : item
            )
        );

        try {
            await fetchApi(`/api/homepage/news/${editingItemId}`, {
                method: 'PUT',
                body: JSON.stringify({ content: editingItemContent.trim() }),
            });
            // Success, clear editing state
            handleCancelEdit();
        } catch (err: any) {
            console.error("Save edit failed:", err);
            setError(`Failed to save changes: ${err.message}`);
            // Rollback UI on error
            setNewsItems(originalItems);
            // Keep editing mode open on error to allow retry/cancel
            // setEditingItemId(editingItemId); // Already set
            // setEditingItemContent(editingItemContent); // Already set
        } finally {
            setIsSavingEdit(false);
        }
    };

    // TODO: Implement Toggle Visibility
    const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
        const newVisibility = !currentVisibility;

        // Optimistic Update
        const originalItems = newsItems.map(item => ({ ...item })); // Deep copy for potential rollback
        setNewsItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, is_visible: newVisibility } : item
            )
        );
        setError(null);

        try {
            await fetchApi(`/api/homepage/news/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ is_visible: newVisibility }),
            });
            // API call successful, state is already updated
        } catch (err: any) {
            console.error("Toggle visibility failed:", err);
            setError(`Failed to update visibility: ${err.message}`);
            // Rollback UI on error
            setNewsItems(originalItems);
        }
    };

    // TODO: Implement Reordering (Drag & Drop)

    // --- @dnd-kit Sensor setup ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- @dnd-kit Drag End Handler ---
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = newsItems.findIndex(item => item.id.toString() === active.id);
            const newIndex = newsItems.findIndex(item => item.id.toString() === over.id);

            if (oldIndex === -1 || newIndex === -1) return;

            const reorderedItems = arrayMove(newsItems, oldIndex, newIndex);

            // Update local state immediately for smooth UI
            setNewsItems(reorderedItems);

            // Prepare data for API: array of { id, display_order }
            const orderUpdates = reorderedItems.map((item, index) => ({
                id: item.id,
                display_order: index, // New order based on array index
            }));

            // Call API to save the new order
            setIsSavingOrder(true);
            setError(null);
            try {
                // We need a new API endpoint for batch updating order
                await fetchApi('/api/homepage/news/reorder', { // Assuming this endpoint exists
                    method: 'PUT',
                    body: JSON.stringify({ items: orderUpdates }),
                });
                // Update the display_order in the local state to match the saved order
                setNewsItems(reorderedItems.map((item, index) => ({ ...item, display_order: index })));
            } catch (err: any) {
                console.error("Failed to save new order:", err);
                setError(`Failed to save order: ${err.message}`);
                // Rollback to original order before drag if API fails?
                // Or potentially keep the reordered state and show error?
                // For now, keep reordered state and show error.
            } finally {
                setIsSavingOrder(false);
            }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Error Display */}
            {error && (
                <div className={`${themeColors.errorBg} ${themeColors.errorText} p-3 rounded-md mb-4 flex items-center`}>
                    <AlertTriangle size={18} className="mr-2" /><span>{error}</span>
                </div>
            )}

            {/* Add Form - Ensure consistent container styling */}
            <div className={`mb-6 border rounded-md ${themeColors.devBorder} ${themeColors.devMutedBg}`}>
                 <div
                     className={`flex items-center justify-between p-4 cursor-pointer`}
                     onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                     aria-expanded={isAddFormOpen}
                     aria-controls="add-news-form-content"
                 >
                    <h3 className={`text-lg font-medium ${themeColors.devText}`}>Add News Item</h3>
                     {isAddFormOpen ? <ChevronUp size={20} className={themeColors.devDescText} /> : <ChevronDown size={20} className={themeColors.devDescText} />}
                 </div>

                <AnimatePresence initial={false}>
                     {isAddFormOpen && (
                         <motion.div
                             id="add-news-form-content"
                             key="content"
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } }}
                             exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                             className="overflow-hidden" // Important for height animation
                         >
                             <div className="p-4 pt-0 space-y-3"> {/* Removed outer padding, add padding here */}
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newItemContent}
                                        onChange={(e) => setNewItemContent(e.target.value)}
                                        placeholder="Enter news content..."
                                        // Apply theme colors to input
                                        className={`flex-grow px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50`}
                                        disabled={isAdding || isLoading || !!editingItemId || isSavingOrder}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !isAdding) handleAddItem(); }}
                                    />
                                    <button
                                        onClick={handleAddItem}
                                        disabled={isAdding || isLoading || !newItemContent.trim() || !!editingItemId || isSavingOrder}
                                        title="Add Item"
                                        // Apply theme colors to button
                                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${themeColors.devButtonText} ${themeColors.devButtonBg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
                                    >
                                        {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    </button>
                                </div>
                             </div>
                         </motion.div>
                     )}
                 </AnimatePresence>
            </div>

            {/* News List - Apply CSS scrollbar hiding trick */}
            <div className={`flex-1 overflow-y-auto pr-4 -mr-4`}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className={`h-8 w-8 ${themeColors.devAccent} animate-spin`} />
                    </div>
                ) : newsItems.length === 0 ? (
                    <div className={`${themeColors.devText} text-center py-10`}>No news items found.</div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={newsItems.map(item => item.id.toString())} // Use string IDs for dnd-kit
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {newsItems.map((item) => (
                                        <SortableNewsItem
                                            key={item.id}
                                            item={item}
                                            isEditing={editingItemId === item.id}
                                            isSavingEdit={isSavingEdit}
                                            editingContent={editingItemContent}
                                            onEditStart={handleEditItem}
                                            onEditChange={setEditingItemContent}
                                            onEditSave={handleSaveEdit}
                                            onEditCancel={handleCancelEdit}
                                            onDelete={handleDeleteItem}
                                            onToggleVisibility={handleToggleVisibility}
                                            disabled={!!editingItemId && editingItemId !== item.id || isSavingOrder}
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

// --- Sortable Item Component ---
interface SortableNewsItemProps {
    item: NewsItem;
    isEditing: boolean;
    isSavingEdit: boolean;
    editingContent: string;
    onEditStart: (id: number) => void;
    onEditChange: (value: string) => void;
    onEditSave: () => void;
    onEditCancel: () => void;
    onDelete: (id: number) => void;
    onToggleVisibility: (id: number, currentVisibility: boolean) => void;
    disabled: boolean; // Disable actions if another item is being edited or order is saving
}

function SortableNewsItem({ item, isEditing, isSavingEdit, editingContent, onEditStart, onEditChange, onEditSave, onEditCancel, onDelete, onToggleVisibility, disabled }: SortableNewsItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        <motion.li
            ref={setNodeRef}
            style={style}
            layoutId={`news-item-${item.id}`} // Use layoutId for potential animation across drag/edit
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center p-3 rounded-md ${themeColors.devMutedBg} border ${themeColors.devBorder} relative`}
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className={`${themeColors.devDescText} mr-3 cursor-grab touch-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} aria-label="Drag to reorder">
                <GripVertical size={18} />
            </div>

            {/* Content */}
            {isEditing ? (
                <input
                    type="text"
                    value={editingContent}
                    onChange={(e) => onEditChange(e.target.value)}
                    className={`flex-grow px-2 py-1 mr-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded shadow-sm ${themeColors.devText} focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50`}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onEditSave();
                        if (e.key === 'Escape') onEditCancel();
                    }}
                    disabled={isSavingEdit}
                />
            ) : (
                <span className={`flex-grow ${item.is_visible ? themeColors.devText : themeColors.devDisabledText} text-sm`}>
                    {item.content}
                </span>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
                {isEditing ? (
                    <>
                        <button
                            onClick={onEditSave}
                            className={`${themeColors.devDescText} hover:text-green-500 transition-colors disabled:opacity-50`}
                            title="Save Changes"
                            disabled={isSavingEdit || !editingContent.trim()}
                        >
                            {isSavingEdit ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                        </button>
                        <button
                            onClick={onEditCancel}
                            className={`${themeColors.devDescText} hover:text-gray-400 transition-colors disabled:opacity-50`}
                            title="Cancel Edit"
                            disabled={isSavingEdit}
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => onToggleVisibility(item.id, item.is_visible)}
                            className={`${item.is_visible ? themeColors.devDescText : themeColors.devDisabledText} hover:${themeColors.devAccent} transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={item.is_visible ? "Hide" : "Show"}
                            disabled={disabled}
                        >
                            {item.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                            onClick={() => onEditStart(item.id)}
                            className={`${themeColors.devDescText} hover:${themeColors.devAccent} transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Edit"
                            disabled={disabled}
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(item.id)}
                            className={`${themeColors.devDescText} hover:text-red-500 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Delete"
                            disabled={disabled}
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </div>
        </motion.li>
    );
}

export default NewsListEditor; 