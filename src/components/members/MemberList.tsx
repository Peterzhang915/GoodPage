// src/components/members/MemberList.tsx
"use client"; // 标记为客户端组件

import React, { useState } from "react"; // 导入 useState
import { MemberCard } from "@/components/members/MemberCard"; // 导入成员卡片组件
import { themeColors } from "@/styles/theme"; // 导入主题颜色
// 导入需要的类型
import type { MemberForCard } from "@/lib/types"; // 假设 MemberForCard 在 types.ts 中定义

// 定义该组件接收的 Props 类型
interface MemberListProps {
  groupedMembers: Record<string, MemberForCard[]>; // 从服务器组件接收分组和排序好的成员数据
  statusTitles: Record<string, string>; // 状态标题映射
}

export function MemberList({ groupedMembers, statusTitles }: MemberListProps) {
  // 客户端状态，用于控制 Emoji 显示
  const [isEmojiEnabled, setIsEmojiEnabled] = useState(false);

  // 从 props 获取已排序的分组键 (服务器组件已经排序好)
  const sortedGroupKeys = Object.keys(groupedMembers);

  return (
    <>
      {/* 渲染每个分组 */}
      {sortedGroupKeys.map((groupKey) => {
        const membersInGroup = groupedMembers[groupKey];
        if (!membersInGroup || membersInGroup.length === 0) return null; // 如果组为空则不渲染

        return (
          <section key={groupKey} className="mb-12 md:mb-16">
            {" "}
            {/* 调整间距 */}
            {/* 分组标题 */}
            <h2
              className={`text-2xl md:text-3xl font-semibold ${themeColors.textColorPrimary ?? ""} border-b ${themeColors.footerBorder ?? "border-gray-300"} pb-3 mb-8 scroll-mt-20`}
            >
              {/* 这里可以根据需要添加组图标 */}
              {statusTitles[groupKey] || "Other Members"}
            </h2>
            {/* 成员卡片网格布局 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
              {membersInGroup.map((member) => (
                // 传递 member 数据和 emoji 状态给卡片组件
                <MemberCard
                  key={member.id}
                  member={member}
                  isEmojiEnabled={isEmojiEnabled}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Emoji 切换按钮 */}
      <div className="mt-16 md:mt-24 text-center mx-auto w-full flex justify-center">
        {" "}
        {/* 调整上边距 */}
        <button
          onClick={() => setIsEmojiEnabled(!isEmojiEnabled)}
          title={isEmojiEnabled ? "Disable Fun Emojis" : "Enable Fun Emojis"}
          // 保持样式不变，或根据需要调整
          className={`w-12 h-12 rounded-full shadow-md hover:shadow-lg flex items-center justify-center transition-shadow duration-200 select-none animate-[breathe-scale_2s_infinite] ${isEmojiEnabled ? `${themeColors.footerBackground ?? "bg-purple-100"} hover:${themeColors.accentColor ?? "text-purple-600"}` : `${themeColors.footerBackground ?? "bg-gray-100"} hover:${themeColors.textColorSecondary ?? "text-gray-600"}`}`}
          aria-label="Toggle Emojis"
        >
          <span className="text-2xl select-none">
            {isEmojiEnabled ? "🎉" : "✨"}
          </span>
        </button>
      </div>
    </>
  );
}
