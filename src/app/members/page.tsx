// src/app/members/page.tsx
import React from "react";
// 修改: 导入新的数据获取函数和类型
import { getAllMembersGrouped } from "@/lib/members"; // 从 members.ts 导入
import type { MemberForCard } from "@/lib/types"; // 从 types.ts 导入
import { MemberList } from "@/components/members/MemberList"; // 导入新的客户端组件
import { themeColors } from "@/styles/theme";
import { AlertTriangle } from "lucide-react"; // 用于错误显示

// Force dynamic rendering (SSR) for this page
export const dynamic = 'force-dynamic';

// 定义分组标题 (保持不变)
const statusTitles: Record<string, string> = {
  PROFESSOR: "Head of Lab",
  博士后: "Postdoctoral Researchers",
  PHD_STUDENT: "PhD Students",
  MASTER_STUDENT: "Master Students",
  UNDERGRADUATE: "Undergraduate Students",
  访问学者: "Visiting Scholars",
  校友: "Alumni",
  其他: "Other Members",
};

// 修改: 组件变为 async 函数
export default async function MembersPage() {
  let groupedMembers: Record<string, MemberForCard[]> = {};
  let error: string | null = null;

  // 直接在服务器组件中获取数据
  try {
    groupedMembers = await getAllMembersGrouped();
  } catch (err) {
    console.error("Failed to load members data:", err);
    error = err instanceof Error ? err.message : "加载成员信息失败";
  }

  // 页面骨架渲染
  return (
    // 容器样式微调
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* 页面大标题 */}
      <h1
        className={`text-3xl sm:text-4xl font-bold text-center ${themeColors.textColorPrimary ?? ""} mb-12 md:mb-16`}
      >
        Meet the Team
      </h1>

      {/* 错误处理显示 */}
      {error && (
        <div
          className={`flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 ${themeColors.footerBackground ?? "bg-red-50"} p-4 rounded-lg mb-8`}
        >
          <AlertTriangle className="h-5 w-5" />
          <span>Error loading members: {error}</span>
        </div>
      )}

      {/* 条件渲染客户端组件或提示信息 */}
      {!error && Object.keys(groupedMembers).length > 0 ? (
        // 渲染客户端组件，传入获取到的数据和标题映射
        <MemberList
          groupedMembers={groupedMembers}
          statusTitles={statusTitles}
        />
      ) : (
        // 如果没有错误但也没有数据
        !error && (
          <p
            className={`text-center ${themeColors.textColorTertiary ?? "text-gray-500"} text-lg mt-8`}
          >
            No members found.
          </p>
        )
      )}

      {/* 注意：Emoji 按钮现在移到了 MemberList 客户端组件中 */}
    </div>
  );
}

// 可选: 添加 loading.tsx 和 error.tsx 文件来处理加载和错误状态的 UI
// 例如，在 app/members/ 目录下创建 loading.tsx:
// export default function Loading() { return <p>Loading members...</p>; }
// 在 app/members/ 目录下创建 error.tsx:
// "use client"; export default function Error({ error }: { error: Error }) { return <p>Error loading members: {error.message}</p>; }
// 如果使用了这两个文件，可以简化 MembersPage 中的 isLoading 和 error 处理逻辑。
