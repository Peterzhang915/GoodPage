import { PublicationWithAuthors } from "@/app/api/publications/route";
import { toast } from "sonner";

/**
 * 待审核出版物API服务
 * 负责与后端API的交互
 */
export const pendingApi = {
  /**
   * 获取所有待审核出版物
   */
  async fetchAll(): Promise<PublicationWithAuthors[]> {
    const response = await fetch("/api/publications/pending");
    
    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch {
        // 忽略JSON解析错误，使用默认错误消息
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    
    // 确保返回的数据格式正确
    if (!result.data || !Array.isArray(result.data)) {
      throw new Error("Invalid response format");
    }

    return result.data;
  },

  /**
   * 批准出版物
   */
  async approve(id: number): Promise<void> {
    const response = await fetch(`/api/publications/pending/${id}/approve`, {
      method: "POST",
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch {
        // 忽略JSON解析错误，使用默认错误消息
      }
      throw new Error(errorMsg);
    }
  },

  /**
   * 拒绝出版物（删除）
   */
  async reject(id: number): Promise<void> {
    const response = await fetch(`/api/publications/pending/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch {
        // 忽略JSON解析错误，使用默认错误消息
      }
      throw new Error(errorMsg);
    }
  },

  /**
   * 更新待审核出版物
   */
  async update(id: number, data: any): Promise<PublicationWithAuthors> {
    const response = await fetch(`/api/publications/pending/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch {
        // 忽略JSON解析错误，使用默认错误消息
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    return {
      ...result.data,
      createdAt: result.data.createdAt ? new Date(result.data.createdAt) : new Date(),
      updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : new Date(),
    };
  },

  /**
   * 创建新的待审核出版物
   */
  async create(data: any): Promise<PublicationWithAuthors> {
    const response = await fetch("/api/publications/pending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMsg = errorData.error;
        }
      } catch {
        // 忽略JSON解析错误，使用默认错误消息
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    return {
      ...result.data,
      createdAt: result.data.createdAt ? new Date(result.data.createdAt) : new Date(),
      updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : new Date(),
    };
  },
};
