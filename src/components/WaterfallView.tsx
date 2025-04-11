// src/components/WaterfallView.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GalleryImage } from './PhotoGallery'; // Assuming GalleryImage is exported or moved
import { themeColors } from '@/styles/theme';

interface WaterfallViewProps {
  category: string;
  images: GalleryImage[];
  onReturn?: () => void; // 修改为可选 prop
  // itemWidth: number; // 暂时移除，让图片自适应
  // itemHeight: number; // Height might be auto based on aspect ratio later
  onImageClick: (image: GalleryImage) => void;
}

const WaterfallView: React.FC<WaterfallViewProps> = ({
    category, // category 仍然可以用来获取数据，但不一定显示标题
    images,
    // onReturn, // 不再需要接收 onReturn
    onImageClick,
}) => {
  return (
    <div className="p-4 pt-0"> {/* 移除顶部 padding，因为标题和返回按钮在外部 */} 
      {/* 瀑布流网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map(image => (
          <motion.div
            key={image.id}
            className="overflow-hidden rounded shadow-md cursor-pointer group relative"
            onClick={() => onImageClick(image)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={image.src} alt={image.alt}
              width={400}
              height={300}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              style={{ width: '100%', height: 'auto' }}
              className="object-cover block transition-transform duration-300 group-hover:scale-105"
            />
            {(image.caption || image.date) && (
              <div className={`absolute inset-0 ${themeColors.backgroundBlack} ${themeColors.opacityLight} transition-opacity duration-300 group-hover:opacity-100`}>
                <div className={`absolute inset-0 flex items-center justify-center ${themeColors.textWhite} text-center p-4`}>
                  <div>
                    {image.caption && <p className="font-semibold text-sm truncate">{image.caption}</p>}
                    {image.date && <p className="text-xs">{image.date}</p>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WaterfallView;