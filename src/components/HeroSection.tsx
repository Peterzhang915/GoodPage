"use client"; // 声明这是一个客户端组件

import React from 'react';
// import { themeColors } from '@/styles/theme'; // 如果需要主题颜色，取消注释

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
        {/* 文本居中容器: 应用整体的 hover 效果 */}
        <div className="text-center group transform transition-transform duration-700 ease-out hover:scale-[1.02]"> {/* 将 hover 效果移至父级 */}

          {/* 主标题: 响应式字体大小 (增加 lg/xl 断点)，Serif 字体，加粗，字母间距，颜色，下外边距 */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold tracking-tight text-slate-100 mb-4 sm:mb-6">
          {/* 响应式调整: text-xl -> text-2xl, md:text-4xl -> lg:text-4xl, xl:text-5xl */}
            Generic Operational and Optimal Data Lab
          </h1>

          {/* 副标题: 响应式字体大小，Serif 字体，行高，颜色，下外边距 */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-serif leading-snug sm:leading-normal text-slate-200 mb-6 sm:mb-8">
          {/* 响应式调整: text-lg -> text-xl, md:text-3xl -> lg:text-3xl, xl:text-4xl. 调整行高 */}
            泛在数据分析与优化实验室
          </h2>

          {/* 装饰性分隔线: 高度，背景色，居中，下外边距，圆角，响应式初始宽度，响应式动画 */}
          <div
            className="h-1 bg-slate-400 mx-auto mb-6 sm:mb-8 rounded-full w-[50px] sm:w-[80px] animate-[length-mobile] sm:animate-[length-desktop]"
            // 修改: 初始宽度 w-[60px] -> w-[50px] 以匹配动画
            // 修改: 应用响应式动画名称
          />
          {/* 定义响应式动画关键帧 */}
          <style jsx global>{`
            /* 小屏幕动画 */
            @keyframes length-mobile {
              0% { width: 50px; }   /* 匹配 w-[50px] */
              50% { width: 100px; } /* 适度扩展 */
              100% { width: 50px; }
            }
            /* 大屏幕动画 (sm 及以上) */
            @keyframes length-desktop {
              0% { width: 80px; }   /* 匹配 sm:w-[80px] */
              50% { width: 160px; } /* 更大范围扩展 */
              100% { width: 80px; }
            }
            /* 旧的 @media 查询方式不再需要，因为动画切换由 Tailwind 类控制 */
          `}</style>

          {/* 简短描述: 响应式字体大小，颜色 */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto">
          {/* 响应式调整: 增加 lg:text-lg. 添加 max-w-3xl mx-auto 限制段落宽度使其更易读 */}
            Advancing the frontiers of data analysis and optimization through innovative research
          </p>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;