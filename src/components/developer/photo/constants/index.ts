/**
 * 相册管理组件常量配置
 *
 * 包含所有相册管理相关的常量定义和配置项
 */

import type { Category } from "../types";

/**
 * 支持的图片分类列表
 * 注意：与前端展示页面保持一致
 */
export const VALID_CATEGORIES: readonly Category[] = [
  "Albums", // 首页相册
  "Meetings", // 会议照片
  "Graduation", // 毕业照片
  "Team Building", // 团建活动
  "Sports", // 运动照片
  "Lab Life", // 实验室生活
  "Competition", // 比赛照片
] as const;

/**
 * 分类显示名称映射
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  Albums: "Homepage Albums",
  Meetings: "Meeting Photos",
  Graduation: "Graduation Photos",
  "Team Building": "Team Building",
  Sports: "Sports Photos",
  "Lab Life": "Lab Life",
  Competition: "Competition Photos",
};

/**
 * 分类描述信息
 */
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  Albums:
    "Manage the photos displayed in the album homepage, which does not affect the display status of each category",
  Meetings:
    "Manage laboratory meeting related photos, control visibility and sorting",
  Graduation:
    "Manage graduation ceremony related photos, control visibility and sorting",
  "Team Building":
    "Manage team building activity photos, control visibility and sorting",
  Sports: "Manage sports related photos, control visibility and sorting",
  "Lab Life":
    "Manage laboratory daily life photos, control visibility and sorting",
  Competition:
    "Manage competition related photos, control visibility and sorting",
};

/**
 * 文件上传配置
 */
export const UPLOAD_CONFIG = {
  /** 支持的文件类型 */
  ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  /** 文件类型显示文本 */
  ACCEPTED_TYPES_TEXT: "JPG, PNG, GIF, WEBP",
  /** 最大文件大小（字节） */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  /** 最大文件大小显示文本 */
  MAX_FILE_SIZE_TEXT: "10MB",
} as const;

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  /** 图片列表和操作 */
  PHOTOS: "/api/gallery/photos",
  /** 图片上传 */
  UPLOAD: "/api/gallery/photos",
  /** 图片删除 */
  DELETE: "/api/gallery/photos",
  /** 图片更新 */
  UPDATE: "/api/gallery/photos",
} as const;

/**
 * UI 配置常量
 */
export const UI_CONFIG = {
  /** 图片网格列数配置 */
  GRID_COLS: {
    MOBILE: 2,
    DESKTOP: 4,
  },
  /** 动画配置 */
  ANIMATION: {
    DURATION: 0.2,
    EASE: "easeInOut",
  },
  /** 颜色配置 */
  COLORS: {
    SUCCESS: "#22c55e",
    ERROR: "#ef4444",
    WARNING: "#f59e0b",
    INFO: "#3b82f6",
  },
} as const;

/**
 * 表单验证配置
 */
export const VALIDATION = {
  /** 标题最大长度 */
  CAPTION_MAX_LENGTH: 100,
  /** 日期格式正则表达式 */
  DATE_PATTERN: /^\d{4}\.\d{2}\.\d{2}$/,
  /** 日期格式示例 */
  DATE_FORMAT_EXAMPLE: "2024.06.10",
} as const;

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  UPLOAD_FAILED: "Upload failed, please try again",
  DELETE_FAILED: "Delete failed, please try again",
  UPDATE_FAILED: "Update failed, please try again",
  LOAD_FAILED: "Load failed, please refresh the page",
  FILE_TOO_LARGE: `File size cannot exceed ${UPLOAD_CONFIG.MAX_FILE_SIZE_TEXT}`,
  FILE_TYPE_NOT_SUPPORTED: `Only ${UPLOAD_CONFIG.ACCEPTED_TYPES_TEXT} formats are supported`,
  NETWORK_ERROR: "Network error, please check your connection",
  UNKNOWN_ERROR: "Unknown error, please try again",
} as const;

/**
 * 成功消息常量
 */
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: "Upload successful",
  DELETE_SUCCESS: "Delete successful",
  UPDATE_SUCCESS: "Update successful",
  SAVE_SUCCESS: "Save successful",
} as const;

/**
 * 确认消息常量
 */
export const CONFIRM_MESSAGES = {
  DELETE_PHOTO: "Are you sure you want to delete this photo?",
  CANCEL_UPLOAD: "Are you sure you want to cancel the upload?",
  DISCARD_CHANGES: "Are you sure you want to discard changes?",
} as const;

/**
 * 占位符文本常量
 */
export const PLACEHOLDERS = {
  CAPTION: "e.g., 2024 Graduation Photo",
  DATE: "e.g., 2024.06.10",
  SEARCH: "Search photos...",
} as const;

/**
 * 工具提示文本常量
 */
export const TOOLTIPS = {
  EDIT_INFO: "Edit information",
  DELETE_PHOTO: "Delete photo",
  TOGGLE_VISIBILITY: "Toggle visibility",
  MOVE_UP: "Move up",
  MOVE_DOWN: "Move down",
  SAVE_CHANGES: "Save changes",
  CANCEL_EDIT: "Cancel edit",
  ADD_TO_ALBUM: "Add to album",
  REMOVE_FROM_ALBUM: "Remove from album",
  SHOW_IN_CATEGORY: "Show in category",
  HIDE_IN_CATEGORY: "Hide in category",
} as const;

/**
 * 判断是否为相册视图的工具函数
 */
export const isAlbumsView = (category: Category): boolean =>
  category === "Albums";

/**
 * 获取分类显示名称
 */
export const getCategoryLabel = (category: Category): string => {
  return CATEGORY_LABELS[category] || category;
};

/**
 * 获取分类描述
 */
export const getCategoryDescription = (category: Category): string => {
  return CATEGORY_DESCRIPTIONS[category] || "";
};

/**
 * 验证文件类型
 */
export const isValidFileType = (file: File): boolean => {
  return UPLOAD_CONFIG.ACCEPTED_TYPES.includes(file.type as any);
};

/**
 * 验证文件大小
 */
export const isValidFileSize = (file: File): boolean => {
  return file.size <= UPLOAD_CONFIG.MAX_FILE_SIZE;
};

/**
 * 验证日期格式
 */
export const isValidDateFormat = (date: string): boolean => {
  return VALIDATION.DATE_PATTERN.test(date);
};
