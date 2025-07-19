"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, AlertTriangle, Save, GripVertical, X, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react'; // Added LinkIcon, ChevronDown, ChevronUp
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { themeColors } from "@/styles/theme";

// --- 客户端常量 ---
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB 限制 - 应与 API 路由匹配

// 定义 ProjectType 枚举本地化 (匹配 schema.prisma)
enum ProjectType { MAIN = 'MAIN', FORMER = 'FORMER' }

// 根据可能的 Prisma schema 定义项目类型
interface Project {
    id: number;
    title: string;
    description: string;
    image_url: string | null; // 图片 URL 可以为空
    link_url: string | null; // 链接 URL 可以为空
    display_order: number;
    is_visible: boolean;
    createdAt: string;
    updatedAt: string;
    type: ProjectType; // 添加类型字段
}

// 可重用的 API 调用函数 (保留或移至 utils)
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

// 新图片上传辅助函数
async function uploadImageApi(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    // 假设端点 /api/upload/project-image 存在并处理 'file' 字段
    // 成功返回 { success: true, data: { url: "..." } }
    // 失败返回 { success: false, error: { message: "..." } }
    const apiUrl = '/api/upload/project-image'; // 定义上传端点

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            // 不要设置 Content-Type 头，浏览器会处理
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
    // 添加新项目的状态
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectLinkUrl, setNewProjectLinkUrl] = useState('');
    const [newProjectFile, setNewProjectFile] = useState<File | null>(null); // 文件选择状态
    const [newProjectImagePreviewUrl, setNewProjectImagePreviewUrl] = useState<string | null>(null); // 图片预览 URL 状态
    const [isAdding, setIsAdding] = useState(false);
    // 内联编辑状态
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingItemTitle, setEditingItemTitle] = useState('');
    const [editingItemDescription, setEditingItemDescription] = useState('');
    const [editingItemImageUrl, setEditingItemImageUrl] = useState(''); // 临时：稍后更改
    const [editingItemLinkUrl, setEditingItemLinkUrl] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false); // 图片上传状态
    const [isAddFormOpen, setIsAddFormOpen] = useState(true); // 添加表单折叠状态
    const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectType>(ProjectType.MAIN); // 过滤状态

    const apiBaseUrl = '/api/homepage/projects'; // 项目 API 的基础 URL

    // 加载项目
    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 初始化时获取所有项目
            const data = await fetchApi(apiBaseUrl);
            setProjects(data || []);
            // 注意：过滤现在在客户端进行，基于 projectTypeFilter
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // 添加项目 - 默认为 MAIN 类型
    const handleAddItem = async () => {
        if (!newProjectTitle.trim()) return; // 需要至少一个标题
        setIsAdding(true);
        setError(null);
        let imageUrl: string | null = null;

        try {
            // 1. 如果选择了文件，则上传它
            if (newProjectFile) {
                try {
                    imageUrl = await uploadImageApi(newProjectFile);
                } catch (uploadError: any) {
                    throw new Error(`Image upload failed: ${uploadError.message}`);
                }
            }

            // 2. 创建项目项 - 显式设置类型为 MAIN
            const newItem = await fetchApi(apiBaseUrl, {
                method: 'POST',
                body: JSON.stringify({
                    title: newProjectTitle.trim(),
                    description: newProjectDescription.trim(),
                    image_url: imageUrl,
                    link_url: newProjectLinkUrl.trim() || null,
                    type: projectTypeFilter // 根据当前过滤器设置类型
                }),
            });

            // 3. 更新状态并重置表单
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

    // 处理新项目图片选择/拖放
    const handleNewProjectImageSelect = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        let file: File | null = null;
        if ('dataTransfer' in event) { // 拖放事件
            event.preventDefault();
            event.stopPropagation();
            file = event.dataTransfer.files?.[0] || null;
        } else if ('target' in event) { // 输入框事件
            file = event.target.files?.[0] || null;
        }

        if (file && file.type.startsWith('image/')) {
            // 基本客户端验证（API 执行更严格的检查）
            if (file.size > MAX_FILE_SIZE) {
                 alert(`File is too large (Max ${MAX_FILE_SIZE / 1024 / 1024}MB).`);
                 return;
            }
            // 您也可以在这里添加 MIME 类型检查，但 API 会处理

            setNewProjectFile(file);
            // 生成预览 URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProjectImagePreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // 如果无效的拖放/选择，则清除
            setNewProjectFile(null);
            setNewProjectImagePreviewUrl(null);
        }
    };

    // 清除选中的图片
    const clearNewProjectImage = () => {
        setNewProjectFile(null);
        setNewProjectImagePreviewUrl(null);
        // 如果使用文件输入，则清除其值
        const fileInput = document.getElementById('new-project-image-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // 删除项目
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

    // 开始编辑
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

    // 取消编辑
    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingItemTitle('');
        setEditingItemDescription('');
        setEditingItemImageUrl('');
        setEditingItemLinkUrl('');
    };

    // 保存编辑（不包括图片）
    const handleSaveEdit = async () => {
        if (!editingItemId || !editingItemTitle.trim()) return; // 标题是必需的
        const originalItem = projects.find(i => i.id === editingItemId);
        // 检查非图片字段是否已更改
        const changed = originalItem?.title !== editingItemTitle.trim() ||
                       originalItem.description !== editingItemDescription.trim() ||
                       originalItem.link_url !== (editingItemLinkUrl.trim() || null);

        if (!changed) { // 如果只有图片可能已更改（由单独处理），或未更改
             handleCancelEdit();
             return;
        }

        setIsSavingEdit(true); setError(null);
        const originalItems = projects.map(i => ({...i}));
        // 乐观更新本地状态，非图片字段
        setProjects(prev => prev.map(i => i.id === editingItemId ? {
            ...i,
            title: editingItemTitle.trim(),
            description: editingItemDescription.trim(),
            link_url: editingItemLinkUrl.trim() || null
            // image_url 由图片上传机制更新
        } : i));

        try {
            await fetchApi(`${apiBaseUrl}/${editingItemId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title: editingItemTitle.trim(),
                    description: editingItemDescription.trim(),
                    link_url: editingItemLinkUrl.trim() || null,
                    // image_url 不在此发送，由图片上传机制更新
                }),
            });
            handleCancelEdit(); // 保存成功后关闭编辑模式
        } catch (err: any) {
            setError(`Failed to save changes: ${err.message}`);
            setProjects(originalItems); // Revert optimistic update on error 错误时回滚乐观更新
        }
        finally { setIsSavingEdit(false); }
    };

    // 图片更新逻辑的占位符（将由拖放处理程序调用）
    const handleUpdateImage = async (id: number, imageUrl: string) => {
        setIsUploadingImage(true); // 或特定于此项目的特定状态
        setError(null);
        const originalItems = projects.map(i => ({...i}));
        // 乐观 UI 更新
        setProjects(prev => prev.map(p => p.id === id ? { ...p, image_url: imageUrl } : p));
        try {
            await fetchApi(`${apiBaseUrl}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ image_url: imageUrl }),
            });
            // 可能关闭编辑模式？取决于用户体验决策。
        } catch (err: any) {
            setError(`Failed to update image: ${err.message}`);
            setProjects(originalItems); // Revert on error
        } finally {
            setIsUploadingImage(false);
        }
    };


    // 切换可见性
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

    // Dnd 传感器
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    // Dnd 拖放结束
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
                await fetchApi(`${apiBaseUrl}/reorder`, { // 需要端点 /api/homepage/projects/reorder
                    method: 'PUT',
                    body: JSON.stringify({ items: updates }),
                });
                setProjects(reordered.map((item, index) => ({ ...item, display_order: index })));
            } catch (err: any) { setError(`Failed to save order: ${err.message}`); /* Keep reordered state */ }
            finally { setIsSavingOrder(false); }
        }
    };

    // 根据当前状态过滤项目
    const filteredProjects = projects.filter(p => p.type === projectTypeFilter);

    // --- 渲染 ---
    return (
        <div className="p-6 h-full flex flex-col">
            {/* 错误显示 */}
            {error && (
                <div className={`${themeColors.errorBg} ${themeColors.errorText} p-3 rounded-md mb-4 flex items-center`}>
                    <AlertTriangle size={18} className="mr-2" /><span>{error}</span>
                </div>
            )}

             {/* 添加表单 */}
             <div className="mb-6 border rounded-md ${themeColors.devBorder} ${themeColors.devMutedBg}">
                <div
                    className={`flex items-center justify-between p-4`}
                >
                    <h3 className={`text-lg font-medium ${themeColors.devText}`}>Add New Project</h3>
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
                            id="add-project-form-content"
                            key="content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } }}
                            exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 pt-2 space-y-3"> {/* 增加pt-2，保证输入框与标题有间距 */}
                                {/* 文本输入 */}
                                <input type="text" value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} placeholder="Project Title..."
                                    className={`w-full px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50`}
                                    disabled={isAdding || isLoading}
                                />
                                <textarea value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="Project description..." rows={3}
                                    className={`w-full px-3 py-2 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded-md shadow-sm ${themeColors.devText} placeholder:${themeColors.devDescText} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm disabled:opacity-50 resize-y`}
                                    disabled={isAdding || isLoading}
                                />
                                {/* 图片上传区域 */}
                                <div className="space-y-1">
                                    <label className={`block text-sm font-medium ${themeColors.devDescText}`}>Project Image (Optional)</label>
                                    <div
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${themeColors.devBorder} border-dashed rounded-md ${themeColors.devCardBg}`}
                                        onDrop={handleNewProjectImageSelect}
                                        onDragOver={(e) => e.preventDefault()} // 必要，允许拖放
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

            {/* 项目类型过滤按钮 */}
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

            {/* 列表 - 应用 CSS 滚动条隐藏技巧 */}
            <div className={`flex-1 overflow-y-auto pr-4 -mr-4`}>
                 {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className={`h-8 w-8 ${themeColors.devAccent} animate-spin`} /></div>
                 : filteredProjects.length === 0 ? <div className={`${themeColors.devText} text-center py-10`}>No {projectTypeFilter === ProjectType.MAIN ? 'main' : 'former'} projects found.</div>
                 : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={filteredProjects.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
                            <ul className="space-y-4"> {/* 增加项目项之间的间距 */}
                                <AnimatePresence initial={false}>
                                    {filteredProjects.map((item) => (
                                        <SortableProjectItem
                                            key={item.id} item={item} isEditing={editingItemId === item.id} isSavingEdit={isSavingEdit} isUploadingImage={isUploadingImage}
                                            editingTitle={editingItemTitle} editingDescription={editingItemDescription} editingImageUrl={editingItemImageUrl} editingLinkUrl={editingItemLinkUrl}
                                            onEditStart={handleEditItem}
                                            onEditChangeTitle={(value) => setEditingItemTitle(value)}
                                            onEditChangeDescription={(value) => setEditingItemDescription(value)}
                                            onEditChangeImageUrl={(value) => setEditingItemImageUrl(value)} // 临时处理程序
                                            onEditChangeLinkUrl={(value) => setEditingItemLinkUrl(value)}
                                            onEditSave={handleSaveEdit} onEditCancel={handleCancelEdit}
                                            onDelete={handleDeleteItem} onToggleVisibility={handleToggleVisibility}
                                            onUpdateImage={handleUpdateImage} // 传递图片更新处理程序
                                            disabled={!!editingItemId && editingItemId !== item.id || isSavingOrder || isAdding} // 编辑、添加或保存顺序时禁用其他项目
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


// --- Sortable Project Item 组件 ---
interface SortableProjectItemProps {
    item: Project;
    isEditing: boolean; isSavingEdit: boolean; isUploadingImage: boolean;
    editingTitle: string; editingDescription: string; editingImageUrl: string; editingLinkUrl: string;
    onEditStart: (id: number) => void;
    onEditChangeTitle: (value: string) => void; onEditChangeDescription: (value: string) => void; onEditChangeImageUrl: (value: string) => void; onEditChangeLinkUrl: (value: string) => void;
    onEditSave: () => void; onEditCancel: () => void;
    onDelete: (id: number) => void; onToggleVisibility: (id: number, currentVisibility: boolean) => void;
    onUpdateImage: (id: number, imageUrl: string) => Promise<void>; // 图片更新处理程序
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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id.toString(), disabled: isEditing }); // 编辑此项目时禁用排序
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 10 : 'auto' };

    // 图片上传处理程序的占位符（拖放逻辑将在此处）
    const handleImageDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (isUploadingImage || isSavingEdit || disabled) return; // 防止繁忙上传

        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) { // Basic check, more thorough check happens in API
            console.log("Dropped file:", file.name);
            setError(null); // Clear previous errors
             try {
                 setIsUploadingImage(true); // 使用传递的 setter
                 const imageUrl = await uploadImageApi(file); // *** 调用实际上传函数 ***
                 await onUpdateImage(item.id, imageUrl); // 通过父处理程序更新项目
                 onEditChangeImageUrl(imageUrl); // 在编辑状态中更新预览 URL
             } catch (uploadError: any) {
                 setError(`Image upload failed: ${uploadError.message}`); // Use the passed setter
             } finally {
                 setIsUploadingImage(false); // 使用传递的 setter
             }
        }
    }, [item.id, onUpdateImage, isUploadingImage, isSavingEdit, disabled, setError, setIsUploadingImage, onEditChangeImageUrl]); // 添加 onEditChangeImageUrl 依赖

    const handleImagePaste = useCallback(async (event: React.ClipboardEvent<HTMLDivElement>) => {
        if (isUploadingImage || isSavingEdit || disabled) return;
        setError(null); // 清除新的尝试错误
        const items = event.clipboardData.items;
        let imageFile: File | null = null;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    imageFile = file;
                    break; // 处理找到的第一个图片
                }
            }
        }

        if (imageFile) {
            console.log("Pasted image:", imageFile.name);
            try {
                 setIsUploadingImage(true);
                 const imageUrl = await uploadImageApi(imageFile); // *** 调用实际上传函数 ***
                 await onUpdateImage(item.id, imageUrl); // 通过父处理程序更新项目
                 onEditChangeImageUrl(imageUrl); // 在编辑状态中更新预览 URL
             } catch (uploadError: any) {
                 setError(`Image upload failed: ${uploadError.message}`);
             } finally {
                 setIsUploadingImage(false);
             }
        }
    }, [item.id, onUpdateImage, isUploadingImage, isSavingEdit, disabled, setError, setIsUploadingImage, onEditChangeImageUrl]); // 添加 onEditChangeImageUrl 依赖

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // 必要，允许拖放
        event.stopPropagation();
    };


    return (
        <motion.li
            ref={setNodeRef}
            style={style}
            layoutId={`project-item-${item.id}`}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
            className={`flex items-start p-4 rounded-lg ${themeColors.devMutedBg} border ${themeColors.devBorder} relative ${isEditing ? 'ring-2 ring-indigo-500' : ''} ${disabled && !isEditing ? 'opacity-60' : ''}`} // 高亮编辑时，变暗禁用时
        >
            {/* 拖拽手柄（仅在未编辑时显示） */}
           {!isEditing && (
             <div {...attributes} {...listeners} className={`${themeColors.devDescText} mr-3 mt-1 cursor-grab touch-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} aria-label="Drag to reorder"><GripVertical size={18} /></div>
           )}
           {/* 移动手柄到编辑模式以防止重叠 */}
           {isEditing && <div className={`${themeColors.devDescText} mr-3 mt-1 opacity-50 cursor-not-allowed`}><GripVertical size={18} /></div>}


            {/* 图片区域（左侧） */}
            <div
                className={`w-24 h-24 md:w-32 md:h-32 mr-4 flex-shrink-0 ${themeColors.devCardBg} border ${themeColors.devBorder} rounded overflow-hidden flex items-center justify-center relative group ${isEditing ? 'cursor-pointer' : ''}`} // 编辑模式下可交互
                onDrop={isEditing ? handleImageDrop : undefined}
                onDragOver={isEditing ? handleDragOver : undefined}
                onPaste={isEditing ? handleImagePaste : undefined}
                tabIndex={isEditing ? 0 : -1} // 编辑模式下可聚焦用于粘贴
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
                {item.image_url && !isEditing ? ( // 未编辑时显示图片
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : isEditing && editingImageUrl ? ( // // 编辑模式下显示当前/编辑的图片 URL（也可以显示预览）
                     <img src={editingImageUrl} alt="Editing preview" className="w-full h-full object-cover" />
                ): ( // 没有图片时的占位符
                    <span className={`${themeColors.devDescText} text-xs`}>No Image</span>
                )}

            </div>


            {/* 主要内容区域（中心） */}
            <div className="flex-grow flex flex-col mr-4 space-y-1">
                {isEditing ? (
                    // 编辑状态：输入字段
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
                    // 显示状态：标题、描述、链接
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

            {/* 操作按钮（右侧） */}
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