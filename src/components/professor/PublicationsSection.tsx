import React from "react";
import { themeColors } from "@/styles/theme";
import type { PublicationInfo } from "@/lib/types";
import PublicationItem from "@/components/publications/PublicationItem";

// --- 主要的出版物部分组件 ---
type PublicationsSectionProps = {
  publications: PublicationInfo[];
  fetchError?: string | null;
};

const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  publications,
  fetchError,
}) => {
  return (
    <section id="publications">
      <h2
        className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
      >
        Selected Publications
      </h2>
      {fetchError && (
        <p
          className={`text-red-600 dark:text-red-400 ${themeColors.backgroundWhite ?? "bg-red-50"} p-3 rounded-md mb-4`}
        >
          Error: {fetchError}
        </p>
      )}
      {!fetchError && (
        <div className="list-none space-y-3 md:space-y-4">
          {publications.length > 0 ? (
            publications.map((pub) => (
              <PublicationItem
                key={pub.id ?? pub.title}
                pub={pub}
              />
            ))
          ) : (
            <p
              className={`${themeColors.textColorSecondary ?? "text-gray-500"}`}
            >
              No selected publications available at the moment.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default PublicationsSection;
