import React from 'react';
import { themeColors } from '@/styles/theme';

const HeroSection: React.FC = () => {
  return (
    <div className="relative w-full py-20 sm:py-40 overflow-hidden">
      {/* 背景渐变 - 使用更深的灰蓝色 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 opacity-95"></div>
      
      {/* 装饰性元素 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* 主标题 - 手机端使用更小的字体 */}
          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-slate-100 mb-4 sm:mb-6 transform transition-all duration-700 hover:scale-105">
            Generic Operational and Optimal Data Lab
          </h1>
          
          {/* 副标题 - 手机端使用更小的字体 */}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-serif leading-8 text-slate-200 mb-6 sm:mb-8 transform transition-all duration-700 hover:scale-105">
            泛在数据分析与优化实验室
          </h2>
          
          {/* 装饰性分隔线 - 添加长度变化的呼吸动画效果 */}
          <div className="h-1 bg-slate-400 mx-auto mb-6 sm:mb-8 rounded-full animate-[length_3s_ease-in-out_infinite] w-[60px] sm:w-[80px]" />
          <style jsx global>{`
            @keyframes length {
              0% { width: 60px; }
              50% { width: 200px; }
              100% { width: 60px; }
            }
            @media (min-width: 640px) {
              @keyframes length {
                0% { width: 80px; }
                50% { width: 120px; }
                100% { width: 80px; }
              }
            }
          `}</style>
          
          {/* 简短描述 - 手机端使用更小的字体 */}
          <p className="text-sm sm:text-base text-slate-300 transform transition-all duration-700 hover:scale-105">
            Advancing the frontiers of data analysis and optimization through innovative research
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 