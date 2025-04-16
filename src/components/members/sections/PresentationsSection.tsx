import React from 'react';
import { Presentation as PresentationIcon, Link as LinkIcon } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import type { Presentation } from '@/lib/prisma'; // Import the Presentation type

type PresentationsSectionProps = {
  presentations: Presentation[] | null | undefined;
};

const PresentationsSection: React.FC<PresentationsSectionProps> = ({ presentations }) => {
  if (!presentations || presentations.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}>
        <PresentationIcon size={18}/> 学术报告
      </h2>
      <ul className="space-y-3 list-none p-0 mt-3">
        {presentations.map(pres => (
          <li key={pres.id} className="text-sm">
            <p className={`font-semibold ${themeColors.textColorPrimary}`}>{pres.title}</p>
            {pres.event_name && <p className={`${themeColors.textColorSecondary}`}>{pres.event_name}</p>}
            <div className={`text-xs ${themeColors.textColorTertiary} flex items-center gap-x-2 mt-0.5`}>
              {pres.location && <span>{pres.location}</span>}
              {pres.year && <span>({pres.year})</span>}
              {pres.url && <a href={pres.url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline flex items-center gap-0.5`}><LinkIcon size={10}/> Slides/Video</a>}
            </div>
            {pres.is_invited && <span className={`text-xs font-medium px-1.5 py-0.5 rounded inline-block mt-1 ${themeColors.ccfBBg} ${themeColors.ccfAText}`}>Invited Talk</span>}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PresentationsSection; 