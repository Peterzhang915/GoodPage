"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, AlertTriangle, Save, GripVertical, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { themeColors } from "@/styles/theme";

// 定义新闻项的类型，基于我们的 Prisma 模式
interface NewsItem {
    id: number;
    content: string;
    display_order: number;
    is_visible: boolean;
    createdAt: string; // 假设从 JSON 表示为字符串
    updatedAt: string;
}

// 函数用于调用 API（可以稍后移至专门的 API 客户端）
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

    // 内联编辑状态
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingItemContent, setEditingItemContent] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false); // 保存顺序状态
    const [isAddFormOpen, setIsAddFormOpen] = useState(true); // 添加表单折叠状态

    // 获取新闻项
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

    // 添加新项
    const handleAddItem = async () => {
        if (!newItemContent.trim()) return; // 不要添加空项
        setIsAdding(true);
        setError(null);
        try {
            const newItem = await fetchApi('/api/homepage/news', {
                method: 'POST',
                body: JSON.stringify({ content: newItemContent.trim() }),
            });
            setNewsItems(prevItems => [...prevItems, newItem]); // 添加到末尾
            setNewItemContent(''); // 清除输入
        } catch (err: any) {
            setError(`Failed to add item: ${err.message}`);
        } finally {
            setIsAdding(false);
        }
    };

    // TODO: Implement Delete
    const handleDeleteItem = async (id: number) => {
        // 乐观 UI 更新：立即删除并添加回错误？
        // 为简单起见，让我们先删除成功 API 调用后。

        // 防止意外删除（可选但推荐）
        if (!window.confirm('Are you sure you want to delete this news item?')) {
            return;
        }

        // 查找项以在错误时添加回（或仅使用 ID）
        // const itemToDelete = newsItems.find(item => item.id === id);

        // 立即更新状态以获得响应性（乐观更新）
        const originalItems = [...newsItems];
        setNewsItems(prevItems => prevItems.filter(item => item.id !== id));
        setError(null); // 清除之前的错误

        try {
            await fetchApi(`/api/homepage/news/${id}`, {
                method: 'DELETE',
            });
            // 如果 API 成功，状态已更新。
        } catch (err: any) {
            console.error("Delete failed:", err);
            setError(`Failed to delete item: ${err.message}`);
            // 在错误时回滚 UI
            setNewsItems(originalItems);
        }
    };

    // TODO: Implement Edit (Inline? Modal?)
    const handleEditItem = (id: number) => {
        const itemToEdit = newsItems.find(item => item.id === id);
        if (itemToEdit) {
            setEditingItemId(id);
            setEditingItemContent(itemToEdit.content);
            setError(null); // 开始编辑时清除错误
            setIsSavingEdit(false); // 重置保存状态
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
            // 没有变化，只取消编辑
            handleCancelEdit();
            return;
        }

        setIsSavingEdit(true);
        setError(null);

        // 乐观更新
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
            // 成功，清除编辑状态
            handleCancelEdit();
        } catch (err: any) {
            console.error("Save edit failed:", err);
            setError(`Failed to save changes: ${err.message}`);
            // 在错误时回滚 UI
            setNewsItems(originalItems);
            // 在错误时保持编辑模式打开以允许重试/取消
            // setEditingItemId(editingItemId); // 已设置
            // setEditingItemContent(editingItemContent); // 已设置
        } finally {
            setIsSavingEdit(false);
        }
    };

    // TODO: Implement Toggle Visibility
    const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
        const newVisibility = !currentVisibility;

        // 乐观更新
        const originalItems = newsItems.map(item => ({ ...item })); // 深拷贝以进行回滚
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
            // API 调用成功，状态已更新
        } catch (err: any) {
            console.error("Toggle visibility failed:", err);
            setError(`Failed to update visibility: ${err.message}`);
            // 在错误时回滚 UI
            setNewsItems(originalItems);
        }
    };

    // TODO: Implement Reordering (Drag & Drop)

    // --- @dnd-kit 传感器设置 ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- @dnd-kit 拖拽结束处理程序 ---
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = newsItems.findIndex(item => item.id.toString() === active.id);
            const newIndex = newsItems.findIndex(item => item.id.toString() === over.id);

            if (oldIndex === -1 || newIndex === -1) return;

            const reorderedItems = arrayMove(newsItems, oldIndex, newIndex);

            // 立即更新本地状态以获得平滑 UI
            setNewsItems(reorderedItems);

            // 准备 API 数据：{ id, display_order } 数组
            const orderUpdates = reorderedItems.map((item, index) => ({
                id: item.id,
                display_order: index, // 基于数组索引的新顺序
            }));

            // 调用 API 保存新顺序
            setIsSavingOrder(true);
            setError(null);
            try {
                // 我们需要一个新的 API 端点来批量更新顺序
                await fetchApi('/api/homepage/news/reorder', { // 假设此端点存在
                    method: 'PUT',
                    body: JSON.stringify({ items: orderUpdates }),
                });
                // 更新本地状态中的 display_order 以匹配保存的顺序
                setNewsItems(reorderedItems.map((item, index) => ({ ...item, display_order: index })));
            } catch (err: any) {
                console.error("Failed to save new order:", err);
                setError(`Failed to save order: ${err.message}`);
                // 在拖拽前回滚到原始顺序？
                // 或者潜在地保持重新排序的状态并显示错误？
                // 目前，保持重新排序的状态并显示错误。
            } finally {
                setIsSavingOrder(false);
            }
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

            {/* 添加表单 - 确保一致的容器样式 */}
            <div className={`mb-6 border rounded-md ${themeColors.devBorder} ${themeColors.devMutedBg}`}>
                 <div
                     className={`flex items-center justify-between p-4`}
                 >
                    <h3 className={`text-lg font-medium ${themeColors.devText}`}>Add News Item</h3>
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
                             id="add-news-form-content"
                             key="content"
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } }}
                             exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                             className="overflow-hidden" // 重要用于高度动画
                         >
                             <div className="p-4 pt-2 space-y-3"> {/* 增加pt-2，保证输入框与标题有间距 */}
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newItemContent}
                                        onChange={(e) => setNewItemContent(e.target.value)}
                                        placeholder="Enter news content..."
                                        // 应用主题颜色到输入框
                                        className={`flex-grow px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50`}
                                        disabled={isAdding || isLoading || !!editingItemId || isSavingOrder}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !isAdding) handleAddItem(); }}
                                    />
                                    <button
                                        onClick={handleAddItem}
                                        disabled={isAdding || isLoading || !newItemContent.trim() || !!editingItemId || isSavingOrder}
                                        title="Add Item"
                                        // 应用主题颜色到按钮
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

            {/* 新闻列表 - 应用 CSS 滚动条隐藏技巧 */}
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
                            items={newsItems.map(item => item.id.toString())} // 使用字符串 ID 进行 dnd-kit
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

// --- 可排序项组件 ---
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
    disabled: boolean; // 如果另一个项正在编辑或正在保存顺序，则禁用操作
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
            layoutId={`news-item-${item.id}`} // 使用 layoutId 进行拖拽/编辑动画
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center p-3 rounded-md ${themeColors.devMutedBg} border ${themeColors.devBorder} relative`}
        >
            {/* 拖拽手柄 */}
            <div {...attributes} {...listeners} className={`${themeColors.devDescText} mr-3 cursor-grab touch-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} aria-label="Drag to reorder">
                <GripVertical size={18} />
            </div>

            {/* 内容 */}
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

            {/* 操作按钮 */}
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