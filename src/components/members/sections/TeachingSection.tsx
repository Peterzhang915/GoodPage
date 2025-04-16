import React from "react";
import { Building } from "lucide-react"; // Use Building or BookCopy etc.
import { themeColors } from "@/styles/theme";
import type { Teaching } from "@/lib/prisma"; // Import the Teaching type

type TeachingSectionProps = {
  teachingRoles: Teaching[] | null | undefined;
};

const TeachingSection: React.FC<TeachingSectionProps> = ({ teachingRoles }) => {
  if (!teachingRoles || teachingRoles.length === 0) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <Building size={18} /> 教学经历
      </h2>
      <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
        {teachingRoles.map((teach) => (
          <li key={teach.id} className={`${themeColors.textColorSecondary}`}>
            {teach.course_title}{" "}
            {teach.course_code ? `(${teach.course_code})` : ""}
            {teach.semester && `, ${teach.semester}`}
            {teach.role && teach.role !== "Instructor" ? (
              <span className="ml-1 text-xs">({teach.role})</span>
            ) : (
              ""
            )}
            {teach.description_url && (
              <a
                href={teach.description_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-1.5 text-xs ${themeColors.linkColor} hover:underline`}
              >
                [Details]
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TeachingSection;
