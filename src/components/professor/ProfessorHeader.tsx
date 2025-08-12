import React from "react";
import Image from "next/image"; // 导入Next.js的图片组件
import type { Member } from "@prisma/client"; // 导入Member数据类型
import { themeColors } from "@/styles/theme"; // 导入主题颜色
// 导入新的客户端组件
import ObfuscatedContact from "@/components/common/ObfuscatedContact"; // 导入混淆联系方式组件，用于保护邮箱和电话号码

// 定义组件属性类型，期望接收一个Member对象（或相关部分）
type ProfessorHeaderProps = {
  // 传递完整的Member对象或选择需要的字段
  // 使用Partial允许灵活性，不是所有字段都需要存在
  professorData: Partial<Member> | null; // 教授的基本数据
  addressLine1?: string; // 地址第一行（可选）
  addressLine2?: string; // 地址第二行（可选）
};

// 教授页面头部组件
const ProfessorHeader: React.FC<ProfessorHeaderProps> = ({
  professorData,
  addressLine1,
  addressLine2,
}) => {
  // 提供默认值或优雅地处理null情况
  // 添加 Dr. 前缀（如果不存在）
  const rawNameEn = professorData?.name_en;
  const nameEn =
    rawNameEn && rawNameEn.trim().startsWith("Dr.")
      ? rawNameEn
      : rawNameEn
        ? `Dr. ${rawNameEn}`
        : "Professor"; // 如果没有名字，则使用通用称呼
  const nameZh = professorData?.name_zh; // 中文名（如果有）
  const titleEn = professorData?.title_en ?? "Professor"; // 英文职称，默认为"教授"
  const titleZh = professorData?.title_zh; // 中文职称（如果有）
  const school =
    professorData?.research_group ??
    "School of Mathematics and Computer Science"; // 学院/研究组名，优先使用数据库中的研究组信息
  const university = "The Nanchang University"; // 大学名，后续可能动态获取
  const email = professorData?.email ?? ""; // 邮箱，如果没有则留空
  const phone = professorData?.phone_number ?? ""; // 电话，如果没有则留空
  const address1 = addressLine1 ?? ""; // 地址第一行
  const address2 = addressLine2 ?? ""; // 地址第二行
  // 移除单独的办公室位置，因为已经作为地址的一部分
  const avatarUrl = professorData?.avatar_url ?? "/avatars/placeholder.png"; // 头像URL，如果没有则使用默认占位图

  return (
    // 页面头部容器，应用主题背景色和文字颜色
    <div
      className={`${themeColors.themeHeaderBg ?? "bg-slate-800"} ${themeColors.themeLightText ?? "text-gray-100"} py-10 md:py-12 lg:py-16`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部内容布局：在移动端为纵向，在中等及以上屏幕为横向 */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-10">
          {/* 个人信息部分 */}
          <div className="md:pr-8 text-center md:text-left mb-5 md:mb-0 flex-grow">
            {/* 教授英文名 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
              {nameEn}
            </h1>
            {/* 如果有中文名则显示 */}
            {nameZh && (
              <p className="text-lg sm:text-xl text-gray-300 mb-2">{nameZh}</p>
            )}
            {/* 职称、学院和大学信息 */}
            <p className={`text-base sm:text-lg lg:text-xl mb-4`}>
              {titleEn}
              {school && (
                <>
                  <br />
                  {school}
                </>
              )}
              {university && (
                <>
                  <br />
                  {university}
                </>
              )}
            </p>
            {/* 联系信息：使用<p>进行块级显示 */}
            <div
              className={`space-y-1 text-sm sm:text-base ${themeColors.themeLightText ?? "text-gray-100"}`}
            >
              {/* 使用ObfuscatedContact组件显示邮箱，防止爬虫 */}
              {email && (
                <p>
                  Email: <ObfuscatedContact value={email} type="email" />
                </p>
              )}
              {/* 使用ObfuscatedContact组件显示电话，防止爬虫 */}
              {phone && (
                <p>
                  Office telephone:{" "}
                  <ObfuscatedContact value={phone} type="phone" />
                </p>
              )}
              {/* 显示地址信息（如果有） */}
              {address1 && <p>{address1}</p>}
              {address2 && <p>{address2}</p>}
              {/* 移除单独显示办公室位置的代码 */}
            </div>
          </div>
          {/* 头像容器 */}
          <div
            className={`w-40 h-48 md:w-48 md:h-56 lg:w-52 lg:h-60 ${themeColors.backgroundLight ?? "bg-gray-200"} overflow-hidden rounded-lg flex-shrink-0 border-4 ${themeColors.borderLight ?? "border-gray-300"} shadow-lg`}
          >
            {/* 教授头像 */}
            <Image
              src={avatarUrl}
              alt={nameEn}
              width={208}
              height={240}
              priority // 优先加载，提高用户体验
              unoptimized // 禁用图像优化，有时候对于头像更好
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorHeader;
