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
        className="fixed inset-0 backdrop-blur-sm bg-transparent z-50 flex items-center justify-center" // 改为透明背景，只保留模糊效果
        onClick={onClose} // 点击背景遮罩层时调用 onClose 关闭模态框
      >
        {/* 模态框内容容器 */}
        <motion.div
          key="modal-content" // 为 AnimatePresence 的直接子元素提供 key (如果 AnimatePresence 直接包裹这个 div 的话)
          initial={{ scale: 0.7, opacity: 0 }} // 初始状态：缩小、透明
          animate={{ scale: 1, opacity: 1 }}   // 动画到状态：正常大小、不透明
          exit={{ scale: 0.7, opacity: 0 }}    // 退出动画：缩小、变透明
          transition={{ type: "spring", stiffness: 300, damping: 30 }} // 使用弹簧动画效果
          className="relative bg-transparent rounded-lg overflow-hidden max-w-5xl w-auto max-h-[90vh] flex flex-col" // 改为透明背景，移除阴影和白色背景
          onClick={(e) => e.stopPropagation()} // 阻止点击内容区域时触发背景层的 onClick，防止意外关闭
        >
          {/* 关闭按钮 (X) */}
          <button
            onClick={onClose} // 点击按钮时调用 onClose 关闭模态框
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-150 ease-in-out z-10" // 修改样式以适应透明背景
            aria-label="关闭模态框" // WAI-ARIA 属性，提高可访问性
          >
            {/* SVG 图标 */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 图片容器 */}
          <div className="relative w-full flex-shrink-0 flex justify-center items-center" style={{ maxHeight: 'calc(90vh - 80px)' }}> 
            <div className="relative inline-block">
              <Image
                src={image.src}
                alt={image.alt}
                width={1200}
                height={800}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 'calc(90vh - 80px)', 
                  objectFit: 'contain',
                  display: 'block'
                }}
                priority
                unoptimized={image.src.endsWith('.gif')}
                className="rounded-t-lg shadow-lg"
              />
              
              {/* 图片信息区域 (仅当有 caption 或 date 时显示) - 位于图片底部，宽度与图片相同 */}
              {(image.caption || image.date) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="bg-white rounded-b-lg text-left"
                  style={{ 
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    borderTop: '3px solid #3b82f6',
                    borderLeft: '1px solid #e5e7eb',
                    borderRight: '1px solid #e5e7eb',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <div className="flex flex-col py-3 px-5">
                    {image.caption && (
                      <span className="text-sm font-semibold text-gray-800">
                        {image.caption}
                      </span>
                    )}
                    {image.date && (
                      <span className="text-xs text-gray-600 mt-1">
                        {image.date}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal; 