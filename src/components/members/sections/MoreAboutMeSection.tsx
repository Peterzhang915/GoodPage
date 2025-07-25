import React from "react";
import { Info } from "lucide-react"; // Using Info icon again
import { themeColors } from "@/styles/theme";

type MoreAboutMeSectionProps = {
  more_about_me: string | null | undefined;
};

const MoreAboutMeSection: React.FC<MoreAboutMeSectionProps> = ({
  more_about_me,
}) => {
  if (!more_about_me) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <Info size={18} /> More About Me
      </h2>
      {/* Assuming the content might contain newlines that should be preserved */}
      <div
        className={`text-sm leading-relaxed ${themeColors.textColorSecondary} whitespace-pre-wrap mt-3`}
      >
        {more_about_me}
      </div>
    </section>
  );
};

export default MoreAboutMeSection;
