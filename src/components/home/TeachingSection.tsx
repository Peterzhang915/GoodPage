import React from "react";
import ContentSection from "@/components/common/ContentSection";
import { themeColors } from "@/styles/theme";
import { AlertTriangle } from "lucide-react"; // Import icon for error display

/**
 * 教学课程信息展示组件
 *
 * 功能与目的：
 * - 展示实验室教师历年来的教学课程和开设时间
 * - 突出教师在计算机科学和人工智能领域的教学经验和专业背景
 * - 彰显跨学科教学能力，涵盖AI、离散数学、操作系统和云计算等多个方向
 *
 * 数据特点：
 * - 按时间倒序排列，优先展示最近开设的课程
 * - 包含本科生和研究生层次的课程
 * - 显示每门课程的开设学期信息（如Fall 2024, Spring 2021等）
 *
 * 该组件采用无序列表形式展示，保持视觉简洁，同时通过响应式设计确保在各种屏幕尺寸上的可读性。
 *
 * 模块化设计：
 * - 作为主页内容的功能性板块，展示实验室的教学能力
 * - 使用共享的ContentSection容器组件，保持页面整体风格一致
 * - 可独立维护更新，添加新开设的课程而不影响其他组件
 * - 与StudentInterestsSection形成互补，共同构成教学与招生信息体系
 * - 遵循项目的颜色主题系统，确保视觉一致性
 */

// Define the expected data structure for a single teaching item
interface HomepageTeachingItem {
  id: number;
  course_title: string;
  details: string | null;
  // is_visible is handled server-side or during fetch
}

// Define the props for the TeachingSection component
interface TeachingSectionProps {
  items: HomepageTeachingItem[] | null;
  error: string | null;
}

const TeachingSection: React.FC<TeachingSectionProps> = ({ items, error }) => {
  return (
    <ContentSection id="teaching" title="Teaching">
      {/* Conditional Rendering based on error or items */}
      {error ? (
        <div className={`flex items-center space-x-2 text-red-600 dark:text-red-400`}>
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>Error loading teaching data: {error}</span>
        </div>
      ) : items && items.length > 0 ? (
        <ul
          className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}
        >
          {items.map((item) => (
            <li key={item.id}>
              <span className="font-medium text-gray-800 dark:text-gray-200">{item.course_title}</span>
              {item.details && <span className="ml-2 text-xs">({item.details})</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className={`${themeColors.textColorSecondary} text-sm md:text-base`}>
          No teaching information available at the moment.
        </p>
      )}
    </ContentSection>
  );
};

export default TeachingSection;
