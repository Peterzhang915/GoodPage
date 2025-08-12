import { useState, useCallback } from "react";
import { PublicationWithAuthors } from "@/app/api/publications/route";

/**
 * 待审核出版物数据管理Hook
 * 负责状态管理和数据存储
 */
export const usePendingData = () => {
  const [publications, setPublications] = useState<PublicationWithAuthors[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  // 设置加载状态
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // 设置错误状态
  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 设置出版物数据
  const setPublicationsData = useCallback(
    (publications: PublicationWithAuthors[]) => {
      setPublications(publications);
    },
    []
  );

  // 添加处理中的ID
  const addProcessingId = useCallback((id: number) => {
    setProcessingIds((prev) => new Set([...prev, id]));
  }, []);

  // 移除处理中的ID
  const removeProcessingId = useCallback((id: number) => {
    setProcessingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // 设置提交状态
  const setSubmittingState = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // 设置清除状态
  const setClearingState = useCallback((clearing: boolean) => {
    setIsClearing(clearing);
  }, []);

  // 更新单个出版物
  const updatePublication = useCallback(
    (id: number, updatedPublication: PublicationWithAuthors) => {
      setPublications((prev) =>
        prev.map((pub) => (pub.id === id ? updatedPublication : pub))
      );
    },
    []
  );

  // 移除出版物
  const removePublication = useCallback((id: number) => {
    setPublications((prev) => prev.filter((pub) => pub.id !== id));
  }, []);

  // 添加出版物
  const addPublication = useCallback(
    (newPublication: PublicationWithAuthors) => {
      setPublications((prev) => [newPublication, ...prev]);
    },
    []
  );

  return {
    // 状态数据
    publications,
    isLoading,
    error,
    processingIds,
    isSubmitting,
    isClearing,

    // 状态更新方法
    setLoadingState,
    setErrorState,
    clearError,
    setPublications: setPublicationsData,
    addProcessingId,
    removeProcessingId,
    setSubmittingState,
    setClearingState,
    updatePublication,
    removePublication,
    addPublication,
  };
};
