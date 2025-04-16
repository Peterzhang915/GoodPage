import React from "react";
import { GraduationCap } from "lucide-react";
import { themeColors } from "@/styles/theme";
import type { Education } from "@/lib/prisma"; // Import the Education type

type EducationSectionProps = {
  educationHistory: Education[] | null | undefined;
};

const EducationSection: React.FC<EducationSectionProps> = ({
  educationHistory,
}) => {
  // Only render if there is education history
  if (!educationHistory || educationHistory.length === 0) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <GraduationCap size={18} /> 教育背景
      </h2>
      <ul className="space-y-3 list-none p-0 mt-3">
        {educationHistory.map((edu) => (
          <li key={edu.id} className="flex items-start gap-x-2.5 text-sm">
            <div
              className={`w-1.5 h-1.5 mt-[7px] rounded-full ${themeColors.primaryBg} flex-shrink-0`}
            ></div>
            <div className="flex-grow">
              <p className={`font-semibold ${themeColors.textColorPrimary}`}>
                {edu.degree}
                {edu.field ? ` in ${edu.field}` : ""}
              </p>
              <p className={`${themeColors.textColorSecondary}`}>
                {edu.school}
              </p>
              <p className={`text-xs ${themeColors.textColorTertiary}`}>
                {edu.start_year} - {edu.end_year ?? "Present"}
              </p>
              {edu.thesis_title && (
                <p
                  className={`text-xs italic ${themeColors.textColorTertiary} mt-0.5`}
                >
                  Thesis: {edu.thesis_title}
                </p>
              )}
              {edu.description && (
                <p
                  className={`text-xs ${themeColors.textColorTertiary} mt-0.5`}
                >
                  {edu.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EducationSection;
