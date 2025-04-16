import React from 'react';
import { Award as AwardIcon } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import type { Award } from '@/lib/prisma'; // Import the Award type

type AwardsSectionProps = {
  awards: Award[] | null | undefined;
};

const AwardsSection: React.FC<AwardsSectionProps> = ({ awards }) => {
  if (!awards || awards.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}>
        <AwardIcon size={18}/> 所获荣誉
      </h2>
      <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
        {awards.map(award => (
          <li key={award.id} className={`${themeColors.textColorSecondary}`}>
            {award.link_url ? <a href={award.link_url} target='_blank' rel='noopener noreferrer' className='hover:underline'>{award.content}</a> : award.content}
            {award.year ? ` (${award.year})` : ''}
            {/* Note: organization and description were removed previously as they don't exist on the type */} 
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AwardsSection; 