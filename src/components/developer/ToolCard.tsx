// src/components/developer/ToolCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

/**
 * ToolCardProps 定义了工具卡片组件的属性。
 */
interface ToolCardProps {
  title: string; // 卡片标题
  description: string; // 卡片描述
  buttonText: string; // 按钮或链接的文本
  icon?: React.ReactNode; // 可选的按钮/链接图标
  onButtonClick: () => void; // 按钮点击时的回调函数（内部操作）
  disabled?: boolean; // 是否禁用按钮（默认为 false）
  externalLink?: string; // 可选的外部链接地址，如果提供，则渲染为 <a> 标签
  delay?: number; // 卡片动画的延迟时间（秒，默认为 0）
}

/**
 * ToolCard 是一个可重用的 UI 组件，用于在开发者工具页面显示单个工具的信息和入口。
 * 它可以渲染一个内部操作按钮或一个外部链接。
 */
const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  buttonText,
  icon,
  onButtonClick,
  disabled = false,
  externalLink,
  delay = 0
}) => (
  // 使用 framer-motion 实现卡片的入场动画
  <motion.div
    initial={{ opacity: 0, y: 20 }} // 初始状态：透明，下方偏移
    animate={{ opacity: 1, y: 0 }} // 动画到：不透明，原始位置
    transition={{ delay, duration: 0.4 }} // 动画持续时间和延迟
    className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between shadow-lg" // 卡片样式
  >
    {/* 卡片内容区域 */}
    <div>
      <h3 className={`text-xl font-semibold mb-3 text-green-400`}>{title}</h3>
      <p className={`text-sm text-gray-400 mb-5`}>{description}</p>
    </div>
    {/* 条件渲染：根据是否提供了 externalLink 来决定渲染链接还是按钮 */}
    {externalLink ? (
      // 渲染为外部链接 (<a> 标签)
      <a
        href={externalLink}
        target="_blank" // 在新标签页打开
        rel="noopener noreferrer" // 安全性考虑
        className={`mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors`} // 链接样式
      >
        {icon} {buttonText} <ExternalLink size={16} className="ml-2"/>
      </a>
    ) : (
      // 渲染为内部操作按钮 (<button> 标签)
      <button
        onClick={onButtonClick} // 绑定点击事件
        disabled={disabled} // 设置禁用状态
        className={`mt-auto inline-flex items-center justify-center px-4 py-2 border ${disabled ? 'border-gray-600' : 'border-transparent'} rounded-md shadow-sm text-sm font-medium ${disabled ? 'text-gray-500 bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors'}`} // 按钮样式（包含禁用状态）
      >
        {icon} {buttonText}
      </button>
    )}
  </motion.div>
);

export default ToolCard;
