"use client"; // Mark as a Client Component

import React, { useState } from "react";
import type { AcademicService } from "@prisma/client";
import { themeColors } from "@/styles/theme";
import {
  ClipboardList,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

type AcademicServicesSectionProps = {
  featuredServices: AcademicService[];
  detailedServices: AcademicService[];
  fetchError: string | null;
};

const AcademicServicesSection: React.FC<AcademicServicesSectionProps> = ({
  featuredServices,
  detailedServices,
  fetchError,
}) => {
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  const hasFeatured = featuredServices.length > 0;
  const hasDetailed = detailedServices.length > 0;

  const toggleDetailedView = () => {
    setIsDetailedViewOpen(!isDetailedViewOpen);
  };

  // Sorting (optional)
  const sortedFeatured = [...featuredServices].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const sortedDetailed = [...detailedServices].sort(
    (a, b) => a.display_order - b.display_order,
  );

  return (
    <section id="academic-services" className="mb-8">
      <h2
        className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? "border-gray-300"} ${themeColors.textColorPrimary ?? ""}`}
      >
        Academic Services
      </h2>

      {fetchError && (
        <p
          className={`text-red-600 dark:text-red-400 ${themeColors.backgroundWhite ?? "bg-red-50"} p-3 rounded-md mb-4`}
        >
          Error loading academic services: {fetchError}
        </p>
      )}

      {!fetchError && !hasFeatured && !hasDetailed && (
        <p className={`${themeColors.textColorSecondary ?? "text-gray-500"}`}>
          No academic service information available at the moment.
        </p>
      )}

      {/* Featured Services List */}
      {!fetchError && hasFeatured && (
        <ul className="list-none pl-0 space-y-2 md:space-y-3 mb-4">
          {sortedFeatured.map((service) => (
            <li
              key={service.id}
              className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm md:text-base`}
            >
              <ClipboardList
                size={16}
                className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-500"}`}
              />
              <div>
                {service.content}
                {/* Add link rendering if AcademicService schema includes link_url */}
                {/* {service.link_url && ... } */}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* New Expand/Collapse Trigger with Text */}
      {!fetchError && hasDetailed && (
        <div
          onClick={toggleDetailedView}
          className="flex flex-col items-center cursor-pointer py-2 group mb-4"
          aria-expanded={isDetailedViewOpen}
          aria-controls="detailed-services-content"
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

      {/* Animated Detailed Services List */}
      <AnimatePresence initial={false}>
        {!fetchError && hasDetailed && isDetailedViewOpen && (
          <motion.div
            id="detailed-services-content"
            key="detailed-services-content"
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
              {" "}
              {/* Two-column grid */}
              {sortedDetailed.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-start ${themeColors.textColorSecondary ?? ""} text-sm`}
                >
                  {" "}
                  {/* Use div for grid item */}
                  <ClipboardList
                    size={16}
                    className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? "text-gray-400"}`}
                  />
                  <div>
                    {service.content}
                    {/* Add link rendering if AcademicService schema includes link_url */}
                    {/* {service.link_url && ... } */}
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

export default AcademicServicesSection;
