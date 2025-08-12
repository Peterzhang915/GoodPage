/**
 * 图片上传相关 Hook
 *
 * 管理图片上传的状态和逻辑，包括拖拽上传
 */

import { useState, useRef, useCallback } from "react";
import type { Category, UploadState, DragHandlers } from "../types";
import { photoApi } from "../services/photoApi";
import { formValidationUtils, urlUtils } from "../utils";
import { isAlbumsView } from "../constants";

interface UsePhotoUploadOptions {
  category: Category;
  onUploadSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * 图片上传 Hook
 */
export function usePhotoUpload({
  category,
  onUploadSuccess,
  onError,
}: UsePhotoUploadOptions) {
  // 上传状态
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    file: null,
    caption: "",
    date: "",
    isDragging: false,
  });

  // 文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 设置上传文件
   */
  const setFile = useCallback((file: File | null) => {
    setUploadState((prev) => ({ ...prev, file }));
  }, []);

  /**
   * 设置图片标题
   */
  const setCaption = useCallback((caption: string) => {
    setUploadState((prev) => ({ ...prev, caption }));
  }, []);

  /**
   * 设置拍摄日期
   */
  const setDate = useCallback((date: string) => {
    setUploadState((prev) => ({ ...prev, date }));
  }, []);

  /**
   * 重置上传表单
   */
  const resetUploadForm = useCallback(() => {
    setUploadState({
      uploading: false,
      file: null,
      caption: "",
      date: "",
      isDragging: false,
    });

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        const file = files[0];
        const validation = formValidationUtils.validateUploadForm(file, "", "");

        if (validation.isValid) {
          setFile(file);
        } else {
          onError?.(validation.errors[0]);
        }
      }
    },
    [setFile, onError]
  );

  /**
   * 拖拽处理器
   */
  const dragHandlers: DragHandlers = {
    onDragOver: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setUploadState((prev) => ({ ...prev, isDragging: true }));
    }, []),

    onDragLeave: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setUploadState((prev) => ({ ...prev, isDragging: false }));
    }, []),

    onDrop: useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setUploadState((prev) => ({ ...prev, isDragging: false }));

        const files = e.dataTransfer.files;
        handleFileSelect(files);
      },
      [handleFileSelect]
    ),
  };

  /**
   * 触发文件选择对话框
   */
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * 执行图片上传
   */
  const uploadPhoto = useCallback(async () => {
    const { file, caption, date } = uploadState;

    if (!file || isAlbumsView(category)) {
      return;
    }

    // 验证表单
    const validation = formValidationUtils.validateUploadForm(
      file,
      caption,
      date
    );
    if (!validation.isValid) {
      onError?.(validation.errors[0]);
      return;
    }

    setUploadState((prev) => ({ ...prev, uploading: true }));

    try {
      const uploadData = {
        file,
        category,
        caption: caption || undefined,
        date: date || undefined,
      };

      await photoApi.uploadPhoto(uploadData);

      // 上传成功，重置表单
      resetUploadForm();
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload failed:", error);
      onError?.(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploadState((prev) => ({ ...prev, uploading: false }));
    }
  }, [uploadState, category, onUploadSuccess, onError, resetUploadForm]);

  /**
   * 取消上传
   */
  const cancelUpload = useCallback(() => {
    if (uploadState.file) {
      // 释放文件预览 URL（如果有的话）
      const previewUrl = urlUtils.createFilePreviewUrl(uploadState.file);
      urlUtils.revokeFilePreviewUrl(previewUrl);
    }

    resetUploadForm();
  }, [uploadState.file, resetUploadForm]);

  /**
   * 获取文件预览 URL
   */
  const getFilePreviewUrl = useCallback(() => {
    if (uploadState.file) {
      return urlUtils.createFilePreviewUrl(uploadState.file);
    }
    return null;
  }, [uploadState.file]);

  /**
   * 检查是否可以上传
   */
  const canUpload =
    !isAlbumsView(category) && uploadState.file && !uploadState.uploading;

  /**
   * 检查是否显示上传区域
   */
  const showUploadArea = !isAlbumsView(category);

  return {
    // 状态
    uploading: uploadState.uploading,
    file: uploadState.file,
    caption: uploadState.caption,
    date: uploadState.date,
    isDragging: uploadState.isDragging,

    // 计算属性
    canUpload,
    showUploadArea,

    // 操作方法
    setFile,
    setCaption,
    setDate,
    resetUploadForm,
    handleFileSelect,
    triggerFileSelect,
    uploadPhoto,
    cancelUpload,
    getFilePreviewUrl,

    // 拖拽处理器
    dragHandlers,

    // 引用
    fileInputRef,
  };
}
