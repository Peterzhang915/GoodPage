/**
 * 图片网格组件
 * 
 * 显示图片列表，分为可见和隐藏两个区域
 */

import React from 'react';
import { Loader2, Image } from 'lucide-react';
import type { PhotoGridProps } from '../types';
import { photoSortUtils } from '../utils';
import { isAlbumsView } from '../constants';
import PhotoCard from './PhotoCard';

/**
 * 图片网格组件
 */
const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  category,
  loading,
  onDelete,
  onToggleVisibility,
  onOrderChange,
  onUpdateMetadata
}) => {
  // 获取可见和隐藏的图片
  const visiblePhotos = photoSortUtils.getVisiblePhotos(photos, category);
  const hiddenPhotos = photoSortUtils.getHiddenPhotos(photos, category);
  
  // 判断是否为相册视图
  const albumsView = isAlbumsView(category);

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-green-400" size={32} />
      </div>
    );
  }

  // 空状态
  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Image size={48} className="mx-auto mb-4 opacity-50" />
        <p>No photos in this category yet</p>
        {!albumsView && (
          <p className="text-sm mt-2">Click the upload area above to add new photos</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 可见照片区域 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-300">
            {albumsView ? "Album Display Photos" : "Visible Photos"}
          </h3>
          <span className="text-sm text-gray-500">
            {visiblePhotos.length} photos
          </span>
        </div>
        
        {visiblePhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visiblePhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
                onOrderChange={onOrderChange}
                onUpdateMetadata={onUpdateMetadata}
                isAlbumsView={albumsView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No {albumsView ? "display" : "visible"} photos</p>
          </div>
        )}
      </div>

      {/* 隐藏照片区域 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-300">
            Hidden Photos
          </h3>
          <span className="text-sm text-gray-500">
            {hiddenPhotos.length} photos
          </span>
        </div>
        
        {hiddenPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hiddenPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
                onOrderChange={onOrderChange}
                onUpdateMetadata={onUpdateMetadata}
                isAlbumsView={albumsView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hidden photos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGrid;
