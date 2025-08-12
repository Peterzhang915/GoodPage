// src/components/gallery/Modal.tsx
"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * 通用模态框组件（Modal）
 * 用于弹出显示图片、表单、提示等内容，支持动画、点击遮罩关闭、ESC关闭等功能。
 *
 * 主要特性：
 * - 支持多种尺寸（sm, md, lg, xl, full）
 * - 支持点击遮罩关闭、ESC关闭
 * - 支持可选标题、关闭按钮
 * - 支持内容自定义
 * - 使用 framer-motion 实现进出场动画
 */

interface ModalProps {
  /**
   * 是否显示模态框
   */
  isOpen: boolean;
  /**
   * 关闭模态框的回调函数
   */
  onClose: () => void;
  /**
   * 模态框内容
   */
  children: ReactNode;
  /**
   * 可选标题
   */
  title?: string;
  /**
   * 尺寸类型
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /**
   * 是否允许点击遮罩关闭
   */
  closeOnOverlayClick?: boolean;
  /**
   * 是否显示右上角关闭按钮
   */
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  // 用于判断点击事件是否发生在内容区外
  const modalRef = useRef<HTMLDivElement>(null);

  // 监听 ESC 键，按下时关闭模态框
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    } else {
      document.removeEventListener("keydown", handleEsc);
    }
    // 组件卸载时清理事件监听
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  /**
   * 处理点击遮罩关闭逻辑
   * 只有点击在内容区外时才会关闭
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOverlayClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  /**
   * 根据 size prop 返回不同的最大宽度类名
   */
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-3xl";
      case "xl":
        return "max-w-6xl";
      case "full":
        return "max-w-full h-full";
      case "md":
      default:
        return "max-w-lg";
    }
  };

  return (
    // AnimatePresence 用于 framer-motion 动画的进出场
    <AnimatePresence>
      {isOpen && (
        // 遮罩层，带深色半透明背景和模糊效果
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050509cc] bg-opacity-60 backdrop-blur-sm p-4"
          onClick={handleOverlayClick}
        >
          {/* 内容区，带圆角、阴影、动画 */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }} // 初始动画状态
            animate={{ scale: 1, opacity: 1, y: 0 }} // 进入动画
            exit={{ scale: 0.95, opacity: 0, y: 10 }} // 退出动画
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`bg-white rounded-lg shadow-xl overflow-hidden w-full ${getSizeClasses()} relative flex flex-col max-h-[90vh]`}
          >
            {/* 右上角关闭按钮 */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 z-10"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
            {/* 可选标题栏 */}
            {title && (
              <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-200 flex-shrink-0">
                {title}
              </h2>
            )}
            {/* 主体内容区 */}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
