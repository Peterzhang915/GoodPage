import React from "react";
import { Code, Database } from "lucide-react";
import { themeColors } from "@/styles/theme";
import type { SoftwareDataset, ArtefactType } from "@/lib/prisma"; // Import required types

type SoftwareDatasetsSectionProps = {
  softwareAndDatasets: SoftwareDataset[] | null | undefined;
};

const SoftwareDatasetsSection: React.FC<SoftwareDatasetsSectionProps> = ({
  softwareAndDatasets,
}) => {
  if (!softwareAndDatasets || softwareAndDatasets.length === 0) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <Code size={18} />/<Database size={18} /> Software & Datasets
      </h2>
      <ul className="space-y-4 list-none p-0 mt-3">
        {softwareAndDatasets.map((item) => (
          <li key={item.id} className="flex items-start gap-x-2.5">
            {item.type === "SOFTWARE" ? ( // Assuming ArtefactType is imported correctly
              <Code
                className={`w-4 h-4 mt-1 ${themeColors.primary} flex-shrink-0`}
              />
            ) : (
              <Database
                className={`w-4 h-4 mt-1 ${themeColors.primary} flex-shrink-0`}
              />
            )}
            <div className="flex-grow text-sm">
              <h4 className={`font-semibold ${themeColors.textColorPrimary}`}>
                {item.title}
              </h4>
              {item.description && (
                <p
                  className={`text-xs mt-0.5 ${themeColors.textColorSecondary}`}
                >
                  {item.description}
                </p>
              )}
              <div
                className={`flex flex-wrap items-center gap-x-2.5 text-xs mt-0.5 ${themeColors.textColorTertiary}`}
              >
                {item.version && <span>v{item.version}</span>}
                {item.license && <span>{item.license}</span>}
                {item.status && <span>{item.status}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 text-xs mt-0.5">
                {item.repository_url && (
                  <a
                    href={item.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${themeColors.linkColor} hover:underline`}
                  >
                    Repository
                  </a>
                )}
                {item.project_url && (
                  <a
                    href={item.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${themeColors.linkColor} hover:underline`}
                  >
                    Project/Demo
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SoftwareDatasetsSection;
