"use client"; // 需要因为 PhotoGallery 使用了 framer-motion

import React from 'react';
// import Navbar from '@/components/Navbar'; // 确认路径和导入正确
import PhotoGallery from '@/components/gallery/PhotoGallery'; // 确认路径和导入正确
import { themeColors } from '@/styles/theme';

export default function GalleryPage() {
  return (
    <div className="">
      {/* <Navbar /> 移除 Navbar 渲染 */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* 页面主标题 */}
        <h1 className={`text-3xl md:text-4xl font-serif font-bold mb-8 border-b select-none pb-3 ${themeColors.textColorPrimary}`}>
          Lab Photo Gallery
        </h1>

        {/* 照片墙组件 */}
        <PhotoGallery />

        {/* 可以在这里添加其他与画廊相关的内容 */}
      </main>
      {/* 暂时不添加 Footer */}
    </div>
  );
} 