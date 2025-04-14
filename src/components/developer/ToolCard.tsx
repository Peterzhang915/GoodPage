// src/components/developer/ToolCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Lock } from 'lucide-react';
import { themeColors } from '@/styles/theme'; // Import theme colors

/**
 * ToolCardProps 定义了工具卡片组件的属性。
 */
interface ToolCardProps {
  title: string; // 卡片标题
  description: string; // 卡片描述
  buttonText: string; // 按钮或链接的文本
  icon?: React.ReactNode; // 可选的按钮/链接图标
  onButtonClick?: () => void; // 按钮点击时的回调函数（内部操作） - 改为可选
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
  externalLink,
  delay = 0
}) => {
  const isDisabled = disabled && !externalLink;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }} 
      className={`${themeColors.devCardBg} p-6 rounded-lg ${themeColors.devBorder} flex flex-col justify-between shadow-lg relative ${isDisabled ? 'opacity-70' : ''}`}
    >
      {/* {isDisabled && <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-lg z-10"></div>} */}
      
      <div className={`relative z-0 ${isDisabled ? 'filter blur-[2px] select-none pointer-events-none' : ''}`}> 
        <h3 className={`text-xl font-semibold mb-3 ${isDisabled ? themeColors.devDisabledText : themeColors.devTitleText}`}>
          {isDisabled ? 'Permission Required' : title}
        </h3>
        <p className={`text-sm mb-5 ${isDisabled ? themeColors.devDescDisabledText : themeColors.devDescText}`}>
          {isDisabled ? 'You do not have permission to access this tool.' : description}
        </p>
      </div>
      
      <div className="relative z-0 mt-auto"> 
          {externalLink ? (
            <a
              href={externalLink}
              target="_blank" 
              rel="noopener noreferrer" 
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${themeColors.devButtonBg} ${themeColors.devButtonText} hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors`} 
            >
              {icon} {buttonText} <ExternalLink size={16} className="ml-2"/>
            </a>
          ) : (
            <button
              onClick={onButtonClick} 
              disabled={isDisabled}
              className={`w-full inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors 
              ${isDisabled 
                ? `${themeColors.devButtonDisabledBorder} ${themeColors.devDisabledText} ${themeColors.devButtonDisabledBg} cursor-not-allowed` 
                : `border-transparent ${themeColors.devButtonBg} ${themeColors.devButtonText} hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500`}`
              }
            >
              {isDisabled ? <Lock size={16} className="mr-2"/> : icon} 
              {isDisabled ? 'Permission Required' : buttonText}
            </button>
          )}
       </div>
    </motion.div>
  );
};

export default ToolCard;
