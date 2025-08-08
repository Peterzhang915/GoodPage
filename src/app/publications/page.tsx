// src/app/publications/page.tsx
import React from "react";
// 【修改】从正确的文件导入类型和函数
import { getAllPublicationsFormatted } from "@/lib/publications";
// 【修复】移除未导出的 AuthorInfo，只保留 PublicationInfo
import type { PublicationInfo } from "@/lib/types";
import Link from "next/link";
import {
  BookOpen,
  Link as LinkIcon,
  FileText,
  Calendar,
  Users,
  Copy,
} from "lucide-react";
import { themeColors } from "@/styles/theme";

// 导入提取的组件
import PublicationsBrowser from "@/components/publications/PublicationsBrowser";

// --- 主页面组件 (Server Component) ---
export default async function PublicationsPage() {
  // 调用正确的函数
  let publications: PublicationInfo[] = [];
  let error: string | null = null;

  try {
    publications = await getAllPublicationsFormatted();
  } catch (err) {
    console.error("Failed to load publications:", err);
    error = err instanceof Error ? err.message : "无法加载出版物列表";
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1
        className={`text-3xl sm:text-4xl font-bold text-center ${themeColors.textColorPrimary ?? ""} mb-12 md:mb-16`}
      >
        Publications
      </h1>

      {/* 错误处理 */}
      {error && (
        <p
          className={`text-center text-red-600 dark:text-red-400 ${themeColors.footerBackground ?? "bg-red-50"} p-4 rounded-lg`}
        >
          Error: {error}
        </p>
      )}

      {/* 主内容区域：带搜索和预设关键词的浏览器 */}
      {!error && publications.length > 0 ? (
        <PublicationsBrowser publications={publications} />
      ) : (
        !error && (
          <p
            className={`text-center ${themeColors.textColorTertiary ?? "text-gray-500"} text-lg mt-8`}
          >
            No publications found.
          </p>
        )
      )}
    </div>
  );
}
