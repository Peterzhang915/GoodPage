/**
 * 图片操作相关 Hook
 * 
 * 管理图片的删除、可见性切换、顺序调整和元数据更新等操作
 */

import { useCallback } from 'react';
import type { GalleryImage, Category } from '../types';
import { photoApi } from '../services/photoApi';
import { isAlbumsView, CONFIRM_MESSAGES } from '../constants';

interface UsePhotoOperationsOptions {
  category: Category;
  onPhotoUpdate?: (photo: GalleryImage) => void;
  onPhotoRemove?: (photoId: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  onRefresh?: () => void;
}

/**
 * 图片操作 Hook
 */
export function usePhotoOperations({
  category,
  onPhotoUpdate,
  onPhotoRemove,
  onError,
  onSuccess,
  onRefresh
}: UsePhotoOperationsOptions) {
  
  /**
   * 删除图片
   */
  const deletePhoto = useCallback(async (photo: GalleryImage) => {
    // 确认删除
    if (!window.confirm(CONFIRM_MESSAGES.DELETE_PHOTO)) {
      return;
    }

    try {
      await photoApi.deletePhoto(photo.id);
      onPhotoRemove?.(photo.id);
      onSuccess?.('Photo deleted successfully');
    } catch (error) {
      console.error('Failed to delete photo:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to delete photo');
    }
  }, [onPhotoRemove, onError, onSuccess]);

  /**
   * 切换图片可见性
   */
  const togglePhotoVisibility = useCallback(async (photo: GalleryImage) => {
    try {
      const albumsView = isAlbumsView(category);
      await photoApi.toggleVisibility(photo, albumsView);

      // 刷新整个列表以获取正确的排序
      onRefresh?.();

      const action = albumsView
        ? (!photo.show_in_albums ? 'added to album' : 'removed from album')
        : (!photo.is_visible ? 'shown' : 'hidden');

      onSuccess?.(`Photo ${action} successfully`);
    } catch (error) {
      console.error('Failed to toggle photo visibility:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to update visibility');
    }
  }, [category, onRefresh, onError, onSuccess]);

  /**
   * 更新图片顺序
   */
  const updatePhotoOrder = useCallback(async (photo: GalleryImage, newOrder: number) => {
    try {
      const albumsView = isAlbumsView(category);
      const currentOrder = albumsView ? photo.albums_order : photo.display_order;

      // 如果顺序没有变化，直接返回
      if (currentOrder === newOrder) {
        return;
      }

      // 检查边界条件
      if (newOrder < 0) {
        return;
      }

      await photoApi.updateOrder(photo, newOrder, albumsView);

      // 刷新整个列表以获取正确的排序
      onRefresh?.();
      onSuccess?.('Photo order updated successfully');
    } catch (error) {
      console.error('Failed to update photo order:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to update order');
    }
  }, [category, onRefresh, onError, onSuccess]);

  /**
   * 更新图片元数据（标题和日期）
   */
  const updatePhotoMetadata = useCallback(async (
    photo: GalleryImage,
    caption: string | null,
    date: string | null
  ) => {
    try {
      await photoApi.updateMetadata(photo, caption, date);

      // 刷新整个列表以确保正确的排序（特别是日期更改时）
      onRefresh?.();
      onSuccess?.('Photo information updated successfully');
    } catch (error) {
      console.error('Failed to update photo metadata:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to update photo information');
    }
  }, [onRefresh, onError, onSuccess]);

  /**
   * 向上移动图片
   */
  const movePhotoUp = useCallback((photo: GalleryImage) => {
    const albumsView = isAlbumsView(category);
    const currentOrder = albumsView ? photo.albums_order : photo.display_order;
    updatePhotoOrder(photo, currentOrder - 1);
  }, [category, updatePhotoOrder]);

  /**
   * 向下移动图片
   */
  const movePhotoDown = useCallback((photo: GalleryImage) => {
    const albumsView = isAlbumsView(category);
    const currentOrder = albumsView ? photo.albums_order : photo.display_order;
    updatePhotoOrder(photo, currentOrder + 1);
  }, [category, updatePhotoOrder]);

  /**
   * 批量更新图片顺序
   */
  const batchUpdateOrder = useCallback(async (photos: GalleryImage[]) => {
    try {
      const albumsView = isAlbumsView(category);
      await photoApi.batchUpdateOrder(photos, albumsView);
      onSuccess?.('Batch order update successful');
    } catch (error) {
      console.error('Failed to batch update photo order:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to batch update order');
    }
  }, [category, onError, onSuccess]);

  /**
   * 检查图片是否可以向上移动
   */
  const canMoveUp = useCallback((photo: GalleryImage) => {
    const albumsView = isAlbumsView(category);
    const currentOrder = albumsView ? photo.albums_order : photo.display_order;
    return currentOrder > 0;
  }, [category]);

  /**
   * 检查图片是否可以向下移动
   */
  const canMoveDown = useCallback((photo: GalleryImage, totalCount: number) => {
    const albumsView = isAlbumsView(category);
    const currentOrder = albumsView ? photo.albums_order : photo.display_order;
    return currentOrder < totalCount - 1;
  }, [category]);

  /**
   * 获取图片的可见性状态
   */
  const getPhotoVisibility = useCallback((photo: GalleryImage) => {
    const albumsView = isAlbumsView(category);
    return albumsView ? photo.show_in_albums : photo.is_visible;
  }, [category]);

  /**
   * 获取图片的顺序值
   */
  const getPhotoOrder = useCallback((photo: GalleryImage) => {
    const albumsView = isAlbumsView(category);
    return albumsView ? photo.albums_order : photo.display_order;
  }, [category]);

  return {
    // 基本操作
    deletePhoto,
    togglePhotoVisibility,
    updatePhotoOrder,
    updatePhotoMetadata,
    
    // 便捷操作
    movePhotoUp,
    movePhotoDown,
    batchUpdateOrder,
    
    // 状态检查
    canMoveUp,
    canMoveDown,
    getPhotoVisibility,
    getPhotoOrder,
    
    // 常量
    isAlbumsView: isAlbumsView(category)
  };
}
