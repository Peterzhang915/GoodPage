// src/components/developer/ToolCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Lock } from 'lucide-react';

/**
 * ToolCardProps 定义了工具卡片组件的属性。
 */
interface ToolCardProps {
  title: string; // 卡片标题
  description: string; // 卡片描述
  buttonText: string; // 按钮或链接的文本
  icon?: React.ReactNode; // 可选的按钮/链接图标
  onButtonClick: () => void; // 按钮点击时的回调函数（内部操作）
  disabled?: boolean; // 是否禁用按钮（默认为 false），现在也用于控制内容的显示
  externalLink?: string; // 可选的外部链接地址，如果提供，则渲染为 <a> 标签
  delay?: number; // 卡片动画的延迟时间（秒，默认为 0）
}

/**
 * ToolCard 是一个可重用的 UI 组件，用于在开发者工具页面显示单个工具的信息和入口。
 * 它可以渲染一个内部操作按钮或一个外部链接。
 * 当 disabled 为 true 时，会显示权限不足的遮蔽效果。
 */
const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  buttonText,
  icon,
  onButtonClick,
  disabled = false,
  externalLink, // 注意：外部链接卡片目前不支持权限控制禁用，因为它们不调用 onButtonClick
  delay = 0
}) => {
  const isDisabled = disabled && !externalLink; // 仅当是内部工具按钮且 disabled=true 时才应用遮蔽效果

  return (
    // 使用 framer-motion 实现卡片的入场动画
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }} 
      className={`bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between shadow-lg relative ${isDisabled ? 'opacity-70' : ''}`} // 禁用时降低整体透明度
    >
      {/* 禁用时的遮罩效果 (可选) */}
      {/* {isDisabled && <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-lg z-10"></div>} */}
      
      {/* 卡片内容区域 */}
      <div className={`relative z-0 ${isDisabled ? 'filter blur-[2px] select-none pointer-events-none' : ''}`}> {/* 禁用时模糊内容 */} 
        <h3 className={`text-xl font-semibold mb-3 ${isDisabled ? 'text-gray-500' : 'text-green-400'}`}>
          {isDisabled ? 'Permission Required' : title}
        </h3>
        <p className={`text-sm mb-5 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>
          {isDisabled ? 'You do not have permission to access this tool.' : description}
        </p>
      </div>
      
      {/* 按钮/链接区域 */}
      <div className="relative z-0 mt-auto"> {/* 确保按钮在模糊效果之上，但仍在卡片内 */}
          {externalLink ? (
            // 渲染为外部链接 (<a> 标签) - 保持不变
            <a
              href={externalLink}
              target="_blank" 
              rel="noopener noreferrer" 
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors`} // 链接样式
            >
              {icon} {buttonText} <ExternalLink size={16} className="ml-2"/>
            </a>
          ) : (
            // 渲染为内部操作按钮 (<button> 标签)
            <button
              onClick={onButtonClick} 
              disabled={isDisabled} // 使用 isDisabled 控制按钮禁用
              className={`w-full inline-flex items-center justify-center px-4 py-2 border ${isDisabled ? 'border-gray-600' : 'border-transparent'} rounded-md shadow-sm text-sm font-medium ${isDisabled ? 'text-gray-500 bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors'}`} 
            >
              {/* 禁用时显示 Lock 图标，否则显示传入的图标 */} 
              {isDisabled ? <Lock size={16} className="mr-2"/> : icon} 
              {/* 禁用时显示固定文本 */} 
              {isDisabled ? 'Permission Required' : buttonText}
            </button>
          )}
       </div>
    </motion.div>
  );
};

export default ToolCard;
