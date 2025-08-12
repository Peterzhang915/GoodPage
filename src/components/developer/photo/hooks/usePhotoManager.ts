/**
 * 相册管理主要业务逻辑 Hook
 *
 * 管理图片列表的加载、状态和基本操作
 */

import { useState, useEffect, useCallback } from "react";
import type { GalleryImage, Category, PhotoManagerState } from "../types";
import { photoApi } from "../services/photoApi";
import { photoSortUtils } from "../utils";
import { VALID_CATEGORIES } from "../constants";

/**
 * 相册管理主 Hook
 */
export function usePhotoManager() {
  // 状态管理
  const [state, setState] = useState<PhotoManagerState>({
    category: "Albums",
    photos: [],
    loading: false,
    error: null,
  });

  /**
   * 设置错误信息
   */
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  /**
   * 设置加载状态
   */
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  /**
   * 设置当前分类
   */
  const setCategory = useCallback((category: Category) => {
    setState((prev) => ({ ...prev, category }));
  }, []);

  /**
   * 加载图片列表
   */
  const loadPhotos = useCallback(
    async (category: Category) => {
      setLoading(true);
      setError(null);

      try {
        const photos = await photoApi.getPhotos(category, true);

        // 过滤分类图片（非 Albums 视图时）
        let filteredPhotos = photos;
        if (category !== "Albums") {
          filteredPhotos = photos.filter(
            (photo) => photo.category === category
          );
        }

        const sortedPhotos = photoSortUtils.sortPhotos(
          filteredPhotos,
          category
        );

        setState((prev) => ({
          ...prev,
          photos: sortedPhotos,
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to load photos:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load photos"
        );
        setState((prev) => ({
          ...prev,
          photos: [],
          loading: false,
        }));
      }
    },
    [setLoading, setError]
  );

  /**
   * 刷新当前分类的图片列表
   */
  const refreshPhotos = useCallback(() => {
    loadPhotos(state.category);
  }, [loadPhotos, state.category]);

  /**
   * 更新本地图片状态
   */
  const updateLocalPhoto = useCallback((updatedPhoto: GalleryImage) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === updatedPhoto.id ? updatedPhoto : photo
      ),
    }));
  }, []);

  /**
   * 从本地状态中移除图片
   */
  const removeLocalPhoto = useCallback((photoId: string) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo.id !== photoId),
    }));
  }, []);

  /**
   * 添加新图片到本地状态
   */
  const addLocalPhoto = useCallback((newPhoto: GalleryImage) => {
    setState((prev) => {
      const updatedPhotos = [...prev.photos, newPhoto];
      const sortedPhotos = photoSortUtils.sortPhotos(
        updatedPhotos,
        prev.category
      );
      return {
        ...prev,
        photos: sortedPhotos,
      };
    });
  }, []);

  /**
   * 获取可见图片列表
   */
  const visiblePhotos = photoSortUtils.getVisiblePhotos(
    state.photos,
    state.category
  );

  /**
   * 获取隐藏图片列表
   */
  const hiddenPhotos = photoSortUtils.getHiddenPhotos(
    state.photos,
    state.category
  );

  /**
   * 当分类改变时重新加载图片
   */
  useEffect(() => {
    loadPhotos(state.category);
  }, [state.category, loadPhotos]);

  return {
    // 状态
    category: state.category,
    photos: state.photos,
    loading: state.loading,
    error: state.error,
    visiblePhotos,
    hiddenPhotos,

    // 操作方法
    setCategory,
    setError,
    loadPhotos,
    refreshPhotos,
    updateLocalPhoto,
    removeLocalPhoto,
    addLocalPhoto,

    // 常量
    validCategories: VALID_CATEGORIES,
  };
}
