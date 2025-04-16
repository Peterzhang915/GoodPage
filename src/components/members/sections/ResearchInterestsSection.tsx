import React from "react";
import { Lightbulb } from "lucide-react";
import { themeColors } from "@/styles/theme";

type ResearchInterestsSectionProps = {
  research_interests: string | null | undefined;
};

const ResearchInterestsSection: React.FC<ResearchInterestsSectionProps> = ({
  research_interests,
}) => {
  const hasTags = research_interests && research_interests.trim().length > 0;

  if (!hasTags) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <Lightbulb size={18} /> 研究兴趣
      </h2>
      <div className="flex flex-wrap gap-2 mt-3">
        {research_interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((interest, index) => (
            <span
              key={index}
              className={`${themeColors.ccfBBg} ${themeColors.ccfAText} text-xs font-medium px-2.5 py-0.5 rounded-full`}
            >
              {interest}
            </span>
          ))}
      </div>
    </section>
  );
};

export default ResearchInterestsSection;
