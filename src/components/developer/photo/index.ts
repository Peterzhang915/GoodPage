/**
 * 相册管理组件模块导出
 * 
 * 统一导出所有相册管理相关的组件、hooks、类型和工具
 */

// 主组件
// 默认导出重构后的组件
export { default as PhotoManager } from './PhotoManager';

// 子组件
export { default as PhotoCard } from './components/PhotoCard';
export { default as UploadArea } from './components/UploadArea';
export { default as CategorySelector } from './components/CategorySelector';
export { default as PhotoGrid } from './components/PhotoGrid';

// Hooks
export { usePhotoManager } from './hooks/usePhotoManager';
export { usePhotoUpload } from './hooks/usePhotoUpload';
export { usePhotoOperations } from './hooks/usePhotoOperations';

// 服务
export { photoApi, PhotoApiService } from './services/photoApi';

// 工具函数
export {
  photoSortUtils,
  fileValidationUtils,
  formValidationUtils,
  urlUtils,
  arrayUtils,
  errorUtils,
  debounce,
  throttle
} from './utils';

// 常量
export {
  VALID_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  UPLOAD_CONFIG,
  API_ENDPOINTS,
  UI_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIRM_MESSAGES,
  PLACEHOLDERS,
  TOOLTIPS,
  isAlbumsView,
  getCategoryLabel,
  getCategoryDescription,
  isValidFileType,
  isValidFileSize,
  isValidDateFormat
} from './constants';

// 类型定义
export type {
  GalleryImage,
  Category,
  PhotoManagerProps,
  PhotoCardProps,
  UploadAreaProps,
  CategorySelectorProps,
  PhotoGridProps,
  ApiResponse,
  PhotoUploadData,
  PhotoUpdateData,
  DragHandlers,
  UploadState,
  PhotoManagerState
} from './types';
