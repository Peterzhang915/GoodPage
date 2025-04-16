import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

/**
 * 学生研究兴趣展示组件
 * 
 * 展示实验室学生感兴趣的研究领域和方向
 */
const StudentInterestsSection = () => {
  return (
    <ContentSection id="student-interests" title="Student Interests">
      <div className="space-y-10 md:space-y-12">
        {/**
         * 函数式编程与实现研究
         * 关注函数式编程范式在现代编程环境中的应用
         */}
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Functional Programming and Implementation</h3>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            Functional programming is a programming paradigm where programs are constructed by applying and composing functions. The paradigm has been widely used in the context of compiler, high-performance computing, etc. We aim to leverage functional programming to build efficient systems.
          </p>
        </div>
        
        {/**
         * 编译系统与上下文敏感性研究
         * 探索编译器设计和上下文敏感分析技术
         */}
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Compile Systems and Context Sensitivity</h3>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            Compiler technology is the foundation of modern programming languages and systems. We are particularly interested in the context-sensitive analysis of programs, which provides deeper insights into program behavior and potential optimizations.
          </p>
        </div>
        
        {/**
         * 分布式系统与一致性研究
         * 研究分布式环境下的数据一致性问题和解决方案
         */}
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Distributed Systems and Consistency</h3>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            In distributed systems, ensuring data consistency across multiple nodes is challenging but crucial. We're exploring novel approaches to maintain consistency without sacrificing performance, especially in dynamic network environments.
          </p>
        </div>
      </div>
    </ContentSection>
  );
};

/**
 * 模块化设计说明：
 * - 展示学生研究方向的独立组件，丰富实验室整体研究生态展示
 * - 使用统一的ContentSection容器以保持视觉一致性
 * - 可独立扩展添加新的研究兴趣方向
 * - 采用与其他部分一致的UI设计语言
 * - 作为独立模块可单独维护更新，不影响其他页面组件
 */

export default StudentInterestsSection;
