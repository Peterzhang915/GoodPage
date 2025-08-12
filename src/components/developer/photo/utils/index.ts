/**
 * 相册管理工具函数
 *
 * 包含所有相册管理相关的通用工具函数
 */

import type { GalleryImage, Category } from "../types";
import {
  isAlbumsView,
  isValidFileType,
  isValidFileSize,
  isValidDateFormat,
  UPLOAD_CONFIG,
  ERROR_MESSAGES,
} from "../constants";

/**
 * 图片排序工具函数
 */
export const photoSortUtils = {
  /**
   * 按可见性和顺序排序图片
   * @param photos 图片列表
   * @param category 当前分类
   * @returns 排序后的图片列表
   */
  sortPhotos(photos: GalleryImage[], category: Category): GalleryImage[] {
    return [...photos].sort((a, b) => {
      if (isAlbumsView(category)) {
        // 相册视图：先按是否显示，再按相册顺序
        if (a.show_in_albums !== b.show_in_albums) {
          return a.show_in_albums ? -1 : 1;
        }
        return a.albums_order - b.albums_order;
      } else {
        // 分类视图：先按是否可见，再按显示顺序
        if (a.is_visible !== b.is_visible) {
          return a.is_visible ? -1 : 1;
        }
        return a.display_order - b.display_order;
      }
    });
  },

  /**
   * 获取可见的图片
   * @param photos 图片列表
   * @param category 当前分类
   * @returns 可见的图片列表
   */
  getVisiblePhotos(photos: GalleryImage[], category: Category): GalleryImage[] {
    return photos.filter((photo) =>
      isAlbumsView(category) ? photo.show_in_albums : photo.is_visible
    );
  },

  /**
   * 获取隐藏的图片
   * @param photos 图片列表
   * @param category 当前分类
   * @returns 隐藏的图片列表
   */
  getHiddenPhotos(photos: GalleryImage[], category: Category): GalleryImage[] {
    return photos.filter((photo) =>
      isAlbumsView(category) ? !photo.show_in_albums : !photo.is_visible
    );
  },
};

/**
 * 文件验证工具函数
 */
export const fileValidationUtils = {
  /**
   * 验证上传文件
   * @param file 文件对象
   * @returns 验证结果
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    if (!isValidFileType(file)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.FILE_TYPE_NOT_SUPPORTED,
      };
    }

    if (!isValidFileSize(file)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE,
      };
    }

    return { isValid: true };
  },

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的文件大小字符串
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * 获取文件扩展名
   * @param filename 文件名
   * @returns 文件扩展名
   */
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  },
};

/**
 * 表单验证工具函数
 */
export const formValidationUtils = {
  /**
   * 验证图片标题
   * @param caption 标题
   * @returns 验证结果
   */
  validateCaption(caption: string): { isValid: boolean; error?: string } {
    if (caption.length > 100) {
      return {
        isValid: false,
        error: "Caption length cannot exceed 100 characters",
      };
    }

    return { isValid: true };
  },

  /**
   * 验证日期格式
   * @param date 日期字符串
   * @returns 验证结果
   */
  validateDate(date: string): { isValid: boolean; error?: string } {
    if (!date) return { isValid: true }; // 日期是可选的

    if (!isValidDateFormat(date)) {
      return {
        isValid: false,
        error: "Date format is incorrect, please use YYYY.MM.DD format",
      };
    }

    return { isValid: true };
  },

  /**
   * 验证上传表单
   * @param file 文件
   * @param caption 标题
   * @param date 日期
   * @returns 验证结果
   */
  validateUploadForm(
    file: File | null,
    caption: string,
    date: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!file) {
      errors.push("Please select a file to upload");
    } else {
      const fileValidation = fileValidationUtils.validateFile(file);
      if (!fileValidation.isValid && fileValidation.error) {
        errors.push(fileValidation.error);
      }
    }

    const captionValidation = formValidationUtils.validateCaption(caption);
    if (!captionValidation.isValid && captionValidation.error) {
      errors.push(captionValidation.error);
    }

    const dateValidation = formValidationUtils.validateDate(date);
    if (!dateValidation.isValid && dateValidation.error) {
      errors.push(dateValidation.error);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

/**
 * URL 工具函数
 */
export const urlUtils = {
  /**
   * 创建文件预览 URL
   * @param file 文件对象
   * @returns 预览 URL
   */
  createFilePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  },

  /**
   * 释放文件预览 URL
   * @param url 预览 URL
   */
  revokeFilePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  },
};

/**
 * 数组操作工具函数
 */
export const arrayUtils = {
  /**
   * 移动数组元素
   * @param array 原数组
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   * @returns 新数组
   */
  moveArrayItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const newArray = [...array];
    const item = newArray.splice(fromIndex, 1)[0];
    newArray.splice(toIndex, 0, item);
    return newArray;
  },

  /**
   * 更新数组中的元素
   * @param array 原数组
   * @param predicate 查找条件
   * @param updater 更新函数
   * @returns 新数组
   */
  updateArrayItem<T>(
    array: T[],
    predicate: (item: T) => boolean,
    updater: (item: T) => T
  ): T[] {
    return array.map((item) => (predicate(item) ? updater(item) : item));
  },

  /**
   * 从数组中移除元素
   * @param array 原数组
   * @param predicate 查找条件
   * @returns 新数组
   */
  removeArrayItem<T>(array: T[], predicate: (item: T) => boolean): T[] {
    return array.filter((item) => !predicate(item));
  },
};

/**
 * 错误处理工具函数
 */
export const errorUtils = {
  /**
   * 解析 API 错误
   * @param error 错误对象
   * @returns 错误消息
   */
  parseApiError(error: any): string {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },

  /**
   * 检查是否为网络错误
   * @param error 错误对象
   * @returns 是否为网络错误
   */
  isNetworkError(error: any): boolean {
    return (
      error?.code === "NETWORK_ERROR" ||
      error?.message?.includes("fetch") ||
      error?.message?.includes("network")
    );
  },
};

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}
