"use client";

import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface ContentSectionProps extends MotionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  // 可以添加更多自定义样式的 props，例如标题样式、边距等
  className?: string;
  titleClassName?: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  id,
  title,
  children,
  className = 'mb-16', // 默认下边距
  titleClassName = 'text-2xl font-serif font-bold mb-6 border-b pb-2', // 默认标题样式
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