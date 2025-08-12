"use client"; // 标记为客户端组件

import React, { useState } from "react";
import type { AcademicService } from "@prisma/client"; // 导入学术服务类型
import { themeColors } from "@/styles/theme"; // 导入主题颜色
import {
  ClipboardList, // 剪贴板图标，用于学术服务项
  ExternalLink, // 外部链接图标
  ChevronDown, // 向下箭头图标，用于展开详细视图
  ChevronUp, // 向上箭头图标，用于收起详细视图
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // 导入动画组件

// 定义组件属性类型
type AcademicServicesSectionProps = {
  featuredServices: AcademicService[]; // 特色/重要学术服务列表
  detailedServices: AcademicService[]; // 详细学术服务列表
  fetchError: string | null; // 获取数据时可能发生的错误
};

// 学术服务部分组件
const AcademicServicesSection: React.FC<AcademicServicesSectionProps> = ({
  featuredServices,
  detailedServices,
  fetchError,
}) => {
  // 控制详细视图是否展开的状态
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  // 检查是否有特色和详细学术服务数据
  const hasFeatured = featuredServices.length > 0;
  const hasDetailed = detailedServices.length > 0;

  // 切换详细视图的展开/收起状态
  const toggleDetailedView = () => {
    setIsDetailedViewOpen(!isDetailedViewOpen);
  };

  // 对学术服务按显示顺序进行排序
  const sortedFeatured = [...featuredServices].sort(
    (a, b) => a.display_order - b.display_order
  );
  const sortedDetailed = [...detailedServices].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <section id="academic-services" className="mb-8">
      {/* 学术服务标题 */}
      <h2
        className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
      >
        Academic Services
      </h2>

      {/* 显示错误信息（如果有） */}
      {fetchError && (
        <p
          className={`text-red-600 dark:text-red-400 ${themeColors.backgroundWhite ?? "bg-red-50"} p-3 rounded-md mb-4`}
        >
          Error loading academic services: {fetchError}
        </p>
      )}

      {/* 如果没有数据且没有错误，显示提示信息 */}
      {!fetchError && !hasFeatured && !hasDetailed && (
        <p className={`${themeColors.textColorSecondary ?? "text-gray-500"}`}>
          No academic service information available at the moment.
        </p>
      )}

      {/* 特色/重要学术服务列表 */}
      {!fetchError && hasFeatured && (
        <ul className="list-none pl-0 space-y-2 md:space-y-3 mb-4">
          {sortedFeatured.map((service) => (
            <li
              key={service.id}
              className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm md:text-base`}
            >
              {/* 学术服务图标 */}
              <ClipboardList
                size={16}
                className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-500"}`}
              />
              <div>
                {/* 显示角色和组织 */}
                <span className="font-medium">{service.role}</span> at{" "}
                {service.organization}
                {/* 显示服务期间（如果有） */}
                {(service.start_year || service.end_year) && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {service.start_year}
                    {service.end_year && service.start_year
                      ? ` - ${service.end_year}`
                      : ""}
                    {!service.start_year && service.end_year
                      ? service.end_year
                      : ""}
                    {service.start_year && !service.end_year
                      ? " - Present"
                      : ""}
                  </span>
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
          aria-controls="detailed-services-content"
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

      {/* 详细学术服务列表（带动画效果） */}
      <AnimatePresence initial={false}>
        {!fetchError && hasDetailed && isDetailedViewOpen && (
          <motion.div
            id="detailed-services-content"
            key="detailed-services-content"
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
            {/* 使用网格布局显示详细学术服务 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {sortedDetailed.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm`}
                >
                  {/* 学术服务图标 */}
                  <ClipboardList
                    size={16}
                    className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-400"}`}
                  />
                  <div>
                    {/* 显示角色和组织 */}
                    <span className="font-medium">{service.role}</span> at{" "}
                    {service.organization}
                    {/* 显示服务期间（如果有） */}
                    {(service.start_year || service.end_year) && (
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {service.start_year}
                        {service.end_year && service.start_year
                          ? ` - ${service.end_year}`
                          : ""}
                        {!service.start_year && service.end_year
                          ? service.end_year
                          : ""}
                        {service.start_year && !service.end_year
                          ? " - Present"
                          : ""}
                      </span>
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

export default AcademicServicesSection;
