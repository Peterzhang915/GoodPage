// src/components/WaterfallView.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Masonry from 'react-masonry-css'; // 导入 Masonry 组件
import { GalleryImage } from './PhotoGallery'; // 假设 GalleryImage 已导出或移动
import { themeColors } from '@/styles/theme';

interface WaterfallViewProps {
  category: string;
  images: GalleryImage[];
  onReturn?: () => void; // 返回回调（可选）
  onImageClick: (image: GalleryImage) => void;
  originRect?: DOMRect | null; // 动画起始矩形信息（可选）
}

// 定义 Masonry 布局的响应式断点和列数
const breakpointColumnsObj = {
  default: 5, // 默认列数（超宽屏）
  1280: 4,    // >= 1280px
  1024: 3,    // >= 1024px
  768: 2,     // >= 768px
  640: 1      // >= 640px（或更小）
};

const WaterfallView: React.FC<WaterfallViewProps> = ({
    category, // 分类，用于数据过滤
    images,
    onImageClick,
    originRect, // 接收动画起始位置
}) => {
  // 如果没有图片，显示提示信息
  if (!images || images.length === 0) {
    return <div className="p-4 text-center text-gray-500">该分类下暂无照片。</div>;
  }

  // --- Framer Motion 动画配置 --- 
  const initialAnimation = originRect ? {
    // 从指定的矩形区域展开，带圆角
    clipPath: `inset(${originRect.top}px ${window.innerWidth - originRect.right}px ${window.innerHeight - originRect.bottom}px ${originRect.left}px round 16px)`,
    opacity: 0,
  } : { opacity: 0 }; // 如果没有起始矩形，则仅淡入

  const animateAnimation = {
    clipPath: `inset(0px 0px 0px 0px round 0px)`, // 动画到完全显示，无圆角
    opacity: 1,
  };

  const exitAnimation = originRect ? {
    // 收缩回指定的矩形区域，带圆角
    clipPath: `inset(${originRect.top}px ${window.innerWidth - originRect.right}px ${window.innerHeight - originRect.bottom}px ${originRect.left}px round 16px)`,
    opacity: 0,
  } : { opacity: 0 }; // 如果没有起始矩形，则仅淡出

  return (
    <motion.div 
      className="p-4 pt-0" // 移除顶部内边距，让标题和返回按钮更靠近
      initial={initialAnimation}
      animate={animateAnimation}
      exit={exitAnimation}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} // 使用贝塞尔曲线增强过渡效果
    >
      <Masonry
        breakpointCols={breakpointColumnsObj} // 应用断点配置
        className="my-masonry-grid"          // 自定义 CSS 类 (需在 globals.css 定义)
        columnClassName="my-masonry-grid_column" // 自定义列 CSS 类 (需在 globals.css 定义)
      >
        {/* 遍历图片数组，渲染每个图片项 */}
        {images.map(image => (
          <motion.div
            key={image.id}
            className="overflow-hidden rounded shadow-md cursor-pointer group relative mb-4" // 列内间距由 Masonry 控制，但 mb-4 可确保最后一项底部有空间
            onClick={() => onImageClick(image)}
            layout // 启用 Framer Motion 布局动画
            initial={{ opacity: 0 }} // 图片项自身也淡入
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }} // 内部动画更快一些
          >
            <Image
              src={image.src} alt={image.alt}
              width={500} // 提供一个基础宽度用于计算
              height={375} // 提供一个基础高度用于计算（基于 4:3 比例）
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw" // 响应式图片尺寸
              style={{ width: '100%', height: 'auto', display: 'block' }} // 强制宽度100%，高度自适应
              className="transition-transform duration-300 group-hover:scale-105" // 悬停放大效果
              unoptimized={image.src.endsWith('.gif')} // GIF 图片不进行 Next.js 优化
              priority={images.indexOf(image) < 10} // 优先加载视口内可能出现的前10张图片
            />
            {/* 悬停时显示的信息标签 */}
            {(image.caption || image.date) && (
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-left rounded px-3 py-2 max-w-[80%]">
                  {image.caption && <p className="text-sm font-medium truncate select-none">{image.caption}</p>}
                  {image.date && <p className="text-xs select-none">{image.date}</p>}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </Masonry>
    </motion.div>
  );
};

export default WaterfallView;