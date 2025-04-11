"use client"; // 将 Footer 标记为客户端组件

import React, { useState, useEffect } from 'react';
import { themeColors } from '../styles/theme';

// 将 getOrdinalSuffix 移到 Footer 内部
function getOrdinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) {
    return 'th';
  }
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// 不再需要 Props 接口
// interface FooterProps {
//   visitCount: number | null;
//   getOrdinalSuffix: (n: number) => string;
// }

// 组件现在自己管理状态和获取数据
const Footer: React.FC = () => {
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchVisitCount = async () => {
      try {
        // 确保 API 路径正确
        const response = await fetch('/api/visit');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        setVisitCount(data.count);
      } catch (error) {
        console.error("Failed to fetch visit count:", error);
        setVisitCount(0); // 错误处理
      }
    };
    fetchVisitCount();
  }, []); // 空依赖确保只运行一次

  return (
    <footer className={`mt-16 ${themeColors.footerBackground} ${themeColors.footerBorder} pt-8 pb-8 text-center ${themeColors.footerTextColor} text-sm w-full`}>
      {/* 页脚内容也限制宽度可能更好看 */}
      <p>@COPYRIGHT NCU GOOD LAB All rights reserved.</p>
      <p className="mt-2">
        {visitCount === null
          ? 'Loading visitor count...'
          : visitCount === 0
          ? 'Welcome!'
          : `You are the ${visitCount}${getOrdinalSuffix(visitCount)} visitor`
        }
      </p>
    </footer>
  );
};

export default Footer; 