import React from 'react';
import { BriefcaseBusiness } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import type { AcademicService } from '@/lib/prisma'; // Import the AcademicService type

type AcademicServicesSectionProps = {
  academicServices: AcademicService[] | null | undefined;
};

const AcademicServicesSection: React.FC<AcademicServicesSectionProps> = ({ academicServices }) => {
  if (!academicServices || academicServices.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}>
        <BriefcaseBusiness size={18}/> 学术服务
      </h2>
      <ul className="space-y-1 list-disc pl-5 text-sm mt-3">
        {academicServices.map(service => (
          <li key={service.id} className={`${themeColors.textColorSecondary}`}>
            {service.content}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AcademicServicesSection; 