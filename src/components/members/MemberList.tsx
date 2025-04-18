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

  // 显式处理 Head of Lab (Professor)
  const headOfLabGroupKey = "PROFESSOR"; // 假设这是 Head of Lab 的 key
  const headOfLabMembers = groupedMembers[headOfLabGroupKey] || [];

  // 获取除了 Head of Lab 之外的其他分组键
  const otherGroupKeys = Object.keys(groupedMembers).filter(
    key => key !== headOfLabGroupKey
  );

  // --- 硬编码的 Faculty 数据 ---
  const facultyMembers: MemberForCard[] = [
    {
      id: "Teacher",
      name_en: "Teacher",
      name_zh: "老师", // 您可以修改中文名
      title_zh: "教授",     // 您可以修改中文职称
      title_en: "Professor", // 您可以修改英文职称
      status: "PROFESSOR",   // 修改: 使用 PROFESSOR 作为 MemberStatus 类型值
      enrollment_year: null, // 或 0, N/A
      avatar_url: "/avatars/placeholder.png",
      research_interests: "Placeholder Research Area",
      favorite_emojis: null, // 添加: MemberForCard 需要此属性
      displayStatus: "Faculty", // 添加: MemberForCard 需要此属性
      // 其他可能不在类型中的字段也移除或设为 null/undefined (如果类型允许)
      // email: "placeholder.teacher@example.com",
    },
    // 如果需要，可以添加更多硬编码的老师
  ];
  // --------------------------


  return (
    <>
      {/* 1. 渲染 Head of Lab (如果存在) */}
      {headOfLabMembers.length > 0 && (
        <section key={headOfLabGroupKey} className="mb-12 md:mb-16">
          <h2
            className={`text-2xl md:text-3xl font-semibold ${themeColors.textColorPrimary ?? ""} border-b ${themeColors.footerBorder ?? "border-gray-300"} pb-3 mb-8 scroll-mt-20`}
          >
            {statusTitles[headOfLabGroupKey] || "Head of Lab"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
            {headOfLabMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isEmojiEnabled={isEmojiEnabled}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. 硬编码渲染 Faculty 部分 */}
      <section key="faculty" className="mb-12 md:mb-16">
        <h2
          className={`text-2xl md:text-3xl font-semibold ${themeColors.textColorPrimary ?? ""} border-b ${themeColors.footerBorder ?? "border-gray-300"} pb-3 mb-8 scroll-mt-20`}
        >
          Faculty {/* 或 "指导老师" */}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
          {facultyMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member} // 使用硬编码的数据
              isEmojiEnabled={isEmojiEnabled}
            />
          ))}
        </div>
      </section>

      {/* 3. 渲染其他分组 (跳过 Head of Lab) */}
      {otherGroupKeys.map((groupKey) => {
        const membersInGroup = groupedMembers[groupKey];
        if (!membersInGroup || membersInGroup.length === 0) return null;

        return (
          <section key={groupKey} className="mb-12 md:mb-16">
            <h2
              className={`text-2xl md:text-3xl font-semibold ${themeColors.textColorPrimary ?? ""} border-b ${themeColors.footerBorder ?? "border-gray-300"} pb-3 mb-8 scroll-mt-20`}
            >
              {statusTitles[groupKey] || "Other Members"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
              {membersInGroup.map((member) => (
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
