"use client";

import React, { useState } from "react";
import type { Award } from "@prisma/client";
import { themeColors } from "@/styles/theme";
import { Trophy, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AwardsSectionProps = {
  featuredAwards: Award[];
  detailedAwards: Award[];
  fetchError: string | null;
};

const AwardsSection: React.FC<AwardsSectionProps> = ({
  featuredAwards,
  detailedAwards,
  fetchError,
}) => {
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  const hasFeatured = featuredAwards.length > 0;
  const hasDetailed = detailedAwards.length > 0;

  const toggleDetailedView = () => {
    setIsDetailedViewOpen(!isDetailedViewOpen);
  };

  // Sorting (optional, can also be done in parent)
  const sortedFeatured = [...featuredAwards].sort(
    (a, b) => a.display_order - b.display_order
  );
  const sortedDetailed = [...detailedAwards].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <section id="awards" className="mb-8">
      <h2
        className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
      >
        Awards & Honors
      </h2>

      {fetchError && (
        <p
          className={`text-red-600 dark:text-red-400 ${themeColors.backgroundWhite ?? "bg-red-50"} p-3 rounded-md mb-4`}
        >
          Error loading awards: {fetchError}
        </p>
      )}

      {!fetchError && !hasFeatured && !hasDetailed && (
        <p className={`${themeColors.textColorSecondary ?? "text-gray-500"}`}>
          No award information available at the moment.
        </p>
      )}

      {!fetchError && hasFeatured && (
        <ul className="list-none pl-0 space-y-2 md:space-y-3 mb-4">
          {sortedFeatured.map((award) => (
            <li
              key={award.id}
              className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm md:text-base`}
            >
              <Trophy
                size={16}
                className={`mr-2 mt-1 flex-shrink-0 ${themeColors.ccfAText ?? "text-yellow-600"}`}
              />
              <div>
                <span>{award.content}</span>
                {award.year && (
                  <span className="text-xs md:text-sm ml-1">
                    ({award.year})
                  </span>
                )}
                {award.link_url && (
                  <a
                    href={award.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-1.5 text-xs ${themeColors.linkColor ?? "text-blue-600 hover:text-blue-800"} inline-flex items-center`}
                    aria-label={`Link for award`}
                  >
                    <ExternalLink size={12} className="mr-0.5" /> Link
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Expand/Collapse Trigger with Text */}
      {!fetchError && hasDetailed && (
        <div
          onClick={toggleDetailedView}
          className="flex flex-col items-center cursor-pointer py-2 group mb-4"
          aria-expanded={isDetailedViewOpen}
          aria-controls="detailed-awards-content"
        >
          <hr
            className={`w-20 border-t ${themeColors.borderLight ?? "border-gray-300"} group-hover:border-gray-500 transition-colors mb-1`}
          />
          <span
            className={`text-xs font-medium ${themeColors.textColorSecondary ?? "text-gray-500"} group-hover:text-gray-700 transition-colors mb-1`}
          >
            {isDetailedViewOpen ? "Collapse" : "View All"}
          </span>
          {isDetailedViewOpen ? (
            <ChevronUp
              size={20}
              className={`${themeColors.textColorSecondary ?? "text-gray-500"} group-hover:text-gray-700 transition-colors`}
            />
          ) : (
            <ChevronDown
              size={20}
              className={`${themeColors.textColorSecondary ?? "text-gray-500"} group-hover:text-gray-700 transition-colors`}
            />
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {!fetchError && hasDetailed && isDetailedViewOpen && (
          <motion.div
            id="detailed-awards-content"
            key="detailed-awards-content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", marginTop: "0rem" },
              collapsed: { opacity: 0, height: 0, marginTop: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {sortedDetailed.map((award) => (
                <div
                  key={award.id}
                  className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm`}
                >
                  <Trophy
                    size={16}
                    className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-400"}`}
                  />
                  <div>
                    <span>{award.content}</span>
                    {award.year && (
                      <span className="text-xs md:text-sm ml-1">
                        ({award.year})
                      </span>
                    )}
                    {award.link_url && (
                      <a
                        href={award.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-1.5 text-xs ${themeColors.linkColor ?? "text-blue-600 hover:text-blue-800"} inline-flex items-center`}
                        aria-label={`Link for award`}
                      >
                        <ExternalLink size={12} className="mr-0.5" /> Link
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AwardsSection;
