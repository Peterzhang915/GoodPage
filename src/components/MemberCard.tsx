"use client"; // 标记为客户端组件，因为它使用了 Hooks 和事件处理

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import JSConfetti from 'js-confetti'; // 用于纸屑效果
import { motion } from 'framer-motion'; // 用于动画效果
import { themeColors } from '@/styles/theme'; // 导入主题颜色
// 【修改】从 types.ts 导入 MemberForCard 类型
import type { MemberForCard } from '@/lib/types'; // 不再需要导入基础 Member 类型
import { MemberStatus } from '@/lib/prisma';

// 默认头像和 Emojis
const placeholderAvatar = '/avatars/placeholder.png';
const defaultEmojis = ['✨', '💖', '🚀'];

// 定义组件接收的 Props 类型
interface MemberCardProps {
  member: MemberForCard; // 【修改】使用 MemberForCard 类型
  isEmojiEnabled: boolean; // 是否启用 Emoji 特效的状态
}

// JSConfetti 配置类型的扩展 (确保与库的实际参数匹配或使用 as any)
interface ExtendedConfettiConfig {
  emojis?: string[];
  emojiSize?: number;
  confettiNumber?: number;
  // 注意：JSConfetti v0.11.0 似乎没有 initialPosition 选项，
  //       触发位置通常是画布中心。如果需要精确位置，可能需要其他库或技巧。
  // initialPosition?: { x: number; y: number };
}

export function MemberCard({ member, isEmojiEnabled }: MemberCardProps) {
  // Refs 用于存储 confetti 实例和 canvas 元素
  const confettiRef = useRef<JSConfetti | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null); // Ref 用于卡片 div

  // Effect Hook 用于初始化和清理 JSConfetti 实例和 Canvas
  useEffect(() => {
    let jsConfetti: JSConfetti | null = null;
    let canvasElement: HTMLCanvasElement | null = null;

    if (isEmojiEnabled && typeof window !== 'undefined') {
      // 只有在启用 Emoji 且在浏览器环境时才初始化
      if (!confettiRef.current) {
        // 创建 Canvas
        canvasElement = document.createElement('canvas');
        canvasElement.style.position = 'fixed'; // 固定定位，覆盖全屏
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';
        canvasElement.style.pointerEvents = 'none'; // 不阻挡鼠标事件
        canvasElement.style.zIndex = '9999';      // 置于顶层
        document.body.appendChild(canvasElement); // 添加到 body
        canvasRef.current = canvasElement;

        // 初始化 JSConfetti
        jsConfetti = new JSConfetti({ canvas: canvasElement });
        confettiRef.current = jsConfetti;
        console.log("Confetti initialized for card:", member.id); // 调试日志
      } else {
         // 如果实例已存在 (可能因为快速切换状态)，确保引用是最新的
         jsConfetti = confettiRef.current;
         canvasElement = canvasRef.current;
      }
    }

    // 清理函数：在组件卸载或 isEmojiEnabled 变为 false 时执行
    return () => {
      console.log("Cleaning up confetti for card:", member.id); // 调试日志
      try {
          // 尝试清理 Canvas 内容
          confettiRef.current?.clearCanvas();
          // 移除 Canvas 元素
          if (canvasRef.current && canvasRef.current.parentNode) {
              canvasRef.current.remove();
          }
      } catch(e) {
          console.error("Error during confetti cleanup:", e);
      } finally {
          // 重置 Refs
          confettiRef.current = null;
          canvasRef.current = null;
      }
    };
  }, [isEmojiEnabled, member.id]); // 依赖项包含 isEmojiEnabled 和 member.id

  // 鼠标移入卡片时的处理函数
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEmojiEnabled || !confettiRef.current || !cardRef.current) return; // 防御性检查

    // 解析成员喜欢的 Emojis，如果没设置或为空则使用默认值
    const emojis = member.favorite_emojis
                    ?.split(',') // 按逗号分割
                    .map(emoji => emoji.trim()) // 去除空格
                    .filter(Boolean) // 过滤空字符串
                  ?? defaultEmojis; // 如果 favorite_emojis 为 null/undefined，使用默认

    // 如果解析后没有 emojis (例如 csv 里是空字符串但 split 后 filter 掉了)，则使用默认
    const finalEmojis = emojis.length > 0 ? emojis : defaultEmojis;

    // 配置 Confetti
    const config: ExtendedConfettiConfig = {
      emojis: finalEmojis,
      emojiSize: 50, // 稍微增大 Emoji 大小
      confettiNumber: 10, // 减少数量，避免过于密集
    };

    // 触发 Confetti! 使用 as any 忽略可能的类型检查问题
    confettiRef.current.addConfetti(config as any);
  };

  return (
    // 使用 Link 组件包裹整个卡片，使其可点击跳转
    <Link href={`/members/${member.id}`} className="block group h-full"> {/* 确保 Link 也是 h-full */}
      {/* 使用 motion.div 实现 Framer Motion 动画 */}
      <motion.div
        ref={cardRef} // 关联 Ref
        onMouseEnter={handleMouseEnter} // 绑定鼠标移入事件 (只有 isEmojiEnabled 才实际触发)
        // 基础样式: 相对定位, 背景, 边框, 圆角, 阴影, hover效果, 过渡, padding, flex 布局, 垂直排列居中, 高度充满父容器, 防溢出
        className={`relative ${themeColors.backgroundWhite ?? 'bg-white'} border ${themeColors.borderLight ?? 'border-gray-200'} rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col items-center text-center h-full overflow-hidden`}
        // Hover 动画: Y 轴向上移动 5px
        whileHover={{ y: -5 }}
        // 过渡效果: spring 类型，刚度 300
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* 头像容器: 尺寸, 圆形, 溢出隐藏, 下边距, 边框, hover 时边框变色 + 缩放 */}
        <div className={`w-20 h-20 rounded-full overflow-hidden mb-4 border-2 ${themeColors.borderLight ?? 'border-gray-300'} group-hover:border-${themeColors.primary ?? 'blue-600'} group-hover:scale-105 transition-all duration-300 flex-shrink-0 z-10 shadow-sm`}> {/* 添加基础阴影 */}
          <Image
            src={member.avatar_url || placeholderAvatar} // 使用成员头像或占位符
            alt={`${member.name_zh || member.name_en} 头像`} // Alt 文本优先用中文名
            width={80} // 图像宽度
            height={80} // 图像高度
            className="object-cover w-full h-full" // 确保图像覆盖容器
            priority={member.status === MemberStatus.PROFESSOR} // 教师头像优先加载 (可选)
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              // 图片加载失败时，切换到占位符
              const target = e.target as HTMLImageElement;
              target.src = placeholderAvatar;
              target.onerror = null; // 防止无限循环
            }}
          />
        </div>
        {/* 文本信息容器 */}
        <div className="flex flex-col justify-center flex-grow z-10 w-full px-1"> {/* 允许内容增长，添加左右 padding */}
          <div>
            {/* 中文名: 字体大小，加粗，颜色，hover 变色 */}
            <h3 className={`text-base font-semibold ${themeColors.textColorPrimary ?? ''} group-hover:${themeColors.primary ?? 'text-blue-600'} transition-colors duration-300 mb-0.5 truncate`} title={member.name_zh ?? ''}>{member.name_zh}</h3>
             {/* 英文名: 小字体，次要颜色，hover 变色 */}
            {member.name_en && <p className={`text-xs ${themeColors.textColorSecondary ?? 'text-gray-500'} group-hover:${themeColors.textColorPrimary ?? 'text-gray-700'} transition-colors duration-300 truncate`} title={member.name_en}>{member.name_en}</p>}
          </div>
           {/* 显示状态: 小字体，强调色，标签样式 */}
          <p className={`text-xs font-medium ${themeColors.accentColor ?? 'text-purple-700'} mt-2 ${themeColors.primaryBg ?? 'bg-purple-100'} px-2 py-0.5 rounded-full inline-block self-center`}>{member.displayStatus}</p> {/* 使用主题强调色 */}
           {/* 研究兴趣 (可选，小字体显示部分) */}
           {member.research_interests && (
             <p className={`text-xs ${themeColors.textColorTertiary ?? 'text-gray-500'} mt-3 px-1 leading-snug line-clamp-2`} title={member.research_interests}> {/* 最多显示两行 */}
               Interests: {member.research_interests.split(',').map(s=>s.trim()).join(', ')}
             </p>
           )}
        </div>
      </motion.div>
    </Link>
  );
}