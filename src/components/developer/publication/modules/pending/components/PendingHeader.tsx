"use client";

import React from "react";
import { Clock, RefreshCw, PlusCircle, Trash2 } from "lucide-react";
import { themeColors } from "@/styles/theme";

interface PendingHeaderProps {
  count: number;
  isLoading: boolean;
  isClearing?: boolean;
  onRefresh: () => void;
  onAdd: () => void;
  onClearAll?: () => void;
}

/**
 * 待审核出版物头部组件
 * 负责显示标题、计数和操作按钮
 */
const PendingHeader: React.FC<PendingHeaderProps> = ({
  count,
  isLoading,
  isClearing = false,
  onRefresh,
  onAdd,
  onClearAll,
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
          <span
            className={`px-2 py-1 text-xs rounded-full bg-yellow-600 text-yellow-100`}
          >
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

        {/* Clear All 按钮 - 只在有记录时显示 */}
        {count > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            disabled={isClearing}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
              isClearing
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition-colors disabled:opacity-50`}
            title="删除所有待审核出版物"
          >
            <Trash2 size={16} className={isClearing ? "animate-pulse" : ""} />
            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        )}

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
