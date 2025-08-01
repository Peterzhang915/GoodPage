"use client";

import React from "react";
import { ExternalLink, Users, Calendar, Edit3, Check, X, Loader2 } from "lucide-react";
import { themeColors } from "@/styles/theme";
import { PublicationWithAuthors } from "@/app/api/publications/route";

interface PendingItemProps {
  publication: PublicationWithAuthors;
  isProcessing: boolean;
  onEdit: (publication: PublicationWithAuthors) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

/**
 * 待审核出版物单个条目组件
 * 负责显示单个待审核出版物的信息和操作按钮
 */
const PendingItem: React.FC<PendingItemProps> = ({
  publication,
  isProcessing,
  onEdit,
  onApprove,
  onReject,
}) => {
  // 格式化作者信息
  const formatAuthors = (authors: any[]) => {
    if (!authors || authors.length === 0) return "No authors";
    return authors.map(author => author.name_en || author.name_zh || "Unknown").join(", ");
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 border-yellow-500/30 ${themeColors.devCardBg} hover:border-yellow-500 transition-colors`}
    >
      {/* 顶部：标题和外部链接 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className={`text-lg font-medium ${themeColors.devText} flex-1 leading-tight`}>
          {publication.title}
        </h3>
        {publication.pdf_url && (
          <a
            href={publication.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 rounded ${themeColors.devButtonBg} ${themeColors.devButtonHoverBg} transition-colors flex-shrink-0`}
            title="查看PDF"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>

      {/* 中部：作者信息 */}
      {publication.authors && publication.authors.length > 0 && (
        <div className={`flex items-center gap-2 text-sm ${themeColors.devDescText} mb-2`}>
          <Users size={14} />
          <span>{formatAuthors(publication.authors)}</span>
        </div>
      )}

      {/* 底部：场所、年份、操作按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs mt-1">
        <div className={`flex items-center gap-2 ${themeColors.devDescText}`}>
          <Calendar size={14} />
          <span>{publication.year || "N/A"}</span>
          {publication.venue && <span className="italic"> - {publication.venue}</span>}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(publication)} 
            disabled={isProcessing} 
            className={`p-1.5 rounded text-indigo-400 hover:bg-gray-600 transition-colors disabled:opacity-50`}
            title="编辑出版物"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onApprove(publication.id)}
            disabled={isProcessing}
            className={`p-1.5 rounded text-green-400 hover:bg-gray-600 transition-colors disabled:opacity-50`}
            title="批准出版物"
          >
            {isProcessing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
          </button>
          <button
            onClick={() => onReject(publication.id)}
            disabled={isProcessing}
            className={`p-1.5 rounded text-red-400 hover:bg-gray-600 transition-colors disabled:opacity-50`}
            title="拒绝出版物"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingItem;
