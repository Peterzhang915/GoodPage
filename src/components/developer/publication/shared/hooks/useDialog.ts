import { useState, useCallback } from "react";
import { PublicationWithAuthors } from "@/app/api/publications/route";

/**
 * 对话框状态管理Hook
 * 负责管理表单对话框的开关和编辑状态
 */
export const useDialog = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PublicationWithAuthors | null>(null);

  // 打开添加对话框
  const openAddDialog = useCallback(() => {
    setEditingItem(null);
    setIsOpen(true);
  }, []);

  // 打开编辑对话框
  const openEditDialog = useCallback((item: PublicationWithAuthors) => {
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  // 关闭对话框
  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
  }, []);

  // 是否为编辑模式
  const isEditMode = editingItem !== null;

  return {
    isOpen,
    editingItem,
    isEditMode,
    openAddDialog,
    openEditDialog,
    closeDialog,
  };
};
