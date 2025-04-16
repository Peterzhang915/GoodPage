"use client"; // 声明这是一个客户端组件

import React from 'react';
import { motion } from 'framer-motion'; // Import motion
// import { themeColors } from '@/styles/theme'; // 如果需要主题颜色，取消注释

/**
 * 实验室主页顶部横幅组件
 * 
 * 作为网站的视觉焦点，展示实验室的核心身份信息：
 * - 完整英文名称："Generic Operational and Optimal Data Lab"
 * - 中文名称："泛在数据分析与优化实验室"
 * - 简短宣言："Good Data Inspired AI Infinite System and Beyond"
 * 
 * 视觉特性：
 * - 采用深色渐变背景与微妙网格纹理，增强科技感和专业性
 * - 使用Framer Motion实现元素的交错进入动画，增加页面活力
 * - 包含微妙的悬停效果，提高用户互动体验
 * 
 * 技术实现：
 * - 客户端组件，允许使用交互功能和动画效果
 * - 完全响应式设计，适配从移动设备到桌面屏幕的各种尺寸
 * - 元素进入使用错开的透明度和位移动画，提供平滑转场
 * 
 * 模块化设计：
 * - 作为主页的顶层组件，是访问者首先看到的内容，塑造网站第一印象
 * - 独立于其他内容区块，不依赖任何API或外部数据
 * - 使用客户端组件声明("use client")以启用动画效果
 * - 与主页其他模块（如MainProjectsSection等）形成完整的页面结构
 * - 具有自包含的动画配置，易于维护和调整
 */
const HeroSection: React.FC = () => {
  // Framer Motion容器动画配置：控制整体透明度和子元素动画错开展示
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // 子元素动画之间的延迟
        delayChildren: 0.1     // 第一个子元素开始前的延迟
      }
    }
  };

  // 单个元素的动画配置：控制透明度和垂直滑入效果
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: 'easeOut' 
      }
    }
  };

  return (
    // 最外层容器：相对定位，全宽，响应式垂直内边距，隐藏溢出
    <div className="relative w-full py-20 sm:py-32 md:py-40 overflow-hidden">

      {/* 背景渐变层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 opacity-95"></div>

      {/* 背景网格装饰层 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      {/* 内容容器 */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 动画容器 */} 
        <motion.div 
          className="text-center group transition-transform duration-700 ease-out hover:scale-[1.02] sm:hover:scale-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 英文标题 */}
          <motion.h1 
            variants={itemVariants} 
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold tracking-tight text-slate-100 mb-4 sm:mb-6"
          >
            Generic Operational and Optimal Data Lab
          </motion.h1>

          {/* 中文标题 */}
          <motion.h2 
            variants={itemVariants}
            className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-serif leading-snug sm:leading-normal text-slate-200 mb-6 sm:mb-8"
          >
            泛在数据分析与优化实验室
          </motion.h2>

          {/* 分隔线 */}
          <motion.div
            variants={itemVariants}
            className="h-1 bg-slate-400 mx-auto mb-6 sm:mb-8 rounded-full w-[50px] sm:w-[80px] transition-[width] duration-400 ease-in-out sm:group-hover:w-[160px]"
          />

          {/* 简短介绍 */}
          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto"
          >
            Good Data Inspired AI Infinite System and Beyond
          </motion.p>

        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;