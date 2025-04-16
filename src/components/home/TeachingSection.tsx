import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

/**
 * 教学课程信息展示组件
 * 
 * 功能与目的：
 * - 展示实验室教师历年来的教学课程和开设时间
 * - 突出教师在计算机科学和人工智能领域的教学经验和专业背景
 * - 彰显跨学科教学能力，涵盖AI、离散数学、操作系统和云计算等多个方向
 * 
 * 数据特点：
 * - 按时间倒序排列，优先展示最近开设的课程
 * - 包含本科生和研究生层次的课程
 * - 显示每门课程的开设学期信息（如Fall 2024, Spring 2021等）
 * 
 * 该组件采用无序列表形式展示，保持视觉简洁，同时通过响应式设计确保在各种屏幕尺寸上的可读性。
 */
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
