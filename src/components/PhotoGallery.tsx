import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useAnimationControls, useAnimationFrame, motionValue, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Modal from './Modal';
import WaterfallView from './WaterfallView';
import { themeColors } from '@/styles/theme';

// 图片数据接口定义
export interface GalleryImage {
  id: number | string; // 唯一ID
  src: string;         // 图片路径
  alt: string;         // 替代文本
  caption?: string;    // 标题 (可选)
  date?: string;       // 日期 (可选)
  category?: string;   // 分类 (可选)
}

// 视图类型定义
type GalleryView = 'highlight' | 'waterfall';

// 示例图片数据 (扩展)
const images: GalleryImage[] = [
  { id: 1, src: '/images/gallery/placeholder1.jpg', alt: 'Placeholder 1', caption: '示例活动 1', date: '2025.01.01', category: 'Events' },
  { id: 2, src: '/images/gallery/placeholder2.jpg', alt: 'Placeholder 2', caption: '示例会议', date: '2024.12.15', category: 'Meetings' },
  { id: 3, src: '/images/gallery/placeholder3.jpg', alt: 'Placeholder 3', caption: '毕业合影', date: '2024.06.10', category: 'Graduation' },
  { id: 4, src: '/images/gallery/placeholder4.jpg', alt: 'Placeholder 4', caption: '团建活动', date: '2024.08.20', category: 'Team Building' },
  { id: 5, src: '/images/gallery/placeholder5.jpg', alt: 'Placeholder 5', caption: '羽毛球周常', date: '2025.03.10', category: 'Sports' },
  { id: 6, src: '/images/gallery/placeholder1.jpg', alt: 'Placeholder 1 Again', caption: '另一个活动', date: '2025.01.02', category: 'Events' },
  { id: 7, src: '/images/gallery/placeholder2.jpg', alt: 'Placeholder 2 Again', caption: '小组会议', date: '2024.12.16', category: 'Meetings' },
  // --- 添加更多图片 ---
  { id: 8, src: '/images/gallery/placeholder4.jpg', alt: 'Placeholder 4 Repeat', caption: '户外拓展', date: '2024.09.05', category: 'Team Building' },
  { id: 9, src: '/images/gallery/placeholder3.jpg', alt: 'Placeholder 3 Repeat', caption: '实验室日常', date: '2024.11.11', category: 'Lab Life' }, // 新类别
  { id: 10, src: '/images/gallery/placeholder5.jpg', alt: 'Placeholder 5 Repeat', caption: '篮球友谊赛', date: '2025.04.18', category: 'Sports' },
  { id: 11, src: '/images/gallery/placeholder1.jpg', alt: 'Placeholder 1 Third', caption: '迎新晚会', date: '2024.09.01', category: 'Events' },
  { id: 12, src: '/images/gallery/placeholder2.jpg', alt: 'Placeholder 2 Third', caption: '学术报告', date: '2025.02.20', category: 'Meetings' },
  { id: 13, src: '/images/gallery/placeholder3.jpg', alt: 'Placeholder 3 Third', caption: '毕业典礼现场', date: '2024.06.11', category: 'Graduation' },
  { id: 14, src: '/images/gallery/placeholder4.jpg', alt: 'Placeholder 4 Fourth', caption: '节日聚餐', date: '2024.12.24', category: 'Team Building' },
  { id: 15, src: '/images/gallery/placeholder5.jpg', alt: 'Placeholder 5 Fourth', caption: '乒乓球练习', date: '2025.05.01', category: 'Sports' },
  { id: 16, src: '/images/gallery/placeholder1.jpg', alt: 'Placeholder 1 Fourth', caption: '开放日活动', date: '2025.06.15', category: 'Events' },
  { id: 17, src: '/images/gallery/placeholder3.jpg', alt: 'Placeholder 3 Fourth', caption: '实验瞬间', date: '2025.01.20', category: 'Lab Life' },
  { id: 18, src: '/images/gallery/placeholder4.jpg', alt: 'Placeholder 4 Fifth', caption: '春游', date: '2025.04.05', category: 'Team Building' },
  { id: 19, src: '/images/gallery/placeholder5.jpg', alt: 'Placeholder 5 Fifth', caption: '跑步打卡', date: '2025.07.01', category: 'Sports' },
  { id: 20, src: '/images/gallery/placeholder2.jpg', alt: 'Placeholder 2 Fifth', caption: '周会讨论', date: '2025.03.03', category: 'Meetings' },
];

// 从图片数据中提取唯一的类别
const uniqueCategories = Array.from(new Set(images.map(img => img.category).filter(Boolean))) as string[];

// 类别与其对应的 Emoji 图标的映射关系 (添加新类别)
const categoryEmojis: { [key: string]: string } = {
  Events: '🎉',
  Meetings: '🤝',
  Graduation: '🎓',
  'Team Building': '🚀',
  Sports: '🏸',
  'Lab Life': '🔬', // 新类别的 Emoji
  Default: '🖼️', // 如果类别没有对应图标，使用此默认图标
};

// --- Framer Motion 动画变体定义 ---

// 高亮滚动视图的进入/退出动画效果
const highlightStreamVariants = {
  hidden: { opacity: 0, y: -20 }, // 初始状态：透明，向上偏移
  visible: { opacity: 1, y: 0 },   // 可见状态：不透明，回到原位
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } } // 退出状态：透明，向下偏移
};

// 类别选择器容器的进入/退出动画效果
const categorySelectorVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2 } }, // 进入时延迟 0.2 秒显示
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

// 类别按钮的动画变体 (主要定义了初始状态，交互效果通过 whileHover/whileTap 实现)
const categoryButtonVariants = {
  initial: { opacity: 1, scale: 1 },
  // fadeOut: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }, // 暂未实现点击后其他按钮淡出的效果
  // selected: { scale: 1.05, transition: { duration: 0.3 } } // 暂未实现选中按钮高亮的效果
};

// 瀑布流视图的进入/退出动画效果
const waterfallViewVariants = {
  hidden: { opacity: 0 }, // 初始状态：透明
  visible: { opacity: 1, transition: { duration: 0.5 } }, // 可见状态：不透明 (可添加 stagger 实现子元素交错出现)
  exit: { opacity: 0, transition: { duration: 0.3 } } // 退出状态：透明
};

// 照片墙主组件
const PhotoGallery: React.FC = () => {
  // --- 组件状态管理 ---
  const [currentView, setCurrentView] = useState<GalleryView>('highlight'); // 当前显示的视图 ('highlight' 或 'waterfall')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 用户选择的图片类别
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null); // 用户点击放大的图片 (用于 Modal)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null); // 新增: 存储点击按钮的矩形信息
  
  // --- Refs 用于高亮滚动流的交互 ---
  const containerRef = useRef<HTMLDivElement>(null); // 指向高亮流滚动容器的引用
  const isHoveringRef = useRef(false); // 标记鼠标是否悬停在高亮流容器上
  const isPausedRef = useRef(false);   // 标记高亮流是否因用户交互（点击图片、切换视图）而暂停
  const mouseXRelative = useRef<number | null>(null); // 存储鼠标在高亮流容器内的相对 X 坐标 (0 到 1)

  // 新增: Refs for category buttons
  const categoryButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // --- 高亮滚动流物理动画参数 ---
  const normalVelocity = 60;   // 默认向左滚动速度 (像素/秒)
  const maxVelocity = 600;     // 鼠标在边缘悬停时的最大滚动速度
  const acceleration = 500;    // 加速度 (像素/秒²)
  const deceleration = -500;   // 减速度 (像素/秒²)
  const edgeThreshold = 0.2;   // 定义容器左右边缘区域的宽度比例 (0.2 表示 20%)

  // --- 高亮滚动流尺寸与内容计算 ---
  const itemWidth = 256; // 单个图片的显示宽度
  const itemHeight = 192; // 单个图片的显示高度
  const gap = 16;        // 图片之间的水平间距
  // 确定实际渲染的图片列表 (至少10张，不足则重复)，用于计算内容宽度
  const itemsToRender = useMemo(() => images.length >= 10 ? images : [...images, ...images, ...images].slice(0, 10), [images]);
  // 将渲染列表加倍，用于实现无缝循环效果
  const doubledItems = useMemo(() => [...itemsToRender, ...itemsToRender], [itemsToRender]);
  // 计算单倍内容的总宽度
  const contentWidth = useMemo(() => itemsToRender.length * (itemWidth + gap), [itemsToRender, itemWidth, gap]);

  // --- 高亮滚动流运动值 ---
  const x = motionValue(0); // 使用 motion value 存储和驱动 X 坐标动画
  const velocity = useRef(-normalVelocity); // 使用 ref 存储当前滚动速度

  // --- 高亮滚动流核心动画逻辑 (使用 useAnimationFrame) ---
  useAnimationFrame((time, delta) => {
    // 仅当处于高亮视图且内容有效时才执行动画计算
    if (currentView !== 'highlight' || contentWidth <= 0) {
      velocity.current = 0; // 确保不在高亮视图时速度为 0
      return;
    }

    const dt = delta / 1000; // 将时间差转换为秒
    let targetVelocity = -normalVelocity; // 默认目标速度：向左滚动

    // 根据当前状态判断目标速度
    if (isPausedRef.current) {
      // 状态 1: 如果被暂停 (用户点击图片或切换视图)
      targetVelocity = 0;
    } else if (isHoveringRef.current && mouseXRelative.current !== null) {
      // 状态 2: 如果鼠标悬停在容器内且未暂停
      const relativeX = mouseXRelative.current;
      if (relativeX < edgeThreshold) {
        // 子状态 2.1: 鼠标在左边缘区域 -> 加速向左
        targetVelocity = -maxVelocity;
      } else if (relativeX > (1 - edgeThreshold)) {
        // 子状态 2.2: 鼠标在右边缘区域 -> 加速向右
        targetVelocity = maxVelocity;
      } else {
        // 子状态 2.3: 鼠标在中间区域 -> 减速至停止
        targetVelocity = 0;
      }
    }
    // 状态 3: (默认) 未暂停且鼠标未悬停 -> 目标速度保持为默认向左滚动

    // --- 平滑速度过渡与位置更新 --- 
    // 计算当前速度与目标速度的差值
    const deltaVelocity = targetVelocity - velocity.current;
    // 如果速度差显著，则应用加速度或减速度
    if (Math.abs(deltaVelocity) > 0.1) {
      const accel = deltaVelocity > 0 ? acceleration : deceleration;
      velocity.current += accel * dt;
      // 防止速度超过目标值 (过冲)
      if (deltaVelocity > 0) {
        velocity.current = Math.min(velocity.current, targetVelocity);
      } else {
        velocity.current = Math.max(velocity.current, targetVelocity);
      }
    } else if (Math.abs(targetVelocity - velocity.current) <= 0.1) {
      // 如果速度已非常接近目标值，直接设置为目标值
      velocity.current = targetVelocity;
    }
    // 根据当前速度更新 X 坐标
    let currentX = x.get();
    let moveBy = velocity.current * dt;
    let newX = currentX + moveBy;
    
    // --- 处理无限循环边界 --- 
    // 向左滚动超出边界时，重置到右侧相应位置
    if (velocity.current < 0 && newX <= -contentWidth) {
      newX += contentWidth;
    // 向右滚动超出边界时，重置到左侧相应位置
    } else if (velocity.current > 0 && newX >= 0) {
       newX -= contentWidth;
    }
    // 更新 motion value 以驱动动画
    x.set(newX);
  });

  // --- 事件处理函数 ---

  // 处理图片被点击事件 (打开 Modal)
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image); // 设置要显示的图片
    // 如果当前在高亮视图，则暂停其滚动动画
    if (currentView === 'highlight') {
      isPausedRef.current = true;
    }
  };

  // 处理 Modal 关闭事件
  const closeModal = () => {
    setSelectedImage(null); // 清除选中的图片
    // 恢复高亮视图的滚动动画
    isPausedRef.current = false;
  };

  // 处理鼠标进入高亮流容器事件
  const handleMouseEnter = () => {
    // 仅在高亮视图下标记为悬停状态
    if (currentView === 'highlight') isHoveringRef.current = true;
  };

  // 处理鼠标离开高亮流容器事件
  const handleMouseLeave = () => {
    // 仅在高亮视图下取消悬停状态并重置鼠标位置
    if (currentView === 'highlight') {
        isHoveringRef.current = false;
        mouseXRelative.current = null;
    }
  };

  // 处理鼠标在高亮流容器内移动事件
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // 仅在高亮视图、容器有效且未暂停时，更新鼠标相对位置
    if (currentView === 'highlight' && containerRef.current && !isPausedRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      mouseXRelative.current = Math.max(0, Math.min(1, relativeX)); // 将坐标限制在 0 到 1 之间
    }
  };

  // --- 视图切换处理函数 ---

  // 处理用户点击类别按钮事件
  const handleCategorySelect = (category: string) => {
    // 获取被点击按钮的 DOM Rect
    const buttonElement = categoryButtonRefs.current[category];
    if (buttonElement) {
      setOriginRect(buttonElement.getBoundingClientRect());
    } else {
      setOriginRect(null); // 如果找不到按钮，重置 Rect
    }

    setSelectedCategory(category);
    setCurrentView('waterfall');  // 切换到瀑布流视图
    isPausedRef.current = true;  // 暂停高亮流的动画
    x.set(0);                    // 重置高亮流滚动位置
    velocity.current = 0;        // 确保高亮流速度为 0
  };

  // 处理用户点击"返回相册"按钮事件
  const handleReturnToHighlight = () => {
    setOriginRect(null); // 返回时重置 Rect
    setSelectedCategory(null);   // 清除选中的类别
    setCurrentView('highlight'); // 切换回高亮视图
    isPausedRef.current = false; // 恢复高亮流的动画
  };

  // --- 数据准备 ---
  // 根据当前选中的类别，过滤出用于瀑布流视图的图片列表
  const waterfallImages = images.filter(img => img.category === selectedCategory);

  // --- 组件渲染 --- 
  return (
    <div className="photo-gallery-container w-full py-8"> {/* 组件最外层容器 */} 

      <AnimatePresence mode="wait"> {/* Framer Motion 组件，用于处理视图切换时的进入/退出动画 */} 
        
        {/* --- 条件渲染: 高亮视图 --- */} 
        {currentView === 'highlight' && (
          <motion.div
            key="highlight-view" // 必须为 AnimatePresence 的子元素提供唯一 key
            initial="hidden"    // 初始动画状态 (来自 variants)
            animate="visible"   // 激活状态 (来自 variants)
            exit="exit"         // 退出动画状态 (来自 variants)
            variants={highlightStreamVariants} // 指定使用的动画变体
          >
            {/* 高亮滚动流容器 */} 
            <div
              ref={containerRef} // 绑定 ref 以获取容器尺寸和位置
              className={`w-full overflow-hidden relative ${themeColors.backgroundLight} cursor-grab mb-6`}
              style={{ height: `${itemHeight + 32}px`}} // 动态设置容器高度
              onMouseEnter={handleMouseEnter} // 绑定鼠标进入事件
              onMouseLeave={handleMouseLeave} // 绑定鼠标离开事件
              onMouseMove={handleMouseMove}   // 绑定鼠标移动事件
            >
              {/* 左右两侧的渐变遮罩 */} 
              <div className={`absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-${themeColors.backgroundLight} to-transparent z-10 pointer-events-none`}></div>
              <div className={`absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-${themeColors.backgroundLight} to-transparent z-10 pointer-events-none`}></div>

              {/* 内部横向滚动容器 (应用动画) */} 
              <motion.div
                className="flex items-center h-full gap-4 pr-4 absolute top-0 left-0"
                style={{ width: `${contentWidth * 2}px`, x: x }} // 设置容器总宽度并绑定 x 坐标动画
              >
                {/* 渲染图片卡片列表 (使用 doubledItems 实现无缝循环) */} 
                {doubledItems.map((image, index) => (
                  <div
                    key={`${image.id}-${index}`}
                    className="relative flex-shrink-0 overflow-hidden rounded shadow-md group cursor-pointer"
                    style={{ width: `${itemWidth}px`, height: `${itemHeight}px`}}
                    onClick={() => handleImageClick(image)} // 点击图片打开 Modal
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={itemWidth}
                      height={itemHeight}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" // 图片样式，悬停放大
                      priority={index < itemsToRender.length} // 优先加载第一屏的图片
                      unoptimized={image.src.endsWith('.gif')} // 不对 GIF 进行优化
                    />
                    {/* 图片信息悬停层 */} 
                    {(image.caption || image.date) && (
                      <div className={`absolute inset-0 ${themeColors.backgroundBlack} ${themeColors.opacityLight} transition-opacity duration-300 group-hover:opacity-100`}>
                        <div className={`absolute inset-0 flex items-center justify-center ${themeColors.textWhite} text-center p-4`}>
                          <div>
                            {image.caption && <p className="text-sm select-none">{image.caption}</p>}
                            {image.date && <p className="text-xs select-none">{image.date}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* 类别选择器容器 (在高亮视图下方) */} 
            {uniqueCategories.length > 0 && (
              <motion.div 
                className="category-selector flex justify-center flex-wrap gap-3 px-4"
                variants={categorySelectorVariants} // 应用进入/退出动画
              >
                {/* 渲染各个类别按钮 */} 
                {uniqueCategories.map((category) => (
                  <motion.button
                    key={category}
                    ref={(el: HTMLButtonElement | null) => { 
                      if (el) { 
                        categoryButtonRefs.current[category] = el; 
                      } else { 
                        delete categoryButtonRefs.current[category]; 
                      } 
                    }} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out shadow-sm ${themeColors.backgroundLight} ${themeColors.textColorPrimary} hover:shadow-md hover:bg-gray-100 active:scale-95 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    onClick={() => handleCategorySelect(category)}
                    variants={categoryButtonVariants}
                    initial="initial"
                    whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* 显示 Emoji 图标 */} 
                    <span className="text-lg -ml-1 select-none">{categoryEmojis[category] || categoryEmojis.Default}</span> 
                    {/* 显示类别名称 */} 
                    <span className="select-none">{category}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* --- 条件渲染: 瀑布流视图 --- */} 
        {currentView === 'waterfall' && selectedCategory && (
          <motion.div
            key="waterfall-view" // AnimatePresence key
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={waterfallViewVariants} // 应用进入/退出动画
          >
            {/* 瀑布流视图的页眉 */} 
            <div className="category-selector flex justify-between items-center mb-6 px-4 relative">
               {/* 返回按钮 - 位于左侧 */} 
               <motion.button
                  onClick={handleReturnToHighlight} // 点击返回高亮视图
                  // 采用与类别按钮相似的样式，调整了 padding 和圆角
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out shadow-sm ${themeColors.backgroundLight} ${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} hover:shadow-md hover:bg-gray-100 active:scale-95 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-10`}
                  whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }} // 保持与类别按钮一致的悬停动画
                  whileTap={{ scale: 0.95 }}
               >
                 <span className="text-lg select-none">⬅️</span>
                 <span className="select-none">Back to Albums</span>
               </motion.button>
               
               {/* 类别标题 - 绝对定位居中 */} 
               <h2 className="text-2xl font-serif font-bold select-none flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
                 <span className="text-2xl select-none">{categoryEmojis[selectedCategory] || categoryEmojis.Default}</span>
                 <span className="capitalize select-none">{selectedCategory}</span>
               </h2>
               
               {/* 空 div 用于保持布局平衡 */} 
               <div className="w-[120px]"></div>
            </div>
            {/* 渲染瀑布流组件 */} 
            <WaterfallView
              images={waterfallImages} // 传递过滤后的图片列表
              category={selectedCategory} // 传递当前类别名称 (WaterfallView 内部可能需要)
              onImageClick={handleImageClick} // 传递图片点击事件处理函数
              originRect={originRect} // 传递 originRect prop
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 渲染模态框组件 (独立于视图切换) */} 
      <Modal image={selectedImage} onClose={closeModal} />
    </div>
  );
};

export default PhotoGallery;
