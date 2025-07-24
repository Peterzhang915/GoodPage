"use client"; // 标记为客户端组件

import React, { useState } from "react";
import type { Award } from "@prisma/client"; // 导入奖项数据类型
import { themeColors } from "@/styles/theme"; // 导入主题颜色
import { Trophy, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"; // 导入图标组件
import { motion, AnimatePresence } from "framer-motion"; // 导入动画组件

// 定义组件属性类型
type AwardsSectionProps = {
  featuredAwards: Award[]; // 特色/重要奖项列表
  detailedAwards: Award[]; // 详细奖项列表
  fetchError: string | null; // 获取数据时可能发生的错误
};

// 奖项部分组件
const AwardsSection: React.FC<AwardsSectionProps> = ({
  featuredAwards,
  detailedAwards,
  fetchError,
}) => {
  // 控制详细视图是否展开的状态
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  // 检查是否有特色和详细奖项数据
  const hasFeatured = featuredAwards.length > 0;
  const hasDetailed = detailedAwards.length > 0;

  // 切换详细视图的展开/收起状态
  const toggleDetailedView = () => {
    setIsDetailedViewOpen(!isDetailedViewOpen);
  };

  // 对奖项按显示顺序进行排序
  const sortedFeatured = [...featuredAwards].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const sortedDetailed = [...detailedAwards].sort(
    (a, b) => a.display_order - b.display_order,
  );

  return (
    <section id="awards" className="mb-8">
      {/* 奖项标题 */}
      <h2
        className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
      >
        Awards & Honors
      </h2>

      {/* 显示错误信息（如果有） */}
      {fetchError && (
        <p
          className={`text-red-600 dark:text-red-400 ${themeColors.backgroundWhite ?? "bg-red-50"} p-3 rounded-md mb-4`}
        >
          Error loading awards: {fetchError}
        </p>
      )}

      {/* 如果没有数据且没有错误，显示提示信息 */}
      {!fetchError && !hasFeatured && !hasDetailed && (
        <p className={`${themeColors.textColorSecondary ?? "text-gray-500"}`}>
          No award information available at the moment.
        </p>
      )}

      {/* 特色/重要奖项列表 */}
      {!fetchError && hasFeatured && (
        <ul className="list-none pl-0 space-y-2 md:space-y-3 mb-4">
          {sortedFeatured.map((award) => (
            <li
              key={award.id}
              className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm md:text-base`}
            >
              {/* 奖杯图标 */}
              <Trophy
                size={16}
                className={`mr-2 mt-1 flex-shrink-0 ${themeColors.ccfAText ?? "text-yellow-600"}`}
              />
              <div>
                {/* 奖项内容 */}
                <span>{award.content}</span>
                {/* 显示年份（如果有） */}
                {award.year && (
                  <span className="text-xs md:text-sm ml-1">
                    ({award.year})
                  </span>
                )}
                {/* 显示链接（如果有） */}
                {award.link_url && (
                  <a
                    href={award.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-1.5 text-xs ${themeColors.linkColor ?? "text-blue-600 hover:text-blue-800"} inline-flex items-center`}
                    aria-label={`Link for award`}
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
      {!fetchError && hasDetailed && (
        <div
          onClick={toggleDetailedView}
          className="flex flex-col items-center cursor-pointer py-2 group mb-4"
          aria-expanded={isDetailedViewOpen}
          aria-controls="detailed-awards-content"
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

      {/* 详细奖项列表（带动画效果） */}
      <AnimatePresence initial={false}>
        {!fetchError && hasDetailed && isDetailedViewOpen && (
          <motion.div
            id="detailed-awards-content"
            key="detailed-awards-content"
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
            {/* 使用网格布局显示详细奖项 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {sortedDetailed.map((award) => (
                <div
                  key={award.id}
                  className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm`}
                >
                  {/* 奖杯图标 */}
                  <Trophy
                    size={16}
                    className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-400"}`}
                  />
                  <div>
                    {/* 奖项内容 */}
                    <span>{award.content}</span>
                    {/* 显示年份（如果有） */}
                    {award.year && (
                      <span className="text-xs md:text-sm ml-1">
                        ({award.year})
                      </span>
                    )}
                    {/* 显示链接（如果有） */}
                    {award.link_url && (
                      <a
                        href={award.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-1.5 text-xs ${themeColors.linkColor ?? "text-blue-600 hover:text-blue-800"} inline-flex items-center`}
                        aria-label={`Link for award`}
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

export default AwardsSection;
