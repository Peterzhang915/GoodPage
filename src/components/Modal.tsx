import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { themeColors } from '@/styles/theme';

// 复用 PhotoGallery 中的图片数据接口 (与 PhotoGallery.tsx 中的定义保持一致)
interface GalleryImage {
  id: number | string; // 唯一ID
  src: string;         // 图片路径
  alt: string;         // 替代文本
  caption?: string;    // 标题 (可选)
  date?: string;       // 日期 (可选)
}

// Modal 组件的 Props 接口定义
interface ModalProps {
  image: GalleryImage | null; // 当前要显示的图片对象，或 null (表示关闭)
  onClose: () => void;        // 关闭模态框的回调函数
}

// 模态框组件
const Modal: React.FC<ModalProps> = ({ image, onClose }) => {
  // 如果没有传入有效的 image 对象，则不渲染模态框
  if (!image) return null;

  return (
    // AnimatePresence 用于处理模态框出现和消失的动画
    <AnimatePresence>
      {/* 背景遮罩层 */}
      <motion.div
        key="modal-backdrop" // 为 AnimatePresence 的直接子元素提供 key
        initial={{ opacity: 0 }} // 初始状态：完全透明
        animate={{ opacity: 1 }} // 动画到状态：完全不透明
        exit={{ opacity: 0 }}    // 退出动画：渐变至透明
        className={`fixed inset-0 ${themeColors.backgroundBlack} ${themeColors.opacityLight} z-50 flex items-center justify-center`} // 定位、背景、层级、布局
        onClick={onClose} // 点击背景遮罩层时调用 onClose 关闭模态框
      >
        {/* 模态框内容容器 */}
        <motion.div
          key="modal-content" // 为 AnimatePresence 的直接子元素提供 key (如果 AnimatePresence 直接包裹这个 div 的话)
          initial={{ scale: 0.7, opacity: 0 }} // 初始状态：缩小、透明
          animate={{ scale: 1, opacity: 1 }}   // 动画到状态：正常大小、不透明
          exit={{ scale: 0.7, opacity: 0 }}    // 退出动画：缩小、变透明
          transition={{ type: "spring", stiffness: 300, damping: 30 }} // 使用弹簧动画效果
          className={`relative ${themeColors.backgroundWhite} rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col`} // 样式、尺寸限制、布局
          onClick={(e) => e.stopPropagation()} // 阻止点击内容区域时触发背景层的 onClick，防止意外关闭
        >
          {/* 关闭按钮 (X) */}
          <button
            onClick={onClose} // 点击按钮时调用 onClose 关闭模态框
            className={`absolute top-4 right-4 p-1 rounded-full ${themeColors.textGrayMedium} hover:${themeColors.textColorPrimary} hover:bg-gray-200 transition-all duration-150 ease-in-out z-10`} // 定位、内边距、圆角、颜色、背景悬停、过渡动画、层级
            aria-label="关闭模态框" // WAI-ARIA 属性，提高可访问性
          >
            {/* SVG 图标 */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 图片容器 */}
          <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ maxHeight: 'calc(90vh - 100px)' }}> {/* 限制最大高度，为下方信息区域预留空间 */}
            <Image
              src={image.src}
              alt={image.alt}
              width={1200} // 提供一个较大的宽度值供 Next.js 优化参考
              height={800} // 提供一个较大的高度值供 Next.js 优化参考
              style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', margin: 'auto' }} // 关键样式：宽度100%，高度自适应，保持比例，居中显示
              priority // 优先加载模态框中的图片
              unoptimized={image.src.endsWith('.gif')} // 如果是 GIF 则不进行优化
            />
          </div>

          {/* 图片信息区域 (仅当有 caption 或 date 时显示) */}
          {(image.caption || image.date) && (
            <div className={`p-4 ${themeColors.backgroundLight} border-t flex-shrink-0`}> {/* 背景、边框、防止被压缩 */}
              {image.caption && <p className="font-semibold text-lg mb-1">{image.caption}</p>}
              {image.date && <p className={`text-sm ${themeColors.textGrayMedium}`}>{image.date}</p>}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal; 