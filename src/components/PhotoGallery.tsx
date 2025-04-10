import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls, useAnimationFrame, motionValue } from 'framer-motion';
import Image from 'next/image'; // 导入 Next.js Image 组件
// 导入 Modal 组件
import Modal from './Modal'; // 假设 Modal 和 PhotoGallery 在同一目录

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
  // 添加 state 管理选中的图片
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const isHoveringRef = useRef(false);
  const isPausedRef = useRef(false); // 新增：用于模态框打开时暂停动画

  // --- 物理动画参数 ---
  const normalVelocity = 60; // 正常速度 (像素/秒)
  const acceleration = 300;  // 加速度 (像素/秒²)
  const deceleration = -300; // 减速度 (像素/秒²)
  // ---------------------

  // 调整尺寸以适应图片
  const itemWidth = 256; // px (例如 w-64)
  const itemHeight = 192; // px (例如 h-48)
  const gap = 16; // px (gap-4)
  const totalWidthPerItem = itemWidth + gap;
  const contentWidth = itemsToRender.length * totalWidthPerItem;

  // 使用 motionValue 存储 x 坐标和当前速度
  const x = motionValue(0);
  const velocity = useRef(normalVelocity); // 初始速度设为正常速度

  // 核心动画逻辑: useAnimationFrame
  useAnimationFrame((time, delta) => {
    // delta 是自上一帧以来的毫秒数
    const dt = delta / 1000; // 转换为秒

    // 确定目标速度
    let targetVelocity = isHoveringRef.current || isPausedRef.current ? 0 : normalVelocity;

    // 计算速度差
    const deltaVelocity = targetVelocity - velocity.current;

    // 应用加速度或减速度
    if (deltaVelocity > 0) { // 需要加速
      velocity.current += acceleration * dt;
      velocity.current = Math.min(velocity.current, targetVelocity); // 不超过目标速度
    } else if (deltaVelocity < 0) { // 需要减速
      velocity.current += deceleration * dt; // deceleration 是负数
      velocity.current = Math.max(velocity.current, targetVelocity); // 不低于目标速度 (0)
    }

    // 根据当前速度更新位置
    let currentX = x.get();
    let moveBy = velocity.current * dt;
    let newX = currentX - moveBy; // 向左移动

    // 处理循环：当移出完整内容宽度时，重置位置
    // 这里需要精确处理，防止跳跃
    if (velocity.current !== 0 && moveBy !== 0) { // 只有在移动时才检查循环
        // 使用 remainder 操作符 (%) 来处理循环
        // 确保结果在 [-contentWidth * 2, -contentWidth] 范围内，以匹配 doubledItems 的显示逻辑
        // (稍微复杂一点以处理负数和边界)
        newX = ((newX % contentWidth) - contentWidth) % contentWidth;
    }

    x.set(newX);
  });

  // 处理图片点击 - 暂停动画
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    isPausedRef.current = true; // 标记为暂停
  };

  // 关闭模态框 - 恢复动画
  const closeModal = () => {
    setSelectedImage(null);
    isPausedRef.current = false; // 取消暂停标记
    // 动画会在下一帧根据 isHoveringRef 自动恢复到合适的速度
  };

  // 鼠标进入 - 更新悬停状态
  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    // 不再直接控制动画，useAnimationFrame 会处理
  };

  // 鼠标离开 - 更新悬停状态
  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    // 不再直接控制动画，useAnimationFrame 会处理
  };

  return (
    <> {/* 使用 Fragment 包裹，因为 Modal 是独立于滚动容器渲染的 */}
      <div
        className="w-full overflow-hidden relative bg-gray-100 cursor-grab" // 添加 grab cursor
        style={{ height: `${itemHeight + 32}px`}}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      > {/* 根据图片高度调整容器高度 */}
        {/* 添加左右渐变遮罩，使滚动看起来更自然 (可选) */}
         <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
         <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-gray-100 to-transparent z-10"></div>

        {/* 3. 内层滚动容器: flex布局，应用动画 */}
        <motion.div
          className="flex items-center h-full gap-4 pr-4"
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

      {/* 条件渲染 Modal 组件 */}
      <Modal image={selectedImage} onClose={closeModal} />
    </>
  );
};

export default PhotoGallery; 