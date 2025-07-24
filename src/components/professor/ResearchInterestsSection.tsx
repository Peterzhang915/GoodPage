import React from "react";
import { themeColors } from "@/styles/theme";

// 定义 props，interestsText 可选，便于后续动态传入
type ResearchInterestsSectionProps = {
  interestsText?: string | null; // Optional prop for dynamic content later
};

const defaultInterestsText = `
My research interests are primarily in the area of computing system design, with a particular focus on operating systems, storage systems, computer architecture, and their intersections. I am keen on building efficient, reliable, and scalable systems. Specific topics include persistent memory, file systems, key-value stores, virtualization, and system support for new hardware technologies. I am also interested in applying system design principles to solve problems in machine learning systems and high-performance computing.
`; // Default static text

const ResearchInterestsSection: React.FC<ResearchInterestsSectionProps> = ({
  interestsText,
}) => {
  // 优先使用 props 传入的 interestsText（即 member.research_interests），没有则用默认内容
  // 中文注释：如果传入了研究兴趣内容，则显示传入内容，否则显示默认内容
  const content = interestsText && interestsText.trim() !== "" ? interestsText : defaultInterestsText;

  return (
    <section id="interests">
      <h2
        className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
      >
        Research Interests
      </h2>
      {/* 使用 whitespace-pre-wrap 保留换行符，显示更友好 */}
      <div
        className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary ?? ""} whitespace-pre-wrap`}
      >
        {content}
      </div>
    </section>
  );
};

export default ResearchInterestsSection;
