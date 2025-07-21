/**
 * 实验室相册展示组件
 * 
 * 功能特点：
 * 1. 支持两种展示模式：
 *    - 高亮滚动流（highlight）：自动滚动的图片流，支持鼠标交互控制
 *    - 瀑布流布局（waterfall）：按分类展示的瀑布流布局
 * 2. 支持图片分类和筛选
 * 3. 支持图片点击放大查看
 * 4. 支持无限滚动和平滑动画效果
 * 
 * 交互设计：
 * 1. 高亮流模式：
 *    - 自动向左滚动
 *    - 鼠标悬停在边缘区域可控制滚动方向和速度
 *    - 点击图片可放大查看
 * 2. 瀑布流模式：
 *    - 按分类展示图片
 *    - 支持分类切换
 *    - 自适应布局
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  useAnimationControls,
  useAnimationFrame,
  motionValue,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Modal from "./Modal";
import WaterfallView from "./WaterfallView";
import { themeColors } from "@/styles/theme";
import type { GalleryImage } from "@/lib/types";
import { Loader2 } from "lucide-react";

// 视图类型定义：highlight（高亮滚动流）或 waterfall（瀑布流）
type GalleryView = "highlight" | "waterfall";

/**
 * 组件属性定义
 * @property images - 要展示的图片数组，可选，如不提供则从 API 获取
 * @property loading - 加载状态标志，用于显示加载动画
 */
interface PhotoGalleryProps {
  images?: GalleryImage[];
  loading?: boolean;
}

// 支持的图片分类列表
const CATEGORIES = [
  "Meetings",      // 会议照片
  "Graduation",    // 毕业照片
  "Team Building", // 团建活动
  "Sports",        // 运动照片
  "Lab Life",      // 实验室生活
  "Competition"    // 比赛照片
];

/**
 * 分类对应的 Emoji 图标映射
 * 用于在界面上直观展示不同分类
 */
const categoryEmojis: { [key: string]: string } = {
  Meetings: "🤝",
  Graduation: "🎓",
  "Team Building": "🚀",
  Sports: "🏸",
  "Lab Life": "🔬",
  Competition: "🏆",
  Default: "🖼️"
};

/**
 * Framer Motion 动画配置
 */

// 高亮滚动视图的动画效果
const highlightStreamVariants = {
  hidden: { opacity: 0, y: -20 },    // 初始隐藏状态
  visible: { opacity: 1, y: 0 },     // 显示状态
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }, // 退出动画
};

// 分类选择器的动画效果
const categorySelectorVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

// 分类按钮的动画效果
const categoryButtonVariants = {
  initial: { opacity: 1, scale: 1 },
};

// 瀑布流视图的动画效果
const waterfallViewVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

/**
 * 相册展示主组件
 * @param props PhotoGalleryProps
 */
const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images: albumImages = [], loading: albumLoading }) => {
  // === 状态管理 ===
  
  // 视图控制状态
  const [currentView, setCurrentView] = useState<GalleryView>("highlight");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  
  // 图片数据状态
  const [categoryImages, setCategoryImages] = useState<GalleryImage[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // === 数据加载逻辑 ===

  // 加载初始图片数据
  useEffect(() => {
    async function fetchImages() {
      if (!albumImages) {
        setCategoryLoading(true);
        try {
          const res = await fetch('/api/gallery/photos');
          const data = await res.json();
          if (data.success) {
            setCategoryImages(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch gallery images:', error);
        }
        setCategoryLoading(false);
      }
    }
    fetchImages();
  }, [albumImages]);

  // 加载分类图片数据
  useEffect(() => {
    async function fetchCategoryImages() {
      if (currentView === "waterfall" && selectedCategory) {
        setCategoryLoading(true);
        try {
          const res = await fetch(`/api/gallery/photos?category=${selectedCategory}&include_hidden=false`);
          const data = await res.json();
          if (data.success) {
            setCategoryImages(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch category images:', error);
        }
        setCategoryLoading(false);
      }
    }
    fetchCategoryImages();
  }, [currentView, selectedCategory]);

  // === 高亮滚动流控制 ===

  // 引用和标记
  const containerRef = useRef<HTMLDivElement>(null);     // 滚动容器引用
  const isHoveringRef = useRef(false);                  // 鼠标悬停标记
  const isPausedRef = useRef(false);                    // 动画暂停标记
  const mouseXRelative = useRef<number | null>(null);   // 鼠标相对位置
  const categoryButtonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});

  // 动画参数配置
  const normalVelocity = 60;    // 正常滚动速度（像素/秒）
  const maxVelocity = 600;      // 最大滚动速度
  const acceleration = 500;     // 加速度
  const deceleration = -500;    // 减速度
  const edgeThreshold = 0.2;    // 边缘触发区域（20%）

  // 布局参数
  const itemWidth = 256;        // 图片宽度
  const itemHeight = 192;       // 图片高度
  const gap = 16;              // 图片间距

  // === 内容计算 ===

  // 计算渲染列表（确保至少10张图片）
  const itemsToRender = useMemo(
    () =>
      albumImages.length >= 10
        ? albumImages
        : [...albumImages, ...albumImages, ...albumImages].slice(0, 10),
    [albumImages],
  );

  // 双倍列表用于无缝循环
  const doubledItems = useMemo(
    () => [...itemsToRender, ...itemsToRender],
    [itemsToRender],
  );

  // 计算内容总宽度
  const contentWidth = useMemo(
    () => itemsToRender.length * (itemWidth + gap),
    [itemsToRender, itemWidth, gap],
  );

  // === 动画控制 ===

  const x = motionValue(0);                     // X 坐标动画值
  const velocity = useRef(-normalVelocity);     // 当前速度

  // 动画帧更新逻辑
  useAnimationFrame((time, delta) => {
    // 仅在高亮视图且有内容时执行动画
    if (currentView !== "highlight" || contentWidth <= 0) {
      velocity.current = 0;
      return;
    }

    const dt = delta / 1000;  // 转换为秒
    let targetVelocity = -normalVelocity;  // 默认向左滚动

    // 根据状态确定目标速度
    if (isPausedRef.current) {
      // 暂停状态
      targetVelocity = 0;
    } else if (isHoveringRef.current && mouseXRelative.current !== null) {
      // 鼠标悬停状态
      const relativeX = mouseXRelative.current;
      if (relativeX < edgeThreshold) {
        // 左边缘：向左加速
        targetVelocity = -maxVelocity;
      } else if (relativeX > 1 - edgeThreshold) {
        // 右边缘：向右加速
        targetVelocity = maxVelocity;
      } else {
        // 中间区域：停止
        targetVelocity = 0;
      }
    }

    // 速度平滑过渡
    const deltaVelocity = targetVelocity - velocity.current;
    if (Math.abs(deltaVelocity) > 0.1) {
      const accel = deltaVelocity > 0 ? acceleration : deceleration;
      velocity.current += accel * dt;
      // 限制速度不超过目标值
      if (deltaVelocity > 0) {
        velocity.current = Math.min(velocity.current, targetVelocity);
      } else {
        velocity.current = Math.max(velocity.current, targetVelocity);
      }
    } else if (Math.abs(targetVelocity - velocity.current) <= 0.1) {
      velocity.current = targetVelocity;
    }

    // 更新位置
    let currentX = x.get();
    let moveBy = velocity.current * dt;
    let newX = currentX + moveBy;

    // 处理循环边界
    if (velocity.current < 0 && newX <= -contentWidth) {
      // 向左超出：重置到右侧
      newX += contentWidth;
    } else if (velocity.current > 0 && newX >= 0) {
      // 向右超出：重置到左侧
      newX -= contentWidth;
    }

    // 应用新位置
    x.set(newX);
  });

  // --- 事件处理函数 ---

  // 处理图片被点击事件 (打开 Modal)
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image); // 设置要显示的图片
    // 如果当前在高亮视图，则暂停其滚动动画
    if (currentView === "highlight") {
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
    if (currentView === "highlight") isHoveringRef.current = true;
  };

  // 处理鼠标离开高亮流容器事件
  const handleMouseLeave = () => {
    // 仅在高亮视图下取消悬停状态并重置鼠标位置
    if (currentView === "highlight") {
      isHoveringRef.current = false;
      mouseXRelative.current = null;
    }
  };

  // 处理鼠标在高亮流容器内移动事件
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // 仅在高亮视图、容器有效且未暂停时，更新鼠标相对位置
    if (
      currentView === "highlight" &&
      containerRef.current &&
      !isPausedRef.current
    ) {
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
    setCurrentView("waterfall"); // 切换到瀑布流视图
    isPausedRef.current = true; // 暂停高亮流的动画
    x.set(0); // 重置高亮流滚动位置
    velocity.current = 0; // 确保高亮流速度为 0
  };

  // 处理用户点击"返回相册"按钮事件
  const handleReturnToHighlight = () => {
    setOriginRect(null); // 返回时重置 Rect
    setSelectedCategory(null); // 清除选中的类别
    setCurrentView("highlight"); // 切换回高亮视图
    isPausedRef.current = false; // 恢复高亮流的动画
    setCategoryImages([]); // 清空分类图片
  };

  // --- 数据准备 ---
  // 根据当前选中的类别，过滤出用于瀑布流视图的图片列表
  const waterfallImages = albumImages?.filter(
    (img) => img.category === selectedCategory,
  );

  if (albumLoading || categoryLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-green-400" size={48} />
      </div>
    );
  }

  // --- 组件渲染 ---
  return (
    <div className="photo-gallery-container w-full py-8">
      {" "}
      {/* 组件最外层容器 */}
      <AnimatePresence mode="wait">
        {" "}
        {/* Framer Motion 组件，用于处理视图切换时的进入/退出动画 */}
        {/* --- 条件渲染: 高亮视图 --- */}
        {currentView === "highlight" && (
          <motion.div
            key="highlight-view" // 必须为 AnimatePresence 的子元素提供唯一 key
            initial="hidden" // 初始动画状态 (来自 variants)
            animate="visible" // 激活状态 (来自 variants)
            exit="exit" // 退出动画状态 (来自 variants)
            variants={highlightStreamVariants} // 指定使用的动画变体
          >
            {/* 高亮滚动流容器 */}
            <div
              ref={containerRef} // 绑定 ref 以获取容器尺寸和位置
              className={`w-full overflow-hidden relative ${themeColors.backgroundLight} cursor-grab mb-6`}
              style={{ height: `${itemHeight + 32}px` }} // 动态设置容器高度
              onMouseEnter={handleMouseEnter} // 绑定鼠标进入事件
              onMouseLeave={handleMouseLeave} // 绑定鼠标离开事件
              onMouseMove={handleMouseMove} // 绑定鼠标移动事件
            >
              {/* 左右两侧的渐变遮罩 */}
              <div
                className={`absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-${themeColors.backgroundLight} to-transparent z-10 pointer-events-none`}
              ></div>
              <div
                className={`absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-${themeColors.backgroundLight} to-transparent z-10 pointer-events-none`}
              ></div>

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
                    style={{
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
                    }}
                    onClick={() => handleImageClick(image)} // 点击图片打开 Modal
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={itemWidth}
                      height={itemHeight}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" // 图片样式，悬停放大
                      priority={index < itemsToRender.length} // 优先加载第一屏的图片
                      unoptimized={image.src.endsWith(".gif")} // 不对 GIF 进行优化
                    />
                    {/* 图片信息悬停层 */}
                    {(image.caption || image.date) && (
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        <div className="absolute bottom-0 left-0 right-0 bg-white/85 py-2 px-3 text-left transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t-2 border-blue-500">
                          {image.caption && (
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {image.caption}
                            </p>
                          )}
                          {image.date && (
                            <p className="text-xs text-gray-600">
                              {image.date}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* 类别选择器容器 (在高亮视图下方) */}
            {CATEGORIES.length > 0 && (
              <motion.div
                className="category-selector flex justify-center flex-wrap gap-3 px-4"
                variants={categorySelectorVariants} // 应用进入/退出动画
              >
                {/* 渲染各个类别按钮 */}
                {CATEGORIES.map((category) => (
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
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* 显示 Emoji 图标 */}
                    <span className="text-lg -ml-1 select-none">
                      {categoryEmojis[category] || categoryEmojis.Default}
                    </span>
                    {/* 显示类别名称 */}
                    <span className="select-none">{category}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
        {/* --- 条件渲染: 瀑布流视图 --- */}
        {currentView === "waterfall" && selectedCategory && (
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
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                }} // 保持与类别按钮一致的悬停动画
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg select-none">⬅️</span>
                <span className="select-none">Back to Albums</span>
              </motion.button>

              {/* 类别标题 - 绝对定位居中 */}
              <h2 className="text-2xl font-serif font-bold select-none flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
                <span className="text-2xl select-none">
                  {categoryEmojis[selectedCategory] || categoryEmojis.Default}
                </span>
                <span className="capitalize select-none">
                  {selectedCategory}
                </span>
              </h2>

              {/* 空 div 用于保持布局平衡 */}
              <div className="w-[120px]"></div>
            </div>
            {/* 渲染瀑布流组件 */}
            <WaterfallView
              images={categoryImages}
              selectedCategory={selectedCategory} // 正确的 prop
              onImageClick={handleImageClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* 渲染模态框组件 (独立于视图切换) */}
      <Modal isOpen={selectedImage !== null} onClose={closeModal} showCloseButton={false}>
        {selectedImage && (
          <div className="relative flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* 顶部品牌字样 */}
            <div className="absolute top-0 left-0 w-full flex items-center px-4 py-2 bg-white/90 border-b border-gray-100 rounded-t-2xl z-10">
              <span className="font-bold text-base tracking-wide text-blue-700 select-none" style={{letterSpacing: '0.08em', fontFamily: 'serif'}}>LAB GALLERY</span>
            </div>
            {/* 图片主体 */}
            <img
              src={selectedImage.src}
              alt={selectedImage.alt || ''}
              className="w-full h-auto object-cover rounded-2xl mt-8 mb-1"
              style={{maxHeight: 340, minHeight: 180, background: '#f8fafc'}}
            />
            {/* 底部信息栏：一行内展示所有信息 */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 py-2 px-4 border-t border-gray-100 rounded-b-2xl flex flex-row items-center gap-3 text-xs">
              <span className="font-semibold text-gray-800 truncate max-w-[40%]" title={selectedImage.caption || ''}>{selectedImage.caption}</span>
              <span className="text-blue-700 font-bold tracking-wide uppercase whitespace-nowrap">{selectedImage.category || ''}</span>
              {selectedImage.date && <span className="text-gray-500 font-mono whitespace-nowrap">{selectedImage.date}</span>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotoGallery;
