import React from "react";
import { FileText as PatentIcon } from "lucide-react"; // Using FileText for Patent
import { themeColors } from "@/styles/theme";
import type { Patent } from "@/lib/prisma"; // Import the Patent type

type PatentsSectionProps = {
  patents: Patent[] | null | undefined;
};

const PatentsSection: React.FC<PatentsSectionProps> = ({ patents }) => {
  if (!patents || patents.length === 0) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <PatentIcon size={18} /> 专利
      </h2>
      <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
        {patents.map((patent) => (
          <li key={patent.id} className={`${themeColors.textColorSecondary}`}>
            {patent.title}
            {patent.patent_number ? ` (No. ${patent.patent_number})` : ""}
            {patent.status ? ` [${patent.status}]` : ""}
            {patent.issue_date ? `, Issued: ${patent.issue_date}` : ""}
            {patent.url && (
              <a
                href={patent.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-1.5 text-xs ${themeColors.linkColor} hover:underline`}
              >
                [Link]
              </a>
            )}
            {patent.inventors_string && (
              <span className="block text-xs italic">
                Inventors: {patent.inventors_string}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PatentsSection;
