"use client";

import React from "react";
import { Loader2, Inbox } from "lucide-react";
import { themeColors } from "@/styles/theme";
import { PublicationWithAuthors } from "@/app/api/publications/route";
import PublishedItem from "./PublishedItem";

interface PublishedListProps {
  publications: PublicationWithAuthors[];
  isLoading: boolean;
  error: string | null;
  deletingIds: Set<number>;
  onEdit: (publication: PublicationWithAuthors) => void;
  onDelete: (id: number) => void;
  onRetry?: () => void;
}

/**
 * 已发布出版物列表组件
 * 负责处理加载、错误和列表展示状态
 */
const PublishedList: React.FC<PublishedListProps> = ({
  publications,
  isLoading,
  error,
  deletingIds,
  onEdit,
  onDelete,
  onRetry,
}) => {
  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className={`${themeColors.devAccent} w-8 h-8 animate-spin`} />
        <span className={`ml-3 ${themeColors.devDescText}`}>Loading publications...</span>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className={`p-3 rounded-full ${themeColors.errorBg} mb-4`}>
          <Inbox className="w-8 h-8 text-red-400" />
        </div>
        <p className={`text-lg font-medium ${themeColors.devText} mb-2`}>Failed to Load</p>
        <p className={`${themeColors.devDescText} mb-4 max-w-md`}>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`px-4 py-2 rounded text-sm ${themeColors.devButtonBg} ${themeColors.devButtonHoverBg} transition-colors`}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // 空状态
  if (publications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className={`p-3 rounded-full ${themeColors.devMutedBg} mb-4`}>
          <Inbox className={`w-8 h-8 ${themeColors.devDescText}`} />
        </div>
        <p className={`text-lg font-medium ${themeColors.devText} mb-2`}>No Publications Found</p>
        <p className={`${themeColors.devDescText} mb-4`}>Get started by adding your first publication.</p>
      </div>
    );
  }

  // 列表展示
  return (
    <ul className="space-y-4">
      {publications.map((publication) => (
        <PublishedItem
          key={publication.id}
          publication={publication}
          isDeleting={deletingIds.has(publication.id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default PublishedList;
