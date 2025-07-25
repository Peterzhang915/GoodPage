import React from "react";
import { BriefcaseBusiness } from "lucide-react";
import { themeColors } from "@/styles/theme";
import type { AcademicService } from "@prisma/client"; // Import the AcademicService type

type AcademicServicesSectionProps = {
  academicServices: AcademicService[] | null | undefined;
};

const AcademicServicesSection: React.FC<AcademicServicesSectionProps> = ({
  academicServices,
}) => {
  if (!academicServices || academicServices.length === 0) {
    return null;
  }

  // Sort services by display_order, then maybe by year as a fallback
  const sortedServices = [...academicServices].sort(
    (a, b) => (a.display_order ?? Infinity) - (b.display_order ?? Infinity) || (b.start_year ?? 0) - (a.start_year ?? 0)
  );

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <BriefcaseBusiness size={18} /> Academic Services
      </h2>
      <ul className="space-y-1.5 list-none pl-0 text-sm mt-3">
        {sortedServices.map((service) => (
          <li key={service.id} className={`${themeColors.textColorSecondary} flex items-start`}>
            <BriefcaseBusiness size={14} className={`mr-2 mt-[3px] flex-shrink-0 ${themeColors.textColorTertiary ?? 'text-gray-400'}`} />
            <div>
              <span className="font-medium">{service.role || 'Service'}</span>
              {service.organization && `at ${service.organization}`}
              {(service.start_year || service.end_year) && (
                <span className={`block text-xs ${themeColors.textColorTertiary ?? 'text-gray-500'}`}>
                  {service.start_year}
                  {service.end_year && service.start_year ? ` - ${service.end_year}` : ''}
                  {!service.start_year && service.end_year ? service.end_year : ''}
                  {service.start_year && !service.end_year ? ' - Present' : ''}
                </span>
              )}
              {service.description && <p className={`text-xs ${themeColors.textColorTertiary ?? 'text-gray-500'} mt-0.5`}>{service.description}</p>}
              {/* {service.website_url && 
                  <a href={service.website_url} target="_blank" rel="noopener noreferrer" className={`text-xs ${themeColors.link ?? 'text-blue-600 hover:underline'} block mt-0.5`}>
                      Website
                  </a>
              } */}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AcademicServicesSection;
