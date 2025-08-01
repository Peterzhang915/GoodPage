import { useCallback } from "react";
import { toast } from "sonner";
import { PublicationWithAuthors } from "@/app/api/publications/route";
import { publishedApi } from "../services/publishedApi";

/**
 * 已发布出版物操作逻辑Hook
 * 负责处理CRUD操作和业务逻辑
 */
export const usePublishedActions = (
  setLoadingState: (loading: boolean) => void,
  setErrorState: (error: string | null) => void,
  clearError: () => void,
  setPublications: (publications: PublicationWithAuthors[]) => void,
  addPublication: (publication: PublicationWithAuthors) => void,
  updatePublication: (id: number, publication: PublicationWithAuthors) => void,
  removePublication: (id: number) => void,
  setDeletingState: (id: number, isDeleting: boolean) => void,
  setSubmittingState: (submitting: boolean) => void,
) => {

  // 获取所有已发布出版物
  const fetchPublications = useCallback(async () => {
    setLoadingState(true);
    clearError();

    try {
      const publications = await publishedApi.fetchAll();
      setPublications(publications);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setErrorState(`Failed to load publications: ${errorMessage}`);
      toast.error("Failed to load publications");
    } finally {
      setLoadingState(false);
    }
  }, [setLoadingState, clearError, setPublications, setErrorState]);

  // 创建新出版物
  const createPublication = useCallback(async (data: any) => {
    setSubmittingState(true);
    clearError();
    
    try {
      const newPublication = await publishedApi.create(data);
      addPublication(newPublication);
      toast.success("Publication created successfully");
      return newPublication;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setErrorState(`Failed to create publication: ${errorMessage}`);
      toast.error("Failed to create publication");
      throw error;
    } finally {
      setSubmittingState(false);
    }
  }, [setSubmittingState, clearError, addPublication, setErrorState]);

  // 更新出版物
  const updatePublicationData = useCallback(async (id: number, data: any) => {
    setSubmittingState(true);
    clearError();
    
    try {
      const updatedPublication = await publishedApi.update(id, data);
      updatePublication(id, updatedPublication);
      toast.success("Publication updated successfully");
      return updatedPublication;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setErrorState(`Failed to update publication: ${errorMessage}`);
      toast.error("Failed to update publication");
      throw error;
    } finally {
      setSubmittingState(false);
    }
  }, [setSubmittingState, clearError, updatePublication, setErrorState]);

  // 删除出版物
  const deletePublication = useCallback(async (id: number) => {
    // 确认删除
    if (!window.confirm("Are you sure you want to delete this publication? This action cannot be undone.")) {
      return;
    }

    setDeletingState(id, true);
    clearError();
    
    try {
      await publishedApi.delete(id);
      removePublication(id);
      toast.success("Publication deleted successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setErrorState(`Failed to delete publication: ${errorMessage}`);
      toast.error("Failed to delete publication");
    } finally {
      setDeletingState(id, false);
    }
  }, [setDeletingState, clearError, removePublication, setErrorState]);

  return {
    fetchPublications,
    createPublication,
    updatePublication: updatePublicationData,
    deletePublication,
  };
};
