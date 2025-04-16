import React from 'react';
import { Lightbulb } from 'lucide-react';
import { themeColors } from '@/styles/theme';

type ResearchInterestsSectionProps = {
  research_interests: string | null | undefined;
  research_statement_en: string | null | undefined;
  research_statement_zh: string | null | undefined;
};

const ResearchInterestsSection: React.FC<ResearchInterestsSectionProps> = ({
  research_interests,
  research_statement_en,
  research_statement_zh,
}) => {
  const hasStatement = research_statement_en || research_statement_zh;
  const hasTags = research_interests && research_interests.trim().length > 0;

  // Don't render the section if there is no statement and no tags
  if (!hasStatement && !hasTags) {
    return null;
  }

  return (
    <section>
      <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}>
        <Lightbulb size={18}/> 研究兴趣
      </h2>
      {/* Render statement if available */} 
      {hasStatement && (
        <div className="mt-3 space-y-2">
          {research_statement_zh && <p className={`${themeColors.textColorSecondary} text-sm leading-relaxed`}>{research_statement_zh}</p>}
          {research_statement_en && <p className={`${themeColors.textColorTertiary} italic text-sm leading-relaxed`}>{research_statement_en}</p>}
        </div>
      )}
      {/* Render tags if statement is not available and tags exist */} 
      {!hasStatement && hasTags && (
        <div className="flex flex-wrap gap-2 mt-3">
          {research_interests.split(',').map(s => s.trim()).filter(Boolean).map((interest, index) => (
            <span key={index} className={`${themeColors.ccfBBg} ${themeColors.ccfAText} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
              {interest}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

export default ResearchInterestsSection; 