"use client"; // 声明这是一个客户端组件

import React from 'react';
import { motion } from 'framer-motion'; // Import motion
// import { themeColors } from '@/styles/theme'; // 如果需要主题颜色，取消注释

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger delay between children
      delayChildren: 0.1   // Optional delay before starting the first child
    }
  }
};

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

const HeroSection: React.FC = () => {
  return (
    // 最外层容器: 相对定位，全宽，响应式垂直内边距，隐藏溢出
    <div className="relative w-full py-20 sm:py-32 md:py-40 overflow-hidden"> {/* 调整了 sm/md 的 padding */}

      {/* 背景渐变层: 绝对定位铺满父容器 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 opacity-95"></div>

      {/* 背景网格装饰层: 绝对定位，低透明度 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      {/* 内容容器: 相对定位，限制最大宽度并居中，响应式内边距 */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Animated container for staggering */} 
        <motion.div 
          className="text-center group transition-transform duration-700 ease-out hover:scale-[1.02] sm:hover:scale-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible" // Trigger animation on load
        >
          {/* Animated Main Title */}
          <motion.h1 
            variants={itemVariants} 
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold tracking-tight text-slate-100 mb-4 sm:mb-6"
          >
            Generic Operational and Optimal Data Lab
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.h2 
            variants={itemVariants}
            className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-serif leading-snug sm:leading-normal text-slate-200 mb-6 sm:mb-8"
          >
            泛在数据分析与优化实验室
          </motion.h2>

          {/* Animated Divider */}
          <motion.div
            variants={itemVariants}
            className="h-1 bg-slate-400 mx-auto mb-6 sm:mb-8 rounded-full w-[50px] sm:w-[80px] transition-[width] duration-400 ease-in-out sm:group-hover:w-[160px]"
          />

          {/* Animated Description */}
          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto"
          >
            Advancing the frontiers of data analysis and optimization through innovative research
          </motion.p>

        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;