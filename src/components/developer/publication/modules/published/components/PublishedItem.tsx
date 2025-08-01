"use client";

import React from "react";
import { BookOpen, Users, Calendar, Edit3, Trash2 } from "lucide-react";
import { themeColors } from "@/styles/theme";
import { PublicationWithAuthors } from "@/app/api/publications/route";

interface PublishedItemProps {
  publication: PublicationWithAuthors;
  isDeleting: boolean;
  onEdit: (publication: PublicationWithAuthors) => void;
  onDelete: (id: number) => void;
}

/**
 * 格式化作者信息显示
 * 优先使用 authors 关系中的英文名字，确保 "First Last" 格式
 * 处理 "Last, First" 格式并转换为 "First Last"
 */
const formatAuthors = (publication: PublicationWithAuthors): string => {
  // 优先使用 authors 关系中的英文名字
  if (publication.authors && publication.authors.length > 0) {
    const authors = publication.authors
      .map(pa => {
        const nameEn = pa.author?.name_en;
        if (!nameEn) return 'Unknown Author';

        // 处理 "Last, First" 格式，转换为 "First Last"
        if (nameEn.includes(',')) {
          const parts = nameEn.split(',').map(part => part.trim());
          if (parts.length === 2 && parts[0] && parts[1]) {
            // 转换 "Last, First" 为 "First Last"
            return `${parts[1]} ${parts[0]}`;
          }
        }

        // 如果不包含逗号或格式不匹配，直接返回原始英文名字
        return nameEn;
      })
      .filter(name => name !== 'Unknown Author' || publication.authors!.length === 1);

    return authors.join(', ');
  }

  // 回退到 authors_full_string 字段
  if (publication.authors_full_string) {
    // 【修复】保持原始的分号分隔符，不要替换成逗号
    return publication.authors_full_string
      .split(';')
      .map(author => author.trim())
      .filter(author => author)
      .join('; '); // 保持分号分隔
  }

  return "No authors listed";
};

/**
 * 已发布出版物单个条目组件
 * 负责显示单个出版物的信息和操作按钮
 * 样式与原版 PublicationManager 完全一致
 */
const PublishedItem: React.FC<PublishedItemProps> = ({
  publication,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  return (
    <li className={`p-4 rounded-md border ${themeColors.devBorder} bg-gray-700/30 flex flex-col gap-3`}>
      {/* Top section: Title and Links */}
      <div className="flex justify-between items-start gap-2">
        <h5 className={`font-medium flex-1 ${themeColors.devTitleText}`}>
          {publication.title || "No Title"}
        </h5>
        <div className="flex items-center gap-3 flex-shrink-0 text-xs">
          {publication.dblp_url && (
            <a
              href={publication.dblp_url}
              target="_blank"
              rel="noopener noreferrer"
              title="DBLP Link"
              className={`${themeColors.devDescText} hover:text-indigo-400 transition-colors flex items-center gap-1`}
            >
              DBLP
            </a>
          )}
          {publication.pdf_url && (
            <a
              href={publication.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeColors.devDescText} hover:text-indigo-400 transition-colors flex items-center gap-1`}
            >
              <BookOpen size={12} /> PDF
            </a>
          )}
        </div>
      </div>

      {/* Middle section: Authors (Formatted) */}
      <div className={`text-xs flex items-start gap-1.5 ${themeColors.devDescText}`}>
        <Users size={14} className="flex-shrink-0 mt-0.5" />
        <span className="flex-1 break-words">
          {formatAuthors(publication)}
        </span>
      </div>

      {/* Bottom section: Venue, Year, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs mt-1">
        <div className={`flex items-center gap-2 ${themeColors.devDescText}`}>
          <Calendar size={14} />
          <span>{publication.year || "N/A"}</span>
          {publication.venue && <span className="italic"> - {publication.venue}</span>}
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(publication)}
            disabled={isDeleting}
            className={`p-1.5 rounded text-indigo-400 hover:bg-gray-600 transition-colors disabled:opacity-50`}
            title="Edit Publication"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(publication.id)}
            disabled={isDeleting}
            className={`p-1.5 rounded text-red-400 hover:bg-gray-600 transition-colors disabled:opacity-50`}
            title="Delete Publication"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </li>
  );
};

export default PublishedItem;
