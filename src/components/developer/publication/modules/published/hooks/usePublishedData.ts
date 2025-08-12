import { useState, useCallback } from "react";
import { PublicationWithAuthors } from "@/app/api/publications/route";

/**
 * 已发布出版物数据管理Hook
 * 负责管理出版物数据状态和基本操作
 */
export const usePublishedData = () => {
  // 数据状态
  const [publications, setPublications] = useState<PublicationWithAuthors[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 操作状态
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 设置加载状态
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // 设置错误状态
  const setErrorState = useCallback((error: string | null) => {
    setError(error);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 添加出版物
  const addPublication = useCallback((publication: PublicationWithAuthors) => {
    setPublications((prev) => [...prev, publication]);
  }, []);

  // 更新出版物
  const updatePublication = useCallback(
    (id: number, updatedPublication: PublicationWithAuthors) => {
      setPublications((prev) =>
        prev.map((pub) => (pub.id === id ? updatedPublication : pub))
      );
    },
    []
  );

  // 删除出版物
  const removePublication = useCallback((id: number) => {
    setPublications((prev) => prev.filter((pub) => pub.id !== id));
  }, []);

  // 设置删除状态
  const setDeletingState = useCallback((id: number, isDeleting: boolean) => {
    setDeletingIds((prev) => {
      const newSet = new Set(prev);
      if (isDeleting) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  // 设置提交状态
  const setSubmittingState = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // 重置所有状态
  const resetStates = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setDeletingIds(new Set());
    setIsSubmitting(false);
  }, []);

  return {
    // 数据状态
    publications,
    isLoading,
    error,
    deletingIds,
    isSubmitting,

    // 状态设置方法
    setPublications,
    setLoadingState,
    setErrorState,
    clearError,
    setDeletingState,
    setSubmittingState,
    resetStates,

    // 数据操作方法
    addPublication,
    updatePublication,
    removePublication,
  };
};
