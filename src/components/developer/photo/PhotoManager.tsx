/**
 * 重构后的相册管理组件
 * 
 * 简化的主组件，只负责组合和布局
 */

"use client";

import React from 'react';
import { Image, Info } from 'lucide-react';
import type { PhotoManagerProps } from './types';
import { usePhotoManager } from './hooks/usePhotoManager';
import { usePhotoOperations } from './hooks/usePhotoOperations';
import { isAlbumsView } from './constants';

// 导入子组件
import CategorySelector from './components/CategorySelector';
import UploadArea from './components/UploadArea';
import PhotoGrid from './components/PhotoGrid';

/**
 * 相册管理主组件（重构版）
 */
const PhotoManager: React.FC<PhotoManagerProps> = ({ onClose }) => {
  // 使用主要业务逻辑 hook
  const {
    category,
    photos,
    loading,
    error,
    setCategory,
    setError,
    refreshPhotos,
    updateLocalPhoto,
    removeLocalPhoto
  } = usePhotoManager();

  // 使用图片操作 hook
  const {
    deletePhoto,
    togglePhotoVisibility,
    updatePhotoOrder,
    updatePhotoMetadata
  } = usePhotoOperations({
    category,
    onPhotoUpdate: updateLocalPhoto,
    onPhotoRemove: removeLocalPhoto,
    onError: setError,
    onSuccess: (message) => {
      console.log('Success:', message);
      // 可以在这里添加成功提示
    },
    onRefresh: refreshPhotos
  });

  /**
   * 处理上传完成
   */
  const handleUploadComplete = () => {
    refreshPhotos();
  };

  /**
   * 获取页面描述信息
   */
  const getPageDescription = () => {
    return isAlbumsView(category)
      ? "Manage the photos displayed in the album homepage, which does not affect the display status of each category"
      : "Manage photos in the laboratory album, control visibility and sorting";
  };

  return (
    <div className="min-h-[600px] bg-gray-900 rounded-lg p-6">
      {/* 页眉 */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
          <Image size={24} />
          Photo Gallery Manager
        </h2>
        <div className="text-sm text-gray-400">
          <Info size={16} className="inline mr-1" />
          {getPageDescription()}
        </div>
      </div>

      {/* 分类选择器 */}
      <CategorySelector
        value={category}
        onChange={setCategory}
      />

      {/* 上传区域 */}
      <UploadArea
        category={category}
        onUploadComplete={handleUploadComplete}
        onError={setError}
      />

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          <p className="flex items-center">
            <Info size={16} className="mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* 图片网格 */}
      <PhotoGrid
        photos={photos}
        category={category}
        loading={loading}
        onDelete={deletePhoto}
        onToggleVisibility={togglePhotoVisibility}
        onOrderChange={updatePhotoOrder}
        onUpdateMetadata={updatePhotoMetadata}
      />
    </div>
  );
};

export default PhotoManager;
