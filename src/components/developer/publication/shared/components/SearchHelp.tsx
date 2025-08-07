"use client";

import React, { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { themeColors } from "@/styles/theme";

/**
 * 搜索帮助组件
 * 提供搜索功能的使用说明
 */
const SearchHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* 帮助按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg ${themeColors.devCardBg} border ${themeColors.devBorder} hover:bg-gray-700 transition-colors`}
        title="搜索帮助"
      >
        <HelpCircle className="w-4 h-4 text-blue-400" />
      </button>

      {/* 帮助面板 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          <div className={`p-4 rounded-lg ${themeColors.devCardBg} border ${themeColors.devBorder} shadow-xl`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium ${themeColors.devText}`}>搜索帮助</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className={`text-sm ${themeColors.devDescText} space-y-2`}>
              <div>
                <p className="font-medium text-blue-400 mb-1">支持的搜索字段：</p>
                <ul className="space-y-1 text-xs">
                  <li>• <span className="text-white">标题</span> - 论文标题</li>
                  <li>• <span className="text-white">作者</span> - 中英文姓名</li>
                  <li>• <span className="text-white">会议/期刊</span> - 发表场所</li>
                  <li>• <span className="text-white">年份</span> - 发表年份</li>
                  <li>• <span className="text-white">类型</span> - 论文类型</li>
                  <li>• <span className="text-white">摘要</span> - 论文摘要</li>
                  <li>• <span className="text-white">关键词</span> - 论文关键词</li>
                  <li>• <span className="text-white">出版商</span> - 出版商名称</li>
                  <li>• <span className="text-white">CCF等级</span> - A/B/C等级</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-blue-400 mb-1">搜索技巧：</p>
                <ul className="space-y-1 text-xs">
                  <li>• <span className="text-white">多关键词</span> - 用空格分隔，如 "machine learning 2023"</li>
                  <li>• <span className="text-white">精确匹配</span> - 所有关键词都必须匹配</li>
                  <li>• <span className="text-white">不区分大小写</span> - 自动忽略大小写</li>
                  <li>• <span className="text-white">实时搜索</span> - 输入即搜索，无需按回车</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHelp;
