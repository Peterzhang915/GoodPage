import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

const TeachingSection = () => {
  return (
    <ContentSection id="teaching" title="Teaching">
      <ul className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}>
        <li>Introduction to Artificial Intelligence (Fall 2024, Fall 2023, Fall 2022, Spring 2021, 2020)</li>
        <li>Discrete Mathematics (Fall 2024, Fall 2023, Fall 2022, Spring 2021, 2020)</li>
        <li>Operating Systems (Fall 2019)</li>
        <li>Cloud Computing (Spring 2019)</li>
        <li>Introduction to Cloud Computing (Fall 2018)</li>
        <li>Network Protocol Analysis (Fall 2018)</li>
        <li>Aritificial Intelligent Computing Systems (Fall 2023, Fall 2022, Spring 2021, Spring 2019, Summer 2018)</li>
        <li>Linux Programming (Spring 2018)</li>
        <li>Data Structure (Fall 2017)</li>
        <li>Graduate Course Introduction to Combinatorics (Fall 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017)</li>
      </ul>
    </ContentSection>
  );
};

export default TeachingSection;
