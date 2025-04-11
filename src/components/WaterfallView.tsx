// src/components/WaterfallView.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Masonry from 'react-masonry-css'; // 导入 Masonry 组件
import { GalleryImage } from './PhotoGallery'; // Assuming GalleryImage is exported or moved
import { themeColors } from '@/styles/theme';

interface WaterfallViewProps {
  category: string;
  images: GalleryImage[];
  onReturn?: () => void; // 修改为可选 prop
  // itemWidth: number; // 暂时移除，让图片自适应
  // itemHeight: number; // Height might be auto based on aspect ratio later
  onImageClick: (image: GalleryImage) => void;
  originRect?: DOMRect | null; // 新增: 可选的初始矩形信息
}

// 定义 Masonry 布局的断点和对应的列数
const breakpointColumnsObj = {
  default: 5, // 默认列数 (非常宽的屏幕)
  1280: 4, // >= 1280px
  1024: 3, // >= 1024px
  768: 2,  // >= 768px
  640: 1   // >= 640px (或更小)
};

const WaterfallView: React.FC<WaterfallViewProps> = ({
    category, // category 仍然可以用来获取数据，但不一定显示标题
    images,
    // onReturn, // 不再需要接收 onReturn
    onImageClick,
    originRect, // 接收 originRect prop
}) => {
  // 检查是否有图片，如果没有则显示提示信息
  if (!images || images.length === 0) {
    return <div className="p-4 text-center text-gray-500">该分类下暂无照片。</div>;
  }

  // --- Framer Motion 动画设置 --- 
  const initialAnimation = originRect ? {
    clipPath: `inset(${originRect.top}px ${window.innerWidth - originRect.right}px ${window.innerHeight - originRect.bottom}px ${originRect.left}px round 16px)`,
    opacity: 0,
    // scale: 0.8, // 可选，增加缩放效果
  } : { opacity: 0 };

  const animateAnimation = {
    clipPath: `inset(0px 0px 0px 0px round 0px)`,
    opacity: 1,
    // scale: 1,
  };

  const exitAnimation = originRect ? {
    clipPath: `inset(${originRect.top}px ${window.innerWidth - originRect.right}px ${window.innerHeight - originRect.bottom}px ${originRect.left}px round 16px)`,
    opacity: 0,
    // scale: 0.8,
  } : { opacity: 0 };

  return (
    <motion.div 
      className="p-4 pt-0" 
      initial={initialAnimation}
      animate={animateAnimation}
      exit={exitAnimation}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} // 使用贝塞尔曲线增强效果
    >
      <Masonry
        breakpointCols={breakpointColumnsObj} // 应用上面定义的断点
        className="my-masonry-grid"          // 自定义 CSS 类 (在 globals.css 中定义)
        columnClassName="my-masonry-grid_column" // 自定义列 CSS 类 (在 globals.css 中定义)
      >
        {/* 映射图片数组到 Masonry 列中 */}
        {images.map(image => (
          <motion.div
            key={image.id}
            className="overflow-hidden rounded shadow-md cursor-pointer group relative mb-4" // 添加 mb-4 确保列内项目有间距
            onClick={() => onImageClick(image)}
            layout // 让 Framer Motion 处理布局动画
            initial={{ opacity: 0 }} // 内部图片也做个淡入
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }} 
          >
            <Image
              src={image.src} alt={image.alt}
              width={500} // 提供一个合理的默认宽度
              height={375} // 添加一个基于 4:3 宽高比的估计高度
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw" // 优化 sizes 属性
              style={{ width: '100%', height: 'auto', display: 'block' }} // 确保图片宽度100%且高度自适应
              className="transition-transform duration-300 group-hover:scale-105"
              unoptimized={image.src.endsWith('.gif')} // GIF 不优化
              priority={images.indexOf(image) < 10} // 优先加载前几张图片
            />
            {/* 悬停时显示的遮罩层和信息 */}
            {(image.caption || image.date) && (
              <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div className={`${themeColors.textWhite} text-center p-2`}>
                  {image.caption && <p className="font-semibold text-sm mb-1 truncate">{image.caption}</p>}
                  {image.date && <p className="text-xs">{image.date}</p>}
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