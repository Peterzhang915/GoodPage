/**
 * 相册管理组件类型定义
 * 
 * 包含所有相册管理相关的 TypeScript 类型定义
 */

/**
 * 图片数据类型定义
 * 对应后端 GalleryPhoto 模型
 */
export interface GalleryImage {
  /** 图片唯一标识符 */
  id: string;
  /** 图片 URL 地址 */
  src: string;
  /** 图片替代文本 */
  alt: string;
  /** 图片分类 */
  category: string;
  /** 图片标题/说明 */
  caption: string | null;
  /** 拍摄日期 */
  date: string | null;
  /** 在分类中是否可见 */
  is_visible: boolean;
  /** 是否在首页相册显示 */
  show_in_albums: boolean;
  /** 分类中的显示顺序 */
  display_order: number;
  /** 首页相册中的显示顺序 */
  albums_order: number;
}

/**
 * 支持的图片分类类型
 */
export type Category = 
  | "Albums"        // 首页相册
  | "Meetings"      // 会议照片
  | "Graduation"    // 毕业照片
  | "Team Building" // 团建活动
  | "Sports"        // 运动照片
  | "Lab Life"      // 实验室生活
  | "Competition";  // 比赛照片

/**
 * PhotoManager 主组件属性
 */
export interface PhotoManagerProps {
  /** 关闭管理面板的回调函数 */
  onClose: () => void;
}

/**
 * PhotoCard 组件属性
 */
export interface PhotoCardProps {
  /** 图片数据 */
  photo: GalleryImage;
  /** 删除图片回调 */
  onDelete: (photo: GalleryImage) => void;
  /** 切换可见性回调 */
  onToggleVisibility: (photo: GalleryImage) => void;
  /** 更改顺序回调 */
  onOrderChange: (photo: GalleryImage, newOrder: number) => void;
  /** 更新元数据回调 */
  onUpdateMetadata: (photo: GalleryImage, caption: string | null, date: string | null) => void;
  /** 是否为相册视图 */
  isAlbumsView?: boolean;
}

/**
 * 上传区域组件属性
 */
export interface UploadAreaProps {
  /** 当前选中的分类 */
  category: Category;
  /** 上传完成回调 */
  onUploadComplete: () => void;
  /** 错误处理回调 */
  onError: (error: string) => void;
}

/**
 * 分类选择器组件属性
 */
export interface CategorySelectorProps {
  /** 当前选中的分类 */
  value: Category;
  /** 分类变更回调 */
  onChange: (category: Category) => void;
}

/**
 * 图片网格组件属性
 */
export interface PhotoGridProps {
  /** 图片列表 */
  photos: GalleryImage[];
  /** 当前分类 */
  category: Category;
  /** 是否显示加载状态 */
  loading: boolean;
  /** 删除图片回调 */
  onDelete: (photo: GalleryImage) => void;
  /** 切换可见性回调 */
  onToggleVisibility: (photo: GalleryImage) => void;
  /** 更改顺序回调 */
  onOrderChange: (photo: GalleryImage, newOrder: number) => void;
  /** 更新元数据回调 */
  onUpdateMetadata: (photo: GalleryImage, caption: string | null, date: string | null) => void;
}

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = any> {
  /** 请求是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * 图片上传请求数据
 */
export interface PhotoUploadData {
  /** 图片文件 */
  file: File;
  /** 图片分类 */
  category: Category;
  /** 图片标题（可选） */
  caption?: string;
  /** 拍摄日期（可选） */
  date?: string;
}

/**
 * 图片更新请求数据
 */
export interface PhotoUpdateData {
  /** 图片 ID */
  id: string;
  /** 图片标题 */
  caption?: string | null;
  /** 拍摄日期 */
  date?: string | null;
  /** 在分类中是否可见 */
  is_visible?: boolean;
  /** 是否在首页相册显示 */
  show_in_albums?: boolean;
  /** 分类中的显示顺序 */
  display_order?: number;
  /** 首页相册中的显示顺序 */
  albums_order?: number;
}

/**
 * 拖拽事件处理器类型
 */
export interface DragHandlers {
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

/**
 * 上传状态类型
 */
export interface UploadState {
  /** 是否正在上传 */
  uploading: boolean;
  /** 待上传文件 */
  file: File | null;
  /** 图片标题 */
  caption: string;
  /** 拍摄日期 */
  date: string;
  /** 是否正在拖拽 */
  isDragging: boolean;
}

/**
 * 图片管理状态类型
 */
export interface PhotoManagerState {
  /** 当前选中的分类 */
  category: Category;
  /** 图片列表 */
  photos: GalleryImage[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}
