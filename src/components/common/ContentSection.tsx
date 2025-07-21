// src/components/common/ContentSection.tsx
"use client";

import React from "react";
import { motion, MotionProps, Transition } from "framer-motion";

/**
 * Type definition for the props of the ContentSection component.
 * Extends Framer Motion's MotionProps to allow passing animation properties.
 */
type ContentSectionProps = Omit<MotionProps, "children"> & {
  // Omit original children to avoid conflict
  /** The unique ID for the section element, used for navigation. */
  id: string;
  /** The title text displayed at the top of the section. */
  title: string;
  /** The content to be rendered within the section. */
  children: React.ReactNode;
  /** Optional additional CSS classes to apply to the section container. Defaults to 'mb-16'. */
  className?: string;
  /** Optional additional CSS classes to apply to the title (h2) element. */
  titleClassName?: string;
  // Animation props are implicitly included via MotionProps
  // We don't need to redefine initial, whileInView, viewport, transition here
  // unless we want to make their types more specific or required.
  // Defaults are handled in the component implementation.
};

const ContentSection: React.FC<ContentSectionProps> = ({
  id,
  title,
  children,
  className = "mb-16", // 默认下边距
  titleClassName = "text-2xl font-serif font-bold mb-6 border-b border-gray-300 pb-2", // 默认标题样式
  // 解构 MotionProps，并设置默认动画
  initial = { opacity: 0, y: 20 },
  whileInView = { opacity: 1, y: 0 },
  viewport = { once: true, amount: 0.2 }, // 默认触发一次，可见 20% 时触发
  transition = { duration: 0.5, delay: 0.1 },
  ...rest // 传递其他 motion 属性
}) => {
  return (
    <motion.section
      id={id}
      // 合并传入的 className 和 scroll-mt
      className={`scroll-mt-16 ${className}`}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      {...rest}
    >
      <h2 className={titleClassName}>{title}</h2>
      {children}
    </motion.section>
  );
};

export default ContentSection;
