import React from "react";
import { Briefcase } from "lucide-react";
import { themeColors } from "@/styles/theme";
import type { ProjectMember, Project } from "@/lib/prisma"; // Import required types

// Define a type for the project data including the nested project details
type ProjectMemberWithProject = ProjectMember & {
  project: Project; // Ensure project is included
};

type ProjectsSectionProps = {
  projects: ProjectMemberWithProject[] | null | undefined;
};

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <Briefcase size={18} /> Projects
      </h2>
      <ul className="space-y-4 list-none p-0 mt-3">
        {projects.map(({ project, role }) => (
          <li
            key={project.id}
            className={`border-l-3 ${themeColors.ccfBText} pl-3 py-1`}
          >
            {" "}
            {/* Slightly thinner border */}
            <h4
              className={`font-semibold ${themeColors.textColorPrimary} text-sm`}
            >
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {project.title}
                </a>
              ) : (
                project.title
              )}
              {role && (
                <span
                  className={`ml-1.5 text-xs font-normal px-1 py-0.5 rounded ${themeColors.ccfCBg} ${themeColors.textColorSecondary}`}
                >
                  ({role})
                </span>
              )}
            </h4>
            {project.description && (
              <p className={`text-xs mt-0.5 ${themeColors.textColorSecondary}`}>
                {project.description}
              </p>
            )}
            <p className={`text-xs mt-0.5 ${themeColors.textColorTertiary}`}>
              {project.status && (
                <span className="mr-1.5 font-medium">{project.status}</span>
              )}
              ({project.start_year ?? "?"} - {project.end_year ?? "Present"})
              {project.funding_source && (
                <span className="ml-1.5">
                  (Funded by {project.funding_source})
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProjectsSection;
