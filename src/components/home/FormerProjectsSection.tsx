import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

const FormerProjectsSection = () => {
  return (
    <ContentSection id="former-projects" title="Former Projects">
      <div className="space-y-10 md:space-y-12">
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Ocean Database with Tempro-spatial Features</h3>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            We are interested in ocean data, which by no means are large, versatile, and unpredictable. For this, we are going to build a database for ocean data, in order to serve applications, such as weather forecast, current prediction, etc. This is uniquely interesting because there are so many things in the sea that we have little knowledge about. As such, we tend to build the knowledge on top of this and forward a underlying database to serve fast queries, SQL and newSQL, to better improve the work.
          </p>
        </div>
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>System Optimizations with Multiple Objectives</h3>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            We are trying to optimize all data services with metrics that are interesting, including but not limited to performance, throughput, energy, carbon, etc. Modeling and representation can help us better understand the world, as well as the data itself is a mimic of our on-going life. For a database system, we would like to shape it in a better way.
          </p>
        </div>
      </div>
    </ContentSection>
  );
};

export default FormerProjectsSection;
