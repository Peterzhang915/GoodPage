/**
 * 出版物模块统一导出文件
 * 提供解耦后组件的统一导出入口
 */

// 主容器组件 - 主要入口点
export { default as PublicationManagerContainer } from "./containers/MainPublicationContainer";

// 模块管理器导出
export { default as PublishedManager } from "./modules/published/PublishedManager";
export { default as PendingManager } from "./modules/pending/PendingManager";
export { default as DblpImportManager } from "./modules/dblp-import/DblpImportManager";

// 已发布出版物模块导出
export {
  PublishedHeader,
  PublishedItem,
  PublishedList,
  usePublishedData,
  usePublishedActions,
  usePublishedManager,
  publishedApi,
} from "./modules/published";

// 待审核出版物模块导出
export {
  PendingHeader,
  PendingItem,
  PendingList,
  usePendingData,
  usePendingActions,
  usePendingManager,
  pendingApi,
} from "./modules/pending";

// 共享组件导出
export { useDialog } from "./shared/hooks/useDialog";
export { useSearch } from "./shared/hooks/useSearch";
export { default as SearchBar } from "./shared/components/SearchBar";

// 表单组件导出
export { PublicationForm } from "./forms/PublicationForm";
export type { PublicationFormData } from "./forms/PublicationForm";

// 类型导出
export type { PublicationWithAuthors } from "@/app/api/publications/route";
