"use client";

/**
 * 实验室相册管理面板组件
 * 
 * 功能：
 * 1. 按分类管理图片
 * 2. 上传新图片
 * 3. 编辑图片信息（标题、日期）
 * 4. 控制图片显示/隐藏
 * 5. 调整图片顺序
 * 6. 删除图片
 * 
 * 特点：
 * 1. 支持拖拽上传
 * 2. 实时预览
 * 3. 批量操作
 * 4. 错误处理和状态反馈
 */

import React, { useState, useEffect, useRef } from "react";
import { Image, Trash2, Loader2, Plus, Eye, EyeOff, Upload, Calendar, Type, Info, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 图片数据类型定义
 * 对应后端 GalleryPhoto 模型
 */
interface GalleryImage {
  id: string;           // 图片ID
  src: string;          // 图片URL
  alt: string;          // 替代文本
  category: string;     // 分类
  caption: string | null;    // 标题
  date: string | null;       // 日期
  is_visible: boolean;       // 分类中是否可见
  show_in_albums: boolean;   // 是否在首页相册显示
  display_order: number;     // 分类中的显示顺序
  albums_order: number;      // 首页相册中的显示顺序
}

/**
 * 组件属性定义
 */
interface PhotoManagerProps {
  onClose: () => void;  // 关闭管理面板的回调
}

/**
 * 图片卡片组件属性定义
 */
interface PhotoCardProps {
  photo: GalleryImage;  // 图片数据
  onDelete: (photo: GalleryImage) => void;  // 删除回调
  onToggleVisibility: (photo: GalleryImage) => void;  // 切换可见性回调
  onOrderChange: (photo: GalleryImage, newOrder: number) => void;  // 更改顺序回调
  onUpdateMetadata: (photo: GalleryImage, caption: string | null, date: string | null) => void;  // 更新元数据回调
  isAlbumsView?: boolean;  // 是否为相册视图
}

/**
 * 支持的图片分类列表
 * 注意：与前端展示页面保持一致
 */
const VALID_CATEGORIES = [
  "Albums",        // 首页相册
  "Meetings",      // 会议照片
  "Graduation",    // 毕业照片
  "Team Building", // 团建活动
  "Sports",        // 运动照片
  "Lab Life",      // 实验室生活
  "Competition"    // 比赛照片
] as const;

// 分类类型定义
type Category = (typeof VALID_CATEGORIES)[number];

/**
 * 判断是否为相册视图
 * @param cat 分类名称
 * @returns 是否为相册视图
 */
const isAlbumsView = (cat: Category) => cat === "Albums";

/**
 * 相册管理面板主组件
 */
const PhotoManager: React.FC<PhotoManagerProps> = ({ onClose }) => {
  // === 状态管理 ===

  // 视图控制
  const [category, setCategory] = useState<Category>("Albums");  // 当前选中的分类
  const [photos, setPhotos] = useState<GalleryImage[]>([]);     // 图片列表
  const [loading, setLoading] = useState(false);                 // 加载状态
  const [error, setError] = useState<string | null>(null);       // 错误信息

  // 上传控制
  const [uploading, setUploading] = useState(false);            // 上传状态
  const [file, setFile] = useState<File | null>(null);          // 待上传文件
  const [caption, setCaption] = useState("");                    // 图片标题
  const [date, setDate] = useState("");                         // 拍摄日期
  
  // 拖拽上传
  const fileInputRef = useRef<HTMLInputElement>(null);          // 文件输入引用
  const [isDragging, setIsDragging] = useState(false);          // 拖拽状态

  // === 数据加载 ===

  /**
   * 加载图片列表
   * 包括不可见的图片，用于管理
   */
  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      setError(null);
      try {
        // 获取所有图片，包括隐藏的
        const res = await fetch(`/api/gallery/photos?category=${category}&include_hidden=true`);
        const data = await res.json();
        if (data.success) {
          let sortedPhotos = data.data;
          // 按可见性和顺序排序
          sortedPhotos.sort((a: GalleryImage, b: GalleryImage) => {
            if (category === "Albums") {
              // 相册视图：先按是否显示，再按相册顺序
              if (a.show_in_albums !== b.show_in_albums) {
                return a.show_in_albums ? -1 : 1;
              }
              return a.albums_order - b.albums_order;
            } else {
              // 分类视图：先按是否可见，再按显示顺序
              if (a.is_visible !== b.is_visible) {
                return a.is_visible ? -1 : 1;
              }
              return a.display_order - b.display_order;
            }
          });
          setPhotos(sortedPhotos);
        } else {
          setPhotos([]);
        }
      } catch {
        setPhotos([]);
      }
      setLoading(false);
    }
    fetchPhotos();
  }, [category]);

  // === 图片操作处理 ===

  /**
   * 处理图片上传
   * 1. 验证文件和分类
   * 2. 上传文件和元数据
   * 3. 刷新图片列表
   */
  async function handleUpload() {
    if (!file || isAlbumsView(category)) return;
    setUploading(true);
    setError(null);

    try {
      // 准备上传数据
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (caption) formData.append("caption", caption);
      if (date) formData.append("date", date);

      // 上传文件
      const res = await fetch("/api/gallery/photos", { 
        method: "POST", 
        body: formData 
      });

      const data = await res.json();

      if (data.success) {
        // 重新获取图片列表
        const res2 = await fetch(`/api/gallery/photos?category=${category}&include_hidden=true`);
        const data2 = await res2.json();
        
        if (data2.success) {
          let filteredPhotos = data2.data;
          // 过滤当前分类的图片
          if (!isAlbumsView(category)) {
            filteredPhotos = data2.data.filter((img: GalleryImage) => img.category === category);
          }
          // 排序
          filteredPhotos.sort((a: GalleryImage, b: GalleryImage) => {
            if (a.is_visible !== b.is_visible) {
              return a.is_visible ? -1 : 1;
            }
            return a.display_order - b.display_order;
          });
          setPhotos(filteredPhotos);
        }

        // 重置表单
        setFile(null);
        setCaption("");
        setDate("");
      } else {
        setError(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  /**
   * 处理图片删除
   * 1. 确认删除
   * 2. 调用删除 API
   * 3. 更新本地状态
   */
  async function handleDelete(photo: GalleryImage) {
    if (!window.confirm("Delete this photo?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/gallery/photos?id=${photo.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      } else {
        setError(data.error?.message || "Delete failed");
      }
    } catch {
      setError("Delete failed");
    }
  }

  /**
   * 处理图片可见性切换
   * 根据视图类型切换不同的可见性字段
   */
  async function handleToggleVisibility(photo: GalleryImage) {
    try {
      const albumsView = isAlbumsView(category);
      // 根据视图类型构建更新数据
      const patchData = albumsView
        ? { id: photo.id, show_in_albums: !photo.show_in_albums }
        : { id: photo.id, is_visible: !photo.is_visible };
      const res = await fetch(`/api/gallery/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData)
      });
      const data = await res.json();
      if (data.success) {
        // 更新本地状态
        setPhotos(prev => {
          const updated = prev.map(p =>
            p.id === photo.id
              ? {
                  ...p,
                  ...(albumsView
                    ? { show_in_albums: !p.show_in_albums }
                    : { is_visible: !p.is_visible })
                }
              : p
          );
          return updated;
        });
      } else {
        setError(data.error?.message || "Update failed");
      }
    } catch {
      setError("Update failed");
    }
  }

  /**
   * 处理图片顺序更改
   * 1. 更新数据库
   * 2. 重新获取并排序图片列表
   */
  async function handleOrderChange(photo: GalleryImage, newOrder: number) {
    try {
      const isAlbumsView = category === "Albums";
      // 更新顺序
      const res = await fetch(`/api/gallery/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: photo.id,
          [isAlbumsView ? "albums_order" : "display_order"]: newOrder
        })
      });
      const data = await res.json();
      if (data.success) {
        // 重新获取图片列表
        const res2 = await fetch(`/api/gallery/photos?category=${category}&include_hidden=true`);
        const data2 = await res2.json();
        if (data2.success) {
          let filteredPhotos = data2.data;
          // 过滤当前分类
          if (category !== "Albums") {
            filteredPhotos = data2.data.filter((img: GalleryImage) => img.category === category);
          }
          // 排序
          filteredPhotos.sort((a: GalleryImage, b: GalleryImage) => {
            if (isAlbumsView) {
              if (a.show_in_albums !== b.show_in_albums) {
                return a.show_in_albums ? -1 : 1;
              }
              return a.albums_order - b.albums_order;
            } else {
              if (a.is_visible !== b.is_visible) {
                return a.is_visible ? -1 : 1;
              }
              return a.display_order - b.display_order;
            }
          });
          setPhotos(filteredPhotos);
        }
      } else {
        setError(data.error?.message || "Update failed");
      }
    } catch {
      setError("Update failed");
    }
  }

  /**
   * 处理图片元数据更新
   * 1. 调用 API 更新
   * 2. 更新本地状态
   */
  async function handleUpdateMetadata(photo: GalleryImage, caption: string | null, date: string | null) {
    try {
      const res = await fetch(`/api/gallery/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: photo.id,
          caption,
          date
        })
      });
      const data = await res.json();
      if (data.success) {
        // 更新本地状态
        setPhotos(prev => prev.map(p => 
          p.id === photo.id ? { ...p, caption, date } : p
        ));
      } else {
        setError(data.error?.message || "Update failed");
      }
    } catch (error) {
      console.error('Failed to update photo metadata:', error);
      setError("Update failed. Please try again.");
    }
  }

  // 处理文件拖放
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  // 触发文件选择
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-[600px] bg-gray-900 rounded-lg p-6">
      {/* 页眉 */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
          <Image size={24} /> Photo Gallery Manager
        </h2>
        <div className="text-sm text-gray-400">
          <Info size={16} className="inline mr-1" />
          {isAlbumsView(category) ? (
            "Manage the photos displayed in the album homepage, which does not affect the display status of each category"
          ) : (
            "Manage photos in the laboratory album, control visibility and sorting"
          )}
        </div>
      </div>

      {/* 分类选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select album category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
        >
          {VALID_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 上传区域 - 仅在非主页管理时显示 */}
      {!isAlbumsView(category) && (
        <div className="mb-8 space-y-4">
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-green-500 hover:bg-gray-750"
            onClick={handleClickUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              borderColor: isDragging ? '#22c55e' : undefined,
              backgroundColor: isDragging ? 'rgba(34, 197, 94, 0.1)' : undefined
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <Upload size={32} className="mx-auto mb-2 text-gray-400" />
            <div className="text-gray-300 mb-1">
              {file ? (
                <span className="text-green-400">{file.name}</span>
              ) : (
                <>
                  <span className="text-green-400">Click to upload</span> or drag and drop images here
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, WEBP formats, up to 10MB
            </p>
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Type size={16} className="mr-1" />
                    Image Caption
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2024 Graduation Photo"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Add a caption to display below the image
                  </p>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Calendar size={16} className="mr-1" />
                    Photo Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2024.06.10"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Used for photo sorting and display, recommend YYYY.MM.DD format
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setFile(null)}
                  className="mr-3 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Start Upload
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          <p className="flex items-center">
            <Info size={16} className="mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* 图片列表 */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-green-400" size={32} />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Image size={48} className="mx-auto mb-4 opacity-50" />
            <p>No photos in this category yet</p>
            {category !== "Albums" && (
              <p className="text-sm mt-2">Click the upload area above to add new photos</p>
            )}
          </div>
        ) : (
          <>
            {/* 可见照片区域 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-300">
                  {category === "Albums" ? "Album Display Photos" : "Visible Photos"}
                </h3>
                <span className="text-sm text-gray-500">
                  {category === "Albums"
                    ? photos.filter(p => p.show_in_albums).length
                    : photos.filter(p => p.is_visible).length} photos
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category === "Albums"
                  ? photos.filter(photo => photo.show_in_albums).map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                        onOrderChange={handleOrderChange}
                        onUpdateMetadata={handleUpdateMetadata}
                        isAlbumsView={true}
                      />
                    ))
                  : photos.filter(photo => photo.is_visible).map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                        onOrderChange={handleOrderChange}
                        onUpdateMetadata={handleUpdateMetadata}
                        isAlbumsView={false}
                      />
                    ))}
              </div>
            </div>

            {/* 隐藏照片区域 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-300">
                  {category === "Albums" ? "Hidden Photos" : "Hidden Photos"}
                </h3>
                <span className="text-sm text-gray-500">
                  {category === "Albums"
                    ? photos.filter(p => !p.show_in_albums).length
                    : photos.filter(p => !p.is_visible).length} photos
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {category === "Albums"
                  ? photos.filter(photo => !photo.show_in_albums).map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                        onOrderChange={handleOrderChange}
                        onUpdateMetadata={handleUpdateMetadata}
                        isAlbumsView={true}
                      />
                    ))
                  : photos.filter(photo => !photo.is_visible).map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                        onOrderChange={handleOrderChange}
                        onUpdateMetadata={handleUpdateMetadata}
                        isAlbumsView={false}
                      />
                    ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 图片卡片组件
const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onDelete,
  onToggleVisibility,
  onOrderChange,
  onUpdateMetadata,
  isAlbumsView = false
}) => {
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(photo.caption || '');
  const [editDate, setEditDate] = useState(photo.date || '');
  const [isComposing, setIsComposing] = useState(false);

  // 保证每次进入编辑时都同步 caption
  React.useEffect(() => {
    if (isEditing) {
      setEditCaption(photo.caption || '');
      setEditDate(photo.date || '');
    }
  }, [isEditing, photo.caption, photo.date]);

  const handleSave = () => {
    onUpdateMetadata(photo, editCaption || null, editDate || null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditCaption(photo.caption || '');
    setEditDate(photo.date || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      className={`relative group border rounded-lg overflow-hidden ${
        isAlbumsView
          ? photo.show_in_albums ? "border-green-500" : "border-gray-700"
          : photo.is_visible ? "border-gray-700" : "border-red-700 opacity-50"
      }`}
      layout
      // 鼠标活动不再影响编辑状态
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <img
        src={photo.src}
        alt={photo.alt || "photo"}
        className="w-full h-40 object-cover"
      />
      <AnimatePresence>
        {(showControls || isEditing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-2"
          >
            {/* 顶部控制 */}
            <div className="flex justify-end gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition-colors"
                    title="Edit information"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onToggleVisibility(photo)}
                    className="bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition-colors"
                    title={
                      isAlbumsView
                        ? photo.show_in_albums
                          ? "Remove from album"
                          : "Add to album"
                        : photo.is_visible
                        ? "Hide in category"
                        : "Show in category"
                    }
                  >
                    {isAlbumsView ? (
                      photo.show_in_albums ? <EyeOff size={16} /> : <Eye size={16} />
                    ) : (
                      photo.is_visible ? <EyeOff size={16} /> : <Eye size={16} />
                    )}
                  </button>
                  {!isAlbumsView && (
                    <button
                      onClick={() => onDelete(photo)}
                      className="bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* 底部信息和控制 */}
            <div className="space-y-2">
              {/* 排序控制 */}
              {!isEditing && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onOrderChange(photo, isAlbumsView ? photo.albums_order - 1 : photo.display_order - 1)}
                    className="bg-black bg-opacity-60 rounded px-3 py-1 text-white text-sm hover:bg-opacity-80 transition-colors disabled:opacity-50"
                    disabled={isAlbumsView ? photo.albums_order <= 0 : photo.display_order <= 0}
                  >
                    Move Up
                  </button>
                  <button
                    onClick={() => onOrderChange(photo, isAlbumsView ? photo.albums_order + 1 : photo.display_order + 1)}
                    className="bg-black bg-opacity-60 rounded px-3 py-1 text-white text-sm hover:bg-opacity-80 transition-colors"
                  >
                    Move Down
                  </button>
                </div>
              )}

              {/* 图片信息 */}
              {isEditing ? (
                <div className="bg-black bg-opacity-80 rounded p-2 space-y-2">
                  <div>
                    <input
                      key={photo.id + (isEditing ? '-editing' : '-view')}
                      type="text"
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      placeholder="Image Caption"
                      className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      placeholder="Photo Date (YYYY.MM.DD)"
                      className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-700 rounded px-2 py-1 text-white text-sm hover:bg-gray-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 rounded px-2 py-1 text-white text-sm hover:bg-green-500 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                (photo.caption || photo.date) && (
                  <div className="bg-black bg-opacity-60 rounded p-2 text-xs">
                    {photo.caption && (
                      <div className="text-white truncate">{photo.caption}</div>
                    )}
                    {photo.date && (
                      <div className="text-gray-300 text-xs">{photo.date}</div>
                    )}
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhotoManager;
