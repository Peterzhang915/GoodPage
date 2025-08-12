/**
 * 相册管理 API 服务层
 *
 * 封装所有与相册管理相关的 API 调用逻辑
 */

import type {
  GalleryImage,
  Category,
  ApiResponse,
  PhotoUploadData,
  PhotoUpdateData,
} from "../types";
import { API_ENDPOINTS, ERROR_MESSAGES } from "../constants";

/**
 * 相册 API 服务类
 */
export class PhotoApiService {
  /**
   * 获取指定分类的图片列表
   * @param category 图片分类
   * @param includeHidden 是否包含隐藏的图片
   * @returns 图片列表
   */
  static async getPhotos(
    category: Category,
    includeHidden: boolean = true
  ): Promise<GalleryImage[]> {
    try {
      // 对于 Albums 视图，获取所有图片；对于其他分类，只获取该分类的图片
      const url =
        category === "Albums"
          ? `${API_ENDPOINTS.PHOTOS}?category=${category}&include_hidden=${includeHidden}`
          : `${API_ENDPOINTS.PHOTOS}?category=${category}&include_hidden=${includeHidden}`;

      const response = await fetch(url);
      const data: ApiResponse<GalleryImage[]> = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error(data.error?.message || ERROR_MESSAGES.LOAD_FAILED);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      throw new Error(ERROR_MESSAGES.LOAD_FAILED);
    }
  }

  /**
   * 上传新图片
   * @param uploadData 上传数据
   * @returns 上传结果
   */
  static async uploadPhoto(uploadData: PhotoUploadData): Promise<GalleryImage> {
    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("category", uploadData.category);

      if (uploadData.caption) {
        formData.append("caption", uploadData.caption);
      }

      if (uploadData.date) {
        formData.append("date", uploadData.date);
      }

      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: "POST",
        body: formData,
      });

      const data: ApiResponse<GalleryImage> = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error(data.error?.message || ERROR_MESSAGES.UPLOAD_FAILED);
    } catch (error) {
      console.error("Failed to upload photo:", error);
      throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
    }
  }

  /**
   * 删除图片
   * @param photoId 图片 ID
   * @returns 删除结果
   */
  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const response = await fetch(`${API_ENDPOINTS.DELETE}?id=${photoId}`, {
        method: "DELETE",
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || ERROR_MESSAGES.DELETE_FAILED);
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
      throw new Error(ERROR_MESSAGES.DELETE_FAILED);
    }
  }

  /**
   * 更新图片信息
   * @param updateData 更新数据
   * @returns 更新结果
   */
  static async updatePhoto(updateData: PhotoUpdateData): Promise<GalleryImage> {
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data: ApiResponse<GalleryImage> = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error(data.error?.message || ERROR_MESSAGES.UPDATE_FAILED);
    } catch (error) {
      console.error("Failed to update photo:", error);
      throw new Error(ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  /**
   * 切换图片可见性
   * @param photo 图片对象
   * @param isAlbumsView 是否为相册视图
   * @returns 更新后的图片对象
   */
  static async togglePhotoVisibility(
    photo: GalleryImage,
    isAlbumsView: boolean
  ): Promise<GalleryImage> {
    const updateData: PhotoUpdateData = {
      id: photo.id,
      ...(isAlbumsView
        ? { show_in_albums: !photo.show_in_albums }
        : { is_visible: !photo.is_visible }),
    };

    return this.updatePhoto(updateData);
  }

  /**
   * 更新图片顺序
   * @param photo 图片对象
   * @param newOrder 新的顺序值
   * @param isAlbumsView 是否为相册视图
   * @returns 更新后的图片对象
   */
  static async updatePhotoOrder(
    photo: GalleryImage,
    newOrder: number,
    isAlbumsView: boolean
  ): Promise<GalleryImage> {
    const updateData: PhotoUpdateData = {
      id: photo.id,
      ...(isAlbumsView
        ? { albums_order: newOrder }
        : { display_order: newOrder }),
    };

    return this.updatePhoto(updateData);
  }

  /**
   * 更新图片元数据（标题和日期）
   * @param photo 图片对象
   * @param caption 新标题
   * @param date 新日期
   * @returns 更新后的图片对象
   */
  static async updatePhotoMetadata(
    photo: GalleryImage,
    caption: string | null,
    date: string | null
  ): Promise<GalleryImage> {
    const updateData: PhotoUpdateData = {
      id: photo.id,
      caption,
      date,
    };

    return this.updatePhoto(updateData);
  }

  /**
   * 批量更新图片顺序
   * @param photos 图片列表
   * @param isAlbumsView 是否为相册视图
   * @returns 更新结果
   */
  static async batchUpdateOrder(
    photos: GalleryImage[],
    isAlbumsView: boolean
  ): Promise<void> {
    try {
      const updatePromises = photos.map((photo, index) => {
        const updateData: PhotoUpdateData = {
          id: photo.id,
          ...(isAlbumsView
            ? { albums_order: index }
            : { display_order: index }),
        };
        return this.updatePhoto(updateData);
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to batch update photo order:", error);
      throw new Error(ERROR_MESSAGES.UPDATE_FAILED);
    }
  }
}

/**
 * 导出便捷的 API 方法
 */
export const photoApi = {
  getPhotos: PhotoApiService.getPhotos,
  uploadPhoto: PhotoApiService.uploadPhoto,
  deletePhoto: PhotoApiService.deletePhoto,
  updatePhoto: PhotoApiService.updatePhoto,
  toggleVisibility: PhotoApiService.togglePhotoVisibility,
  updateOrder: PhotoApiService.updatePhotoOrder,
  updateMetadata: PhotoApiService.updatePhotoMetadata,
  batchUpdateOrder: PhotoApiService.batchUpdateOrder,
};

export default photoApi;
