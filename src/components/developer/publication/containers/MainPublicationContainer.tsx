"use client";

import React from "react";
import { themeColors } from "@/styles/theme";

// 导入已发布出版物管理器
import PublishedManager from "../modules/published/PublishedManager";

interface MainPublicationContainerProps {
  className?: string;
}

/**
 * 主出版物管理容器组件
 * 直接显示已发布出版物管理器，与原版 PublicationManager 保持一致
 */
const MainPublicationContainer: React.FC<MainPublicationContainerProps> = ({
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      <PublishedManager />
    </div>
  );
};

export default MainPublicationContainer;
