// src/components/gallery/WaterfallView.tsx
"use client";

import React from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import type { GalleryImage } from "@/lib/types";

interface WaterfallViewProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  selectedCategory: string | null;
}

// 定义 Masonry 布局的断点
const breakpointColumnsObj = {
  default: 5,
  1536: 4, // 2xl
  1280: 3, // xl
  1024: 3, // lg
  768: 2, // md
  640: 1, // sm
};

const WaterfallView: React.FC<WaterfallViewProps> = ({
  images,
  onImageClick,
  selectedCategory,
}) => {
  const filteredImages = selectedCategory
    ? images.filter((img) => img.category === selectedCategory)
    : images; // 如果没有选择类别，显示所有图片

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid" // globals.css 中定义的类
        columnClassName="my-masonry-grid_column" // globals.css 中定义的类
      >
        {filteredImages.map((image) => (
          <motion.div
            key={image.id} // 确保有唯一的 key
            className="mb-4 overflow-hidden rounded-lg shadow-md cursor-pointer relative group"
            onClick={() => onImageClick(image)}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            layout // Enable layout animation for reordering
          >
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
            {/* 可以选择性地在图片上添加覆盖层或标题 */}
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
