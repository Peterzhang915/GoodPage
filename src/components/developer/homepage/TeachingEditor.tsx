"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, AlertTriangle, Save, GripVertical, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { themeColors } from "@/styles/theme";

// 定义一个教学项目类型，基于 Prisma 模式
interface TeachingItem {
    id: number;
    course_title: string;
    details: string | null; // 详情可以为空
    display_order: number;
    is_visible: boolean;
    createdAt: string;
    updatedAt: string;
}

// 可复用的 API 调用函数（考虑移至 utils）
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

const TeachingEditor: React.FC = () => {
    const [teachingItems, setTeachingItems] = useState<TeachingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 添加新项目的状态
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDetails, setNewItemDetails] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    // 内联编辑状态
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingItemTitle, setEditingItemTitle] = useState('');
    const [editingItemDetails, setEditingItemDetails] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [isAddFormOpen, setIsAddFormOpen] = useState(true); // 添加表单折叠状态

    const apiBaseUrl = '/api/homepage/teaching'; // API 端点，用于教学项目

    // 加载项目
    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchApi(apiBaseUrl);
            setTeachingItems(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // 添加项目
    const handleAddItem = async () => {
        if (!newItemTitle.trim()) return; // 需要至少一个标题
        setIsAdding(true);
        setError(null);
        try {
            const newItem = await fetchApi(apiBaseUrl, {
                method: 'POST',
                body: JSON.stringify({
                    course_title: newItemTitle.trim(),
                    details: newItemDetails.trim() || null // 如果详情为空则发送 null
                }),
            });
            setTeachingItems(prev => [...prev, newItem]);
            setNewItemTitle('');
            setNewItemDetails('');
        } catch (err: any) {
            setError(`Failed to add teaching item: ${err.message}`);
        } finally {
            setIsAdding(false);
        }
    };

    // 删除项目
    const handleDeleteItem = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this teaching item?')) return;
        const originalItems = [...teachingItems];
        setTeachingItems(prev => prev.filter(item => item.id !== id));
        setError(null);
        try {
            await fetchApi(`${apiBaseUrl}/${id}`, { method: 'DELETE' });
        } catch (err: any) { setError(`Failed to delete teaching item: ${err.message}`); setTeachingItems(originalItems); }
    };

    // 开始编辑
    const handleEditItem = (id: number) => {
        const item = teachingItems.find(i => i.id === id);
        if (item) {
            setEditingItemId(id);
            setEditingItemTitle(item.course_title);
            setEditingItemDetails(item.details || ''); // 处理空详情
            setError(null);
            setIsSavingEdit(false);
        }
    };

    // 取消编辑
    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingItemTitle('');
        setEditingItemDetails('');
    };

    // 保存编辑
    const handleSaveEdit = async () => {
        if (!editingItemId || !editingItemTitle.trim()) return; // 标题是必需的
        const originalItem = teachingItems.find(i => i.id === editingItemId);
        const trimmedDetails = editingItemDetails.trim() || null; // 确保空字符串为 null

        if (originalItem?.course_title === editingItemTitle.trim() && originalItem?.details === trimmedDetails) {
            handleCancelEdit();
            return;
        }

        setIsSavingEdit(true); setError(null);
        const originalItems = teachingItems.map(i => ({...i}));
        setTeachingItems(prev => prev.map(i => i.id === editingItemId ? {
             ...i,
             course_title: editingItemTitle.trim(),
             details: trimmedDetails
            } : i));

        try {
            await fetchApi(`${apiBaseUrl}/${editingItemId}`, {
                method: 'PUT',
                body: JSON.stringify({
                     course_title: editingItemTitle.trim(),
                     details: trimmedDetails
                    }),
            });
            handleCancelEdit();
        } catch (err: any) { setError(`Failed to save changes: ${err.message}`); setTeachingItems(originalItems); }
        finally { setIsSavingEdit(false); }
    };

    // 切换可见性
    const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
        const newVisibility = !currentVisibility;
        const originalItems = teachingItems.map(i => ({...i}));
        setTeachingItems(prev => prev.map(i => i.id === id ? { ...i, is_visible: newVisibility } : i));
        setError(null);
        try {
            await fetchApi(`${apiBaseUrl}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ is_visible: newVisibility }),
            });
        } catch (err: any) { setError(`Failed to update visibility: ${err.message}`); setTeachingItems(originalItems); }
    };

    // Dnd 传感器
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    // Dnd 拖拽结束
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = teachingItems.findIndex(i => i.id.toString() === active.id);
            const newIndex = teachingItems.findIndex(i => i.id.toString() === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(teachingItems, oldIndex, newIndex);
            setTeachingItems(reordered);
            const updates = reordered.map((item: TeachingItem, index: number) => ({ id: item.id, display_order: index }));
            setIsSavingOrder(true); setError(null);
            try {
                await fetchApi(`${apiBaseUrl}/reorder`, { // 需要端点 /api/homepage/teaching/reorder
                    method: 'PUT',
                    body: JSON.stringify({ items: updates }),
                });
                setTeachingItems(reordered.map((item, index) => ({ ...item, display_order: index })));
            } catch (err: any) { setError(`Failed to save order: ${err.message}`); /* Keep reordered state */ }
            finally { setIsSavingOrder(false); }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            {/* 错误显示 */}
            {error && (
                <div className={`${themeColors.errorBg} ${themeColors.errorText} p-3 rounded-md mb-4 flex items-center`}>
                    <AlertTriangle size={18} className="mr-2" /><span>{error}</span>
                </div>
            )}

            {/* 添加表单 */}
            <div className={`mb-6 border rounded-md ${themeColors.devBorder} ${themeColors.devMutedBg}`}>
                <div
                    className={`flex items-center justify-between p-4`}
                >
                    <h3 className={`text-lg font-medium ${themeColors.devText}`}>Add Teaching Item</h3>
                    <button
                        type="button"
                        className="ml-2"
                        onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                        aria-label={isAddFormOpen ? "Collapse" : "Expand"}
                        tabIndex={0}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                    >
                    {isAddFormOpen ? <ChevronUp size={20} className={themeColors.devDescText} /> : <ChevronDown size={20} className={themeColors.devDescText} />}
                    </button>
                </div>

                <AnimatePresence initial={false}>
                    {isAddFormOpen && (
                        <motion.div
                            id="add-teaching-form-content"
                            key="content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } }}
                            exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 pt-2 space-y-3"> {/* 增加pt-2，保证输入框与标题有间距 */}
                                <input type="text" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} placeholder="Course title..."
                                       className={`w-full px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50`}
                                       disabled={isAdding || isLoading || !!editingItemId || isSavingOrder}
                                />
                                <textarea value={newItemDetails} onChange={(e) => setNewItemDetails(e.target.value)} placeholder="Details (e.g., Semesters, TAs)..."
                                          rows={2}
                                          className={`w-full px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50 resize-y`}
                                          disabled={isAdding || isLoading || !!editingItemId || isSavingOrder}
                                />
                                <button onClick={handleAddItem} disabled={isAdding || isLoading || !newItemTitle.trim() || !!editingItemId || isSavingOrder} title="Add Teaching Item"
                                        className={`self-end inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${themeColors.devButtonText} ${themeColors.devButtonBg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
                                >
                                    {isAdding ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Plus size={16} className="mr-1" />} Add
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 列表 */}
            <div className={`flex-1 overflow-y-auto pr-4 -mr-4`}>
                {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className={`h-8 w-8 ${themeColors.devAccent} animate-spin`} /></div>
                 : teachingItems.length === 0 ? <div className={`${themeColors.devText} text-center py-10`}>No teaching items found.</div>
                 : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={teachingItems.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
                            <ul className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {teachingItems.map((item) => (
                                        <SortableTeachingItem
                                            key={item.id} item={item} isEditing={editingItemId === item.id} isSavingEdit={isSavingEdit}
                                            editingTitle={editingItemTitle} editingDetails={editingItemDetails}
                                            onEditStart={handleEditItem}
                                            onEditChangeTitle={setEditingItemTitle}
                                            onEditChangeDetails={setEditingItemDetails}
                                            onEditSave={handleSaveEdit} onEditCancel={handleCancelEdit} onDelete={handleDeleteItem}
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

// --- 可排序项目组件 ---
interface SortableTeachingItemProps {
    item: TeachingItem;
    isEditing: boolean; isSavingEdit: boolean;
    editingTitle: string; editingDetails: string;
    onEditStart: (id: number) => void;
    onEditChangeTitle: (value: string) => void; onEditChangeDetails: (value: string) => void;
    onEditSave: () => void; onEditCancel: () => void;
    onDelete: (id: number) => void; onToggleVisibility: (id: number, currentVisibility: boolean) => void;
    disabled: boolean;
}

function SortableTeachingItem({
    item, isEditing, isSavingEdit, editingTitle, editingDetails,
    onEditStart, onEditChangeTitle, onEditChangeDetails, onEditSave, onEditCancel,
    onDelete, onToggleVisibility, disabled
}: SortableTeachingItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id.toString() });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 10 : 'auto' };

    return (
        <motion.li
            ref={setNodeRef}
            style={style}
            layoutId={`teaching-item-${item.id}`}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
            className={`flex items-start p-3 rounded-md ${themeColors.devMutedBg} border ${themeColors.devBorder} relative ${isEditing ? 'ring-2 ring-indigo-500' : ''} ${disabled && !isEditing ? 'opacity-60' : ''}`}
        >
            {/* 拖拽手柄 */}
           {!isEditing && (
             <div {...attributes} {...listeners} className={`${themeColors.devDescText} mr-3 mt-1 cursor-grab touch-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} aria-label="Drag to reorder"><GripVertical size={18} /></div>
           )}
           {isEditing && <div className={`${themeColors.devDescText} mr-3 mt-1 opacity-50 cursor-not-allowed`}><GripVertical size={18} /></div>}

            {/* 主要内容区域（标题 + 详情） */}
            <div className="flex-grow flex flex-col mr-4 space-y-1">
                {isEditing ? (
                    <>
                        <input
                            type="text" value={editingTitle} onChange={(e) => onEditChangeTitle(e.target.value)} placeholder="Course title" autoFocus
                            className={`w-full px-2 py-1 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded shadow-sm ${themeColors.devText} focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50`}
                            disabled={isSavingEdit}
                            onKeyDown={(e) => { if (e.key === 'Enter') onEditSave(); if (e.key === 'Escape') onEditCancel(); }}
                        />
                        <textarea
                            value={editingDetails} onChange={(e) => onEditChangeDetails(e.target.value)} placeholder="Details (optional)" rows={2}
                            className={`w-full px-2 py-1 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded shadow-sm ${themeColors.devText} focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50 resize-y min-h-[40px]`}
                            disabled={isSavingEdit}
                            onKeyDown={(e) => { if (e.key === 'Escape') onEditCancel(); }}
                        />
                    </>
                ) : (
                    <>
                        <span className={`font-semibold ${item.is_visible ? themeColors.devText : themeColors.devDisabledText} text-sm`}>{item.course_title}</span>
                        {item.details && <p className={`${item.is_visible ? themeColors.devDescText : themeColors.devDisabledText} text-xs`}>{item.details}</p>}
                    </>
                )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col space-y-1 ml-2 self-start flex-shrink-0">
                {isEditing ? (
                    <>
                        <button onClick={onEditSave} disabled={isSavingEdit || !editingTitle.trim()} title="Save Changes" className={`${themeColors.devDescText} hover:text-green-500 transition-colors disabled:opacity-50`}>{isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}</button>
                        <button onClick={onEditCancel} disabled={isSavingEdit} title="Cancel Edit" className={`${themeColors.devDescText} hover:text-gray-400 transition-colors disabled:opacity-50`}><X size={16} /></button>
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

export default TeachingEditor; 