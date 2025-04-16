import React from 'react';
import { Info } from 'lucide-react';
import { themeColors } from '@/styles/theme';

type BioSectionProps = {
  bio_zh: string | null | undefined;
  bio_en: string | null | undefined;
};

const BioSection: React.FC<BioSectionProps> = ({ bio_zh, bio_en }) => {
  // Only render the section if there's content
  if (!bio_zh && !bio_en) {
    return null;
  }

  return (
    <section>
      {/* V1 Heading Style */}
      <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}>
        <Info size={18}/>个人简介
      </h2>
      {bio_zh && <p className={`${themeColors.textColorSecondary} text-sm leading-relaxed mb-2`}>{bio_zh}</p>}
      {bio_en && <p className={`${themeColors.textColorTertiary} italic text-sm leading-relaxed`}>{bio_en}</p>}
    </section>
  );
};

export default BioSection; 