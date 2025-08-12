import React from "react";
import ContentSection from "@/components/common/ContentSection";
import { themeColors } from "@/styles/theme";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";

enum ProjectType {
  MAIN = "MAIN",
  FORMER = "FORMER",
}

interface HomepageProjectItem {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  project_url: string | null;
  type: ProjectType;
}

interface MainProjectsSectionProps {
  items: HomepageProjectItem[] | null;
  error: string | null;
}

const MainProjectsSection: React.FC<MainProjectsSectionProps> = ({
  items,
  error,
}) => {
  return (
    <ContentSection id="main-projects" title="Main Focus Projects">
      {error ? (
        <div
          className={`flex items-center space-x-2 text-red-600 dark:text-red-400`}
        >
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>Error loading main projects: {error}</span>
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-8 md:space-y-10">
          {items.map((item) => (
            <div key={item.id}>
              <h3
                className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}
              >
                {item.title}
              </h3>
              <div className="md:flex md:gap-6 md:items-start">
                <div className="md:flex-1">
                  <p
                    className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary} mb-4`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {item.description}
                  </p>
                  {item.project_url && (
                    <Link
                      href={item.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center text-sm font-medium ${themeColors.accentColor} hover:underline mt-2`}
                    >
                      <LinkIcon size={14} className="mr-1.5" />
                      Learn More / View Project
                    </Link>
                  )}
                </div>
                {item.image_url && (
                  <div className="md:w-1/4 lg:w-1/5 mt-4 md:mt-0 flex-shrink-0">
                    <div
                      className={`bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md border ${themeColors.devBorder}`}
                    >
                      <Image
                        src={item.image_url}
                        alt={`Image for ${item.title}`}
                        width={200}
                        height={150}
                        className="w-full h-auto object-cover aspect-[4/3]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={`${themeColors.textColorSecondary} text-sm md:text-base`}>
          Main project information is currently unavailable.
        </p>
      )}
    </ContentSection>
  );
};

export default MainProjectsSection;
