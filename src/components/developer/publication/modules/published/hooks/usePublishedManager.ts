import { useEffect } from "react";
import { usePublishedData } from "./usePublishedData";
import { usePublishedActions } from "./usePublishedActions";

/**
 * 已发布出版物管理器Hook
 * 组合数据管理和操作逻辑，提供完整的管理功能
 */
export const usePublishedManager = () => {
  // 获取数据状态
  const {
    publications,
    isLoading,
    error,
    deletingIds,
    isSubmitting,
    setPublications,
    setLoadingState,
    setErrorState,
    clearError,
    addPublication,
    updatePublication: updatePublicationState,
    removePublication,
    setDeletingState,
    setSubmittingState,
  } = usePublishedData();

  // 获取操作方法
  const {
    fetchPublications,
    createPublication,
    updatePublication,
    deletePublication,
  } = usePublishedActions(
    setLoadingState,
    setErrorState,
    clearError,
    setPublications,
    addPublication,
    updatePublicationState,
    removePublication,
    setDeletingState,
    setSubmittingState
  );

  // 初始化时获取数据
  useEffect(() => {
    fetchPublications();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 刷新数据
  const refreshPublications = () => {
    fetchPublications();
  };

  return {
    // 数据状态
    publications,
    isLoading,
    error,
    deletingIds,
    isSubmitting,

    // 操作方法
    fetchPublications,
    refreshPublications,
    createPublication,
    updatePublication,
    deletePublication,
    clearError,
  };
};
