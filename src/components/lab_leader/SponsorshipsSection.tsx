'use client'; // Mark as a Client Component

import React, { useState } from 'react';
import type { Sponsorship } from '@prisma/client';
import { themeColors } from '@/styles/theme';
import { Landmark, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'; // Use Landmark icon for sponsorships and import icons for toggle
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

interface SponsorshipsSectionProps {
  featuredSponsorships: Sponsorship[];
  detailedSponsorships: Sponsorship[];
  // Add fetchError prop similar to other sections if needed later
  // fetchError?: string | null;
}

const SponsorshipsSection: React.FC<SponsorshipsSectionProps> = ({ 
  featuredSponsorships, 
  detailedSponsorships 
}) => {
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  const hasFeatured = featuredSponsorships.length > 0;
  const hasDetailed = detailedSponsorships.length > 0;

  if (!hasFeatured && !hasDetailed) {
    // Optional: Render a 'no data' message if needed
    return null; 
  }

  // Sort both lists (optional, can also be done in parent)
  const sortedFeatured = [...featuredSponsorships].sort((a, b) => a.display_order - b.display_order);
  const sortedDetailed = [...detailedSponsorships].sort((a, b) => a.display_order - b.display_order);

  const toggleDetailedView = () => {
    setIsDetailedViewOpen(!isDetailedViewOpen);
  };

  return (
    <section id="sponsorships" className="mb-8">
      <h2 className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>
        Grants & Sponsorships
      </h2>

      {/* Featured Sponsorships List */}
      {hasFeatured && (
        <ul className="list-none pl-0 space-y-2 md:space-y-3 mb-4"> {/* Added margin bottom */}
          {sortedFeatured.map((sponsorship) => (
            <li key={sponsorship.id} className={`flex items-start ${themeColors.textColorSecondary ?? ''} text-sm md:text-base`}>
              <Landmark size={16} className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? 'text-gray-500'}`} />
              <div>
                <span>{sponsorship.content}</span>
                {sponsorship.link_url && (
                  <a
                    href={sponsorship.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-1.5 text-xs ${themeColors.linkColor ?? 'text-blue-600 hover:text-blue-800'} inline-flex items-center`}
                    aria-label={`Link for sponsorship item ${sponsorship.id}`}
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
      {hasDetailed && (
        <div
          onClick={toggleDetailedView}
          className="flex flex-col items-center cursor-pointer py-2 group mb-4"
          aria-expanded={isDetailedViewOpen}
          aria-controls="detailed-sponsorships-content"
        >
          <hr className={`w-20 border-t ${themeColors.borderLight ?? 'border-gray-300'} group-hover:border-gray-500 transition-colors mb-1`} />
          <span className={`text-xs font-medium ${themeColors.textColorSecondary ?? 'text-gray-500'} group-hover:text-gray-700 transition-colors mb-1`}>
            {isDetailedViewOpen ? 'Collapse' : 'View All'}
          </span>
          {isDetailedViewOpen
            ? <ChevronUp size={20} className={`${themeColors.textColorSecondary ?? 'text-gray-500'} group-hover:text-gray-700 transition-colors`} />
            : <ChevronDown size={20} className={`${themeColors.textColorSecondary ?? 'text-gray-500'} group-hover:text-gray-700 transition-colors`} />}
        </div>
      )}

      {/* Animated Detailed Sponsorships List */}
      <AnimatePresence initial={false}>
        {hasDetailed && isDetailedViewOpen && (
          <motion.div
            id="detailed-sponsorships-content"
            key="detailed-sponsorships-content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', marginTop: '0rem' },
              collapsed: { opacity: 0, height: 0, marginTop: 0 }
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"> {/* Two-column grid */}
              {sortedDetailed.map((sponsorship) => (
                <div key={sponsorship.id} className={`flex items-start ${themeColors.textColorSecondary ?? ''} text-sm`}> {/* Use div for grid item */}
                  <Landmark size={16} className={`mr-2 mt-1 flex-shrink-0 ${themeColors.textColorTertiary ?? 'text-gray-400'}`} />
                  <div>
                    <span>{sponsorship.content}</span>
                    {sponsorship.link_url && (
                       <a
                        href={sponsorship.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-1.5 text-xs ${themeColors.linkColor ?? 'text-blue-600 hover:text-blue-800'} inline-flex items-center`}
                        aria-label={`Link for sponsorship item ${sponsorship.id}`}
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

export default SponsorshipsSection; 