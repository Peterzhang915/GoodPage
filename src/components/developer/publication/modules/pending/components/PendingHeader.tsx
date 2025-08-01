"use client";

import React from "react";
import { Clock, RefreshCw, PlusCircle } from "lucide-react";
import { themeColors } from "@/styles/theme";

interface PendingHeaderProps {
  count: number;
  isLoading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
}

/**
 * 待审核出版物头部组件
 * 负责显示标题、计数和操作按钮
 */
const PendingHeader: React.FC<PendingHeaderProps> = ({
  count,
  isLoading,
  onRefresh,
  onAdd,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* 左侧：标题和计数 */}
      <div className="flex items-center gap-3">
        <Clock className={`${themeColors.devAccent} w-6 h-6`} />
        <h2 className={`text-xl font-semibold ${themeColors.devText}`}>
          Pending Publications
        </h2>
        {count > 0 && (
          <span className={`px-2 py-1 text-xs rounded-full bg-yellow-600 text-yellow-100`}>
            {count}
          </span>
        )}
      </div>
      
      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${themeColors.devButtonBg} ${themeColors.devButtonHoverBg} transition-colors disabled:opacity-50`}
          title="刷新待审核出版物列表"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
        
        <button
          onClick={onAdd}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm bg-yellow-600 hover:bg-yellow-700 text-white transition-colors`}
        >
          <PlusCircle size={16} />
          Add Pending
        </button>
      </div>
    </div>
  );
};

export default PendingHeader;
