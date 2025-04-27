import React from "react";
import ContentSection from "@/components/common/ContentSection";
import { themeColors } from "@/styles/theme";
import { AlertTriangle } from "lucide-react"; // Import icon for error display

/**
 * 学生研究兴趣展示组件
 *
 * 展示实验室学生感兴趣的研究领域和方向
 */

// Define the expected data structure for a single interest point item
interface InterestPointItem {
  id: number;
  title: string;
  description: string;
  // is_visible is handled server-side or during fetch
}

// Define the props for the StudentInterestsSection component
interface StudentInterestsSectionProps {
  items: InterestPointItem[] | null;
  error: string | null;
}

const StudentInterestsSection: React.FC<StudentInterestsSectionProps> = ({ items, error }) => {
  return (
    <ContentSection id="student-interests" title="Student Interests">
      {error ? (
        <div className={`flex items-center space-x-2 text-red-600 dark:text-red-400`}>
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>Error loading student interests: {error}</span>
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-10 md:space-y-12">
          {items.map((item) => (
            <div key={item.id}>
              <h3
                className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className={`${themeColors.textColorSecondary} text-sm md:text-base`}>
          Student interests information is not available at the moment.
        </p>
      )}
    </ContentSection>
  );
};

/**
 * 模块化设计说明：
 * - 展示学生研究方向的独立组件，丰富实验室整体研究生态展示
 * - 使用统一的ContentSection容器以保持视觉一致性
 * - 可独立扩展添加新的研究兴趣方向
 * - 采用与其他部分一致的UI设计语言
 * - 作为独立模块可单独维护更新，不影响其他页面组件
 */

export default StudentInterestsSection;
