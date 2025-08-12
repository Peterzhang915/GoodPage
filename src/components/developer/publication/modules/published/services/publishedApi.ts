import { PublicationWithAuthors } from "@/app/api/publications/route";

/**
 * 已发布出版物API服务
 * 负责与后端API的交互
 */
export const publishedApi = {
  /**
   * 获取所有已发布出版物
   */
  async fetchAll(): Promise<PublicationWithAuthors[]> {
    const response = await fetch("/api/publications");

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

    // 转换日期字段
    return result.data.map((pub: PublicationWithAuthors) => ({
      ...pub,
      createdAt: pub.createdAt ? new Date(pub.createdAt) : new Date(),
      updatedAt: pub.updatedAt ? new Date(pub.updatedAt) : new Date(),
    }));
  },

  /**
   * 创建新出版物
   */
  async create(data: any): Promise<PublicationWithAuthors> {
    const response = await fetch("/api/publications", {
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
      createdAt: result.data.createdAt
        ? new Date(result.data.createdAt)
        : new Date(),
      updatedAt: result.data.updatedAt
        ? new Date(result.data.updatedAt)
        : new Date(),
    };
  },

  /**
   * 更新出版物
   */
  async update(id: number, data: any): Promise<PublicationWithAuthors> {
    const response = await fetch(`/api/publications/${id}`, {
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
      createdAt: result.data.createdAt
        ? new Date(result.data.createdAt)
        : new Date(),
      updatedAt: result.data.updatedAt
        ? new Date(result.data.updatedAt)
        : new Date(),
    };
  },

  /**
   * 删除出版物
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`/api/publications/${id}`, {
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
};
