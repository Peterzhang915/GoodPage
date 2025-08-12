"use client"; // 标记为客户端组件

import React, { useState } from "react";
import type { Sponsorship } from "@prisma/client"; // 导入资助类型
import { themeColors } from "@/styles/theme"; // 导入主题颜色
import { Landmark, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"; // 导入图标：Landmark用于资助项，ExternalLink用于外部链接，ChevronDown/Up用于展开/收起功能
import { motion, AnimatePresence } from "framer-motion"; // 导入动画组件

// 定义组件属性接口
interface SponsorshipsSectionProps {
  featuredSponsorships: Sponsorship[]; // 特色/重要资助列表
  detailedSponsorships: Sponsorship[]; // 详细资助列表
  fetchError?: string | null; // 获取数据时可能发生的错误
}

// 资助部分组件
const SponsorshipsSection: React.FC<SponsorshipsSectionProps> = ({
  featuredSponsorships,
  detailedSponsorships,
  fetchError,
}) => {
  // 控制详细视图是否展开的状态
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  // 检查是否有特色和详细资助数据
  const hasFeatured = featuredSponsorships.length > 0;
  const hasDetailed = detailedSponsorships.length > 0;

  // 处理错误情况
  if (fetchError) {
    return (
      <section id="sponsorships" className="mb-8">
        <h2
          className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
        >
          Grants & Sponsorships
        </h2>
        <p
          className={`text-red-600 dark:text-red-400 ${themeColors.backgroundWhite ?? "bg-red-50"} p-3 rounded-md`}
        >
          Error loading sponsorships: {fetchError}
        </p>
      </section>
    );
  }

  // 如果没有数据，可以选择返回null或显示一个提示信息
  if (!hasFeatured && !hasDetailed) {
    // 可选：如果需要，渲染"无数据"消息
    return null;
  }

  // 对资助项按显示顺序进行排序
  const sortedFeatured = [...featuredSponsorships].sort(
    (a, b) => a.display_order - b.display_order
  );
  const sortedDetailed = [...detailedSponsorships].sort(
    (a, b) => a.display_order - b.display_order
  );

  // 切换详细视图的展开/收起状态
  const toggleDetailedView = () => {
    setIsDetailedViewOpen(!isDetailedViewOpen);
  };

  return (
    <section id="sponsorships" className="mb-8">
      {/* 资助标题 */}
      <h2
        className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
      >
        Grants & Sponsorships
      </h2>

      {/* 特色/重要资助列表 */}
      {hasFeatured && (
        <ul className="list-none pl-0 space-y-2 md:space-y-3 mb-4">
          {" "}
          {/* 添加底部外边距 */}
          {sortedFeatured.map((sponsorship) => (
            <li
              key={sponsorship.id}
              className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm md:text-base`}
            >
              {/* 资助图标 */}
              <Landmark
                size={16}
                className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-500"}`}
              />
              <div>
                {/* 资助内容 */}
                <span>{sponsorship.content}</span>
                {/* 显示链接（如果有） */}
                {sponsorship.link_url && (
                  <a
                    href={sponsorship.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-1.5 text-xs ${themeColors.linkColor ?? "text-blue-600 hover:text-blue-800"} inline-flex items-center`}
                    aria-label={`Link for sponsorship item ${sponsorship.id}`}
                  >
                    <ExternalLink size={12} className="mr-0.5" /> Link
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 展开/收起按钮 */}
      {hasDetailed && (
        <div
          onClick={toggleDetailedView}
          className="flex flex-col items-center cursor-pointer py-2 group mb-4"
          aria-expanded={isDetailedViewOpen}
          aria-controls="detailed-sponsorships-content"
        >
          {/* 分隔线 */}
          <hr
            className={`w-20 border-t ${themeColors.borderLight ?? "border-gray-300"} group-hover:border-gray-500 transition-colors mb-1`}
          />
          {/* 展开/收起文字 */}
          <span
            className={`text-xs font-medium ${themeColors.textColorSecondary ?? "text-gray-500"} group-hover:text-gray-700 transition-colors mb-1`}
          >
            {isDetailedViewOpen ? "Collapse" : "View All"}
          </span>
          {/* 展开/收起图标 */}
          {isDetailedViewOpen ? (
            <ChevronUp
              size={20}
              className={`${themeColors.textColorSecondary ?? "text-gray-500"} group-hover:text-gray-700 transition-colors`}
            />
          ) : (
            <ChevronDown
              size={20}
              className={`${themeColors.textColorSecondary ?? "text-gray-500"} group-hover:text-gray-700 transition-colors`}
            />
          )}
        </div>
      )}

      {/* 详细资助列表（带动画效果） */}
      <AnimatePresence initial={false}>
        {hasDetailed && isDetailedViewOpen && (
          <motion.div
            id="detailed-sponsorships-content"
            key="detailed-sponsorships-content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", marginTop: "0rem" },
              collapsed: { opacity: 0, height: 0, marginTop: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: "hidden" }}
          >
            {/* 使用网格布局显示详细资助 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {" "}
              {/* 两列网格布局 */}
              {sortedDetailed.map((sponsorship) => (
                <div
                  key={sponsorship.id}
                  className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm`}
                >
                  {" "}
                  {/* 使用div作为网格项 */}
                  {/* 资助图标 */}
                  <Landmark
                    size={16}
                    className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-400"}`}
                  />
                  <div>
                    {/* 资助内容 */}
                    <span>{sponsorship.content}</span>
                    {/* 显示链接（如果有） */}
                    {sponsorship.link_url && (
                      <a
                        href={sponsorship.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-1.5 text-xs ${themeColors.linkColor ?? "text-blue-600 hover:text-blue-800"} inline-flex items-center`}
                        aria-label={`Link for sponsorship item ${sponsorship.id}`}
                      >
                        <ExternalLink size={12} className="mr-0.5" /> Link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SponsorshipsSection;
