import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// 复用 PhotoGallery 中的图片数据接口
interface GalleryImage {
  id: number | string;
  src: string;
  alt: string;
  caption?: string;
  date?: string;
}

interface ModalProps {
  image: GalleryImage | null;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ image, onClose }) => {
  if (!image) return null; // 如果没有选中图片，不渲染任何东西

  return (
    <AnimatePresence>
      {/* 背景遮罩层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose} // 点击背景关闭
      >
        {/* 内容容器，阻止点击事件冒泡到背景 */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-lg shadow-xl overflow-hidden relative max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()} // 阻止点击内容关闭模态框
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 z-10"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 图片容器，限制最大高度 */}
          <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ maxHeight: 'calc(90vh - 100px)' }}> {/* 预留标题和按钮空间 */}
            <Image
              src={image.src}
              alt={image.alt}
              width={1200} // 提供一个较大的宽度参考值
              height={800} // 提供一个较大的高度参考值
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }} // 让图片自适应容器并保持比例
              className="block mx-auto"
            />
          </div>

          {/* 图片信息 */}
          {(image.caption || image.date) && (
            <div className="p-4 bg-gray-100 border-t flex-shrink-0">
              {image.caption && <p className="font-semibold text-lg mb-1">{image.caption}</p>}
              {image.date && <p className="text-sm text-gray-600">{image.date}</p>}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal; 