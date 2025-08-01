import { useEffect } from "react";
import { usePendingData } from "./usePendingData";
import { usePendingActions } from "./usePendingActions";

/**
 * 待审核出版物管理器Hook
 * 组合数据管理和操作逻辑，提供完整的管理功能
 */
export const usePendingManager = () => {
  // 获取数据状态
  const {
    publications,
    isLoading,
    error,
    processingIds,
    isSubmitting,
    clearError,
    setLoadingState,
    setErrorState,
    setPublications,
    addProcessingId,
    removeProcessingId,
    setSubmittingState,
    updatePublication,
    removePublication,
    addPublication,
  } = usePendingData();

  // 获取操作方法
  const {
    fetchPublications,
    approvePublication,
    rejectPublication,
    updatePendingPublication,
    createPublication,
  } = usePendingActions(
    setLoadingState,
    setErrorState,
    clearError,
    setPublications,
    addProcessingId,
    removeProcessingId,
    setSubmittingState,
    updatePublication,
    removePublication,
    addPublication,
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
    processingIds,
    isSubmitting,
    
    // 操作方法
    fetchPublications,
    refreshPublications,
    approvePublication,
    rejectPublication,
    updatePendingPublication,
    createPublication,
    clearError,
  };
};
