import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

/**
 * 实验室历史研究项目展示组件
 * 
 * 展示实验室已完成或过渡性质的研究方向，但仍具有学术价值
 */
const FormerProjectsSection = () => {
  return (
    <ContentSection id="former-projects" title="Former Projects">
      <div className="space-y-10 md:space-y-12">
        {/**
         * 海洋数据库与时空特性项目
         * 专注于建设高效处理海洋大数据的数据库系统
         */}
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Ocean Database with Tempro-spatial Features</h3>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            We are interested in ocean data, which by no means are large, versatile, and unpredictable. For this, we are going to build a database for ocean data, in order to serve applications, such as weather forecast, current prediction, etc. This is uniquely interesting because there are so many things in the sea that we have little knowledge about. As such, we tend to build the knowledge on top of this and forward a underlying database to serve fast queries, SQL and newSQL, to better improve the work.
          </p>
        </div>
        
        {/**
         * 多目标系统优化项目
         * 从多维度（性能、吞吐量、能耗、碳排放等）优化数据服务
         */}
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

/**
 * 模块化设计说明：
 * - 作为MainProjectsSection的配套组件，展示实验室研究的完整脉络
 * - 共享ContentSection容器组件，维持整个主页的视觉风格统一
 * - 完全独立的功能单元，可单独维护或更新内容
 * - 采用与MainProjectsSection一致的样式系统和主题变量
 * - 作为扩展组件，可根据需要进一步增加历史项目条目或添加图片展示
 */

export default FormerProjectsSection;
