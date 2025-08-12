// src/components/gallery/WaterfallView.tsx
"use client";

import React from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import type { GalleryImage } from "@/lib/types";

/**
 * 瀑布流图片展示组件
 * 用于在相册页面以响应式瀑布流布局展示图片，支持分组、动画、点击放大等。
 *
 * 主要特性：
 * - 响应式断点，自动适配不同屏幕宽度
 * - 支持图片分组（按分类）
 * - 图片 hover 动画、点击事件
 * - 使用 framer-motion 实现进出场和 hover 动画
 * - 使用 react-masonry-css 实现瀑布流布局
 */

interface WaterfallViewProps {
  /**
   * 要展示的图片数组
   */
  images: GalleryImage[];
  /**
   * 图片点击回调（如弹出大图）
   */
  onImageClick: (image: GalleryImage) => void;
  /**
   * 当前选中的分类（可选）
   */
  selectedCategory: string | null;
}

// 定义 Masonry 布局的断点（屏幕宽度对应列数）
const breakpointColumnsObj = {
  default: 5, // 默认 5 列
  1536: 4, // 2xl 屏幕 4 列
  1280: 3, // xl 屏幕 3 列
  1024: 3, // lg 屏幕 3 列
  768: 2, // md 屏幕 2 列
  640: 1, // sm 屏幕 1 列
};

const WaterfallView: React.FC<WaterfallViewProps> = ({
  images,
  onImageClick,
  selectedCategory,
}) => {
  // 根据分类过滤图片（未选分类则显示全部）
  const filteredImages = selectedCategory
    ? images.filter((img) => img.category === selectedCategory)
    : images; // 如果没有选择类别，显示所有图片

  return (
    // 外层动画容器，控制整体进出场动画
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Masonry 瀑布流布局 */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid" // 外部容器类，需在全局样式定义
        columnClassName="my-masonry-grid_column" // 列容器类，需在全局样式定义
      >
        {filteredImages.map((image) => (
          // 单张图片卡片，带动画和点击事件
          <motion.div
            key={image.id} // 确保有唯一的 key
            className="mb-4 overflow-hidden rounded-lg shadow-md cursor-pointer relative group"
            onClick={() => onImageClick(image)}
            whileHover={{ scale: 1.03 }} // 悬停放大动画
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            layout // 启用布局动画，支持图片重排
          >
            {/* 图片本体，响应式宽高，hover 动画 */}
            <Image
              src={image.src}
              alt={image.alt}
              width={500} // 提供一个基础宽度用于计算初始宽高比
              height={300} // 提供一个基础高度
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // 响应式尺寸
              style={{
                width: "100%",
                height: "auto", // 让高度自动适应，保持宽高比
                display: "block",
              }}
              className="transition-transform duration-300 ease-in-out group-hover:scale-105"
              priority={filteredImages.indexOf(image) < 10} // 优先加载前几张图片
              unoptimized={image.src.endsWith(".gif")} // GIF 不优化
            />
            {/* 可选：图片覆盖层/标题，可自定义显示 */}
            {/* 
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-end p-2">
              <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">{image.alt}</p>
            </div>
            */}
          </motion.div>
        ))}
      </Masonry>
    </motion.div>
  );
};

export default WaterfallView;
