"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { themeColors } from "@/styles/theme";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * 搜索栏组件
 * 提供搜索输入和清除功能
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Search publications...",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search 
          size={16} 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeColors.devDescText}`} 
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2 rounded-lg border
            ${themeColors.devBorder} ${themeColors.devInputBg} ${themeColors.devText}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder:${themeColors.devDescText}
          `}
        />
        {value && (
          <button
            onClick={onClear}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              p-1 rounded-full hover:bg-gray-600 transition-colors
              ${themeColors.devDescText} hover:text-white
            `}
            title="清除搜索"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
