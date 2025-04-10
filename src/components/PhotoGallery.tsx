import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // 导入 Next.js Image 组件

// 定义图片数据接口
interface GalleryImage {
  id: number | string; // 添加唯一 ID
  src: string;
  alt: string;
  caption?: string;
  date?: string;
}

// 1. 准备真实图片数据 (示例，请替换)
const images: GalleryImage[] = [
  // 添加几条示例数据，您需要用实际图片路径和信息替换
  { id: 1, src: '/images/gallery/placeholder1.jpg', alt: 'Placeholder 1', caption: '示例活动 1', date: '2025.01.01' },
  { id: 2, src: '/images/gallery/placeholder2.jpg', alt: 'Placeholder 2', caption: '示例会议', date: '2024.12.15' },
  { id: 3, src: '/images/gallery/placeholder3.jpg', alt: 'Placeholder 3', caption: '毕业合影', date: '2024.06.10' },
  { id: 4, src: '/images/gallery/placeholder4.jpg', alt: 'Placeholder 4', caption: '团建活动', date: '2024.08.20' },
  { id: 5, src: '/images/gallery/placeholder5.jpg', alt: 'Placeholder 5', caption: '羽毛球周常', date: '2025.03.10' },
  // ... 添加更多图片信息
];

// 确保图片数量足够多以填满滚动区域，如果不够，可以复制
const itemsToRender = images.length >= 10 ? images : [...images, ...images, ...images].slice(0, 10); // 示例：至少渲染 10 个，不够就重复

// 复制数据以实现无缝滚动
const doubledItems = [...itemsToRender, ...itemsToRender];

const PhotoGallery: React.FC = () => {
  // 调整尺寸以适应图片
  const itemWidth = 256; // px (例如 w-64)
  const itemHeight = 192; // px (例如 h-48)
  const gap = 16; // px (gap-4)
  const totalWidthPerItem = itemWidth + gap;
  const contentWidth = itemsToRender.length * totalWidthPerItem;

  const scrollVariants = {
    animate: {
      x: [-contentWidth, 0],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: itemsToRender.length * 4, // 调整滚动速度
          ease: 'linear',
        },
      },
    },
  };

  return (
    <div className="w-full overflow-hidden relative bg-gray-100" style={{ height: `${itemHeight + 32}px`}}> {/* 根据图片高度调整容器高度 */}
      {/* 添加左右渐变遮罩，使滚动看起来更自然 (可选) */}
       <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
       <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-gray-100 to-transparent z-10"></div>

      {/* 3. 内层滚动容器: flex布局，应用动画 */}
      <motion.div
        className="flex items-center h-full gap-4 pr-4"
        style={{ width: `${contentWidth * 2}px` }}
        variants={scrollVariants}
        animate="animate"
      >
        {/* 4. 渲染真实图片 */}
        {doubledItems.map((image, index) => (
          <div
            key={`${image.id}-${index}`} // 使用组合 key 提高稳定性
            className="relative flex-shrink-0 overflow-hidden rounded shadow-md group" // 添加 group 用于悬停效果
            style={{ width: `${itemWidth}px`, height: `${itemHeight}px`}}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={itemWidth} // 提供明确的宽度
              height={itemHeight} // 提供明确的高度
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" // 默认覆盖，悬停时放大
              priority={index < itemsToRender.length} // 优先加载第一组图片
              unoptimized={image.src.endsWith('.gif')} // 如果使用 GIF，避免优化
            />
            {/* 悬停时显示图片信息 (可选) */}
            {(image.caption || image.date) && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex flex-col justify-end p-3 text-white opacity-0 group-hover:opacity-100">
                {image.caption && <p className="font-semibold text-sm truncate">{image.caption}</p>}
                {image.date && <p className="text-xs">{image.date}</p>}
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default PhotoGallery; 