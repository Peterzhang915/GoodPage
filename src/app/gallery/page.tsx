"use client";

/**
 * 实验室相册展示页面
 * 
 * 功能：
 * 1. 展示实验室相册中被标记为可见的图片
 * 2. 支持图片瀑布流布局
 * 3. 支持图片加载状态显示
 * 
 * 数据流：
 * 1. 组件加载时从 /api/gallery/photos 获取图片数据
 * 2. 只获取 category=Albums 且 show_in_albums=true 的图片
 * 3. 将获取的图片数据传递给 PhotoGallery 组件展示
 */

import React, { useEffect, useState } from "react";
import PhotoGallery from "@/components/gallery/PhotoGallery";
import { themeColors } from "@/styles/theme";
import type { GalleryImage } from "@/lib/types";

export default function GalleryPage() {
  // 存储图片数据的状态
  const [images, setImages] = useState<GalleryImage[]>([]);
  // 控制加载状态的显示
  const [loading, setLoading] = useState(true);

  // 组件加载时获取图片数据
  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      // 只请求在相册中显示的图片（show_in_albums=true）
      const res = await fetch("/api/gallery/photos?category=Albums&include_hidden=false");
      const data = await res.json();
      if (data.success) setImages(data.data);
      setLoading(false);
    }
    fetchImages();
  }, []);

  return (
    <div className="">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* 页面标题 */}
        <h1
          className={`text-3xl md:text-4xl font-serif font-bold mb-8 border-b select-none pb-3 ${themeColors.textColorPrimary}`}
        >
          Lab Photo Gallery
        </h1>
        {/* 图片展示组件：只传递可见的图片和加载状态 */}
        <PhotoGallery images={images} loading={loading} />
      </main>
    </div>
  );
}
