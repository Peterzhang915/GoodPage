import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useAnimationControls, useAnimationFrame, motionValue, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; // 导入 Next.js Image 组件
// 导入 Modal 组件
import Modal from './Modal'; // 假设 Modal 和 PhotoGallery 在同一目录
import WaterfallView from './WaterfallView'; // Assuming WaterfallView exists

// 定义图片数据接口，添加 category
export interface GalleryImage {
  id: number | string; // 添加唯一 ID
  src: string;
  alt: string;
  caption?: string;
  date?: string;
  category?: string; // 添加类别字段
}

// --- 视图类型 ---
type GalleryView = 'highlight' | 'waterfall';

// 1. 准备带类别的图片数据
const images: GalleryImage[] = [
  // 添加几条示例数据，您需要用实际图片路径和信息替换
  { id: 1, src: '/images/gallery/placeholder1.jpg', alt: 'Placeholder 1', caption: '示例活动 1', date: '2025.01.01', category: 'Events' },
  { id: 2, src: '/images/gallery/placeholder2.jpg', alt: 'Placeholder 2', caption: '示例会议', date: '2024.12.15', category: 'Meetings' },
  { id: 3, src: '/images/gallery/placeholder3.jpg', alt: 'Placeholder 3', caption: '毕业合影', date: '2024.06.10', category: 'Graduation' },
  { id: 4, src: '/images/gallery/placeholder4.jpg', alt: 'Placeholder 4', caption: '团建活动', date: '2024.08.20', category: 'Team Building' },
  { id: 5, src: '/images/gallery/placeholder5.jpg', alt: 'Placeholder 5', caption: '羽毛球周常', date: '2025.03.10', category: 'Sports' },
  { id: 6, src: '/images/gallery/placeholder1.jpg', alt: 'Placeholder 1 Again', caption: '另一个活动', date: '2025.01.02', category: 'Events' },
  { id: 7, src: '/images/gallery/placeholder2.jpg', alt: 'Placeholder 2 Again', caption: '小组会议', date: '2024.12.16', category: 'Meetings' },
  // ... 添加更多图片信息
];

// 提取唯一的类别
const uniqueCategories = Array.from(new Set(images.map(img => img.category).filter(Boolean))) as string[];

// Emoji 映射 (可以根据需要扩展)
const categoryEmojis: { [key: string]: string } = {
  Events: '🎉',
  Meetings: '🤝',
  Graduation: '🎓',
  'Team Building': '🚀',
  Sports: '🏸',
  Default: '🖼️', // 默认图标
};

// --- Animation Variants ---
const highlightStreamVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
};

const categorySelectorVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2 } }, // Slight delay after stream appears
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

const categoryButtonVariants = {
  initial: { opacity: 1, scale: 1 },
  fadeOut: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  selected: { scale: 1.05, transition: { duration: 0.3 } } // Optional: highlight selected
};

const waterfallViewVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }, // Can add stagger later
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

const PhotoGallery: React.FC = () => {
  // --- 状态管理 ---
  const [currentView, setCurrentView] = useState<GalleryView>('highlight');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container div
  const isHoveringRef = useRef(false);
  const isPausedRef = useRef(false);
  const mouseXRelative = useRef<number | null>(null); // Store relative mouse X (0 to 1)

  // --- 物理动画参数 ---
  const normalVelocity = 60;   // 正常速度 (像素/秒, 默认向左)
  const maxVelocity = 600;     // 边缘悬停时的最大速度 (像素/秒)
  const acceleration = 500;    // 加速度 (像素/秒²)
  const deceleration = -500;   // 减速度 (像素/秒²)
  const edgeThreshold = 0.2; // 边缘区域阈值 (例如 0.2 表示左右各 20%)
  // ---------------------

  // 调整尺寸以适应图片
  const itemWidth = 256; // px (例如 w-64)
  const itemHeight = 192; // px (例如 h-48)
  const gap = 16; // px (gap-4)
  const itemsToRender = useMemo(() => images.length >= 10 ? images : [...images, ...images, ...images].slice(0, 10), [images]);
  const doubledItems = useMemo(() => [...itemsToRender, ...itemsToRender], [itemsToRender]);
  const contentWidth = useMemo(() => itemsToRender.length * (itemWidth + gap), [itemsToRender, itemWidth, gap]);

  // 使用 motionValue 存储 x 坐标和当前速度
  const x = motionValue(0);
  const velocity = useRef(-normalVelocity); // 初始速度设为向左

  // 核心动画逻辑: useAnimationFrame
  useAnimationFrame((time, delta) => {
    // 仅在 highlight 视图且 contentWidth > 0 时运行动画
    if (currentView !== 'highlight' || contentWidth <= 0) {
      // 如果不在高亮视图，确保速度为0，防止后台计算
      velocity.current = 0;
      return;
    }

    const dt = delta / 1000; // seconds

    let targetVelocity = -normalVelocity; // Default: move left normally

    if (isPausedRef.current) {
      targetVelocity = 0;
    } else if (isHoveringRef.current && mouseXRelative.current !== null) {
      const relativeX = mouseXRelative.current;
      if (relativeX < edgeThreshold) { // Hovering left edge
        targetVelocity = -maxVelocity; // Speed up left
      } else if (relativeX > (1 - edgeThreshold)) { // Hovering right edge
        targetVelocity = maxVelocity;  // Speed up right (or reverse)
      } else { // Hovering center
        targetVelocity = 0; // Decelerate to stop
      }
    } // else (not hovering, not paused) -> targetVelocity remains -normalVelocity

    // Calculate velocity change
    const deltaVelocity = targetVelocity - velocity.current;

    // Apply acceleration/deceleration
    if (Math.abs(deltaVelocity) > 0.1) {
      const accel = deltaVelocity > 0 ? acceleration : deceleration;
      velocity.current += accel * dt;
      // Clamp velocity to target
      if (deltaVelocity > 0) {
        velocity.current = Math.min(velocity.current, targetVelocity);
      } else {
        velocity.current = Math.max(velocity.current, targetVelocity);
      }
    } else if (Math.abs(targetVelocity - velocity.current) <= 0.1) {
      velocity.current = targetVelocity;
    }

    // Update position based on current velocity
    let currentX = x.get();
    let moveBy = velocity.current * dt;
    let newX = currentX + moveBy; // Apply movement (velocity can be +/-)

    // --- Updated Loop Logic --- 
    if (velocity.current < 0 && newX <= -contentWidth) {
      // Moving left, wrapped past the end of the first set
      newX += contentWidth;
    } else if (velocity.current > 0 && newX >= 0) {
       // Moving right, wrapped past the start
       newX -= contentWidth;
    }
    // Ensure it stays exactly within bounds if velocity becomes 0 at the boundary
    newX = Math.max(newX, -contentWidth);
    newX = Math.min(newX, 0); 

    x.set(newX);
  });

  // 处理图片点击 - 暂停动画
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    // 如果在高亮视图，暂停动画
    if (currentView === 'highlight') {
      isPausedRef.current = true;
    }
  };

  // 关闭模态框 - 恢复动画
  const closeModal = () => {
    setSelectedImage(null);
    // 恢复高亮视图的动画
    isPausedRef.current = false;
  };

  // 鼠标进入 - 更新悬停状态
  const handleMouseEnter = () => {
    if (currentView === 'highlight') isHoveringRef.current = true;
  };

  // 鼠标离开 - 更新悬停状态
  const handleMouseLeave = () => {
    if (currentView === 'highlight') {
        isHoveringRef.current = false;
        mouseXRelative.current = null; // Reset relative position when leaving
    }
  };

  // New: Handle mouse movement within the container
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (currentView === 'highlight' && containerRef.current && !isPausedRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      mouseXRelative.current = Math.max(0, Math.min(1, relativeX)); // Clamp between 0 and 1
    }
  };

  // --- 新增：视图切换处理 ---
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('waterfall');
    isPausedRef.current = true; // 暂停高亮流动画
    x.set(0); // 重置高亮流位置（可选，但推荐）
    velocity.current = 0; // 确保速度为0
  };

  const handleReturnToHighlight = () => {
    setSelectedCategory(null);
    setCurrentView('highlight');
    isPausedRef.current = false; // 恢复高亮流动画
    // 动画会自动从上次停止的位置或 0 开始
  };

  // --- 瀑布流数据过滤 ---
  const waterfallImages = images.filter(img => img.category === selectedCategory);

  return (
    <div className="photo-gallery-container w-full py-8"> {/* 添加一些垂直 padding */} 

      <AnimatePresence mode="wait"> {/* 使用 AnimatePresence 包裹视图切换 */} 
        {currentView === 'highlight' && (
          <motion.div
            key="highlight-view" // Key for AnimatePresence
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={highlightStreamVariants}
          >
            {/* 高亮滚动流 */} 
            <div
              ref={containerRef}
              className="w-full overflow-hidden relative bg-gray-100 cursor-grab mb-6" // 增加下方 margin
              style={{ height: `${itemHeight + 32}px`}}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {/* 添加左右渐变遮罩，使滚动看起来更自然 (可选) */}
              <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-gray-100 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none"></div>

              {/* 3. 内层滚动容器: flex布局，应用动画 */}
              <motion.div
                className="flex items-center h-full gap-4 pr-4 absolute top-0 left-0" // 添加 absolute 定位
                style={{ width: `${contentWidth * 2}px`, x: x }} // 将 style.x 绑定到 motionValue
              >
                {/* 4. 渲染真实图片 */}
                {doubledItems.map((image, index) => (
                  <div
                    key={`${image.id}-${index}`}
                    className="relative flex-shrink-0 overflow-hidden rounded shadow-md group cursor-pointer" // 添加 cursor-pointer
                    style={{ width: `${itemWidth}px`, height: `${itemHeight}px`}}
                    onClick={() => handleImageClick(image)} // 添加点击事件
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
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex flex-col justify-end p-3 text-white opacity-0 group-hover:opacity-100 pointer-events-none"> {/* 添加 pointer-events-none 避免干扰点击 */}
                        {image.caption && <p className="font-semibold text-sm truncate">{image.caption}</p>}
                        {image.date && <p className="text-xs">{image.date}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* 类别选择器 (移到下方) */} 
            {uniqueCategories.length > 0 && (
              <motion.div 
                className="category-selector flex justify-center flex-wrap gap-3 px-4" // 使用 flex-wrap 和 gap
                variants={categorySelectorVariants} // 应用选择器动画
              >
                {uniqueCategories.map(category => (
                  <motion.button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors flex items-center gap-2" // flex for icon
                    variants={categoryButtonVariants} // 应用按钮动画
                    initial="initial"
                    // animate={selectedCategory === category ? 'selected' : 'initial'} // 暂时不加选中效果
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{categoryEmojis[category] || categoryEmojis.Default}</span> 
                    <span>{category}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {currentView === 'waterfall' && selectedCategory && (
          <motion.div
            key="waterfall-view" // Key for AnimatePresence
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={waterfallViewVariants}
          >
            {/* 类别按钮 (仅显示选中的和返回按钮) */} 
            <div className="category-selector flex justify-between items-center mb-4 px-4">
               <motion.button
                  onClick={handleReturnToHighlight}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
               >
                 <span className="text-lg">⬅️</span>
                 <span>Back to Albums</span>
               </motion.button>
               {/* 显示当前选中的分类 (可选) */}
               <span className="text-lg font-semibold flex items-center gap-2">
                 <span className="text-xl">{categoryEmojis[selectedCategory] || categoryEmojis.Default}</span>
                 <span className="capitalize">{selectedCategory}</span>
               </span>
               {/* 可以留空或添加其他控件 */}
               <div></div> 
            </div>
            <WaterfallView
              images={waterfallImages}
              category={selectedCategory} // 传递 category 可能不再需要，因为标题在此显示
              // onReturn={handleReturnToHighlight} // 返回按钮已在此处处理
              onImageClick={handleImageClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal image={selectedImage} onClose={closeModal} />
    </div>
  );
};

export default PhotoGallery; 