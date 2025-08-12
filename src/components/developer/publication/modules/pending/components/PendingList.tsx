"use client";

import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { themeColors } from "@/styles/theme";
import { PublicationWithAuthors } from "@/app/api/publications/route";
import PendingItem from "./PendingItem";

interface PendingListProps {
  publications: PublicationWithAuthors[];
  isLoading: boolean;
  error: string | null;
  processingIds: Set<number>;
  onEdit: (publication: PublicationWithAuthors) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onRetry: () => void;
}

/**
 * 待审核出版物列表组件
 * 负责处理加载、错误和显示状态
 */
const PendingList: React.FC<PendingListProps> = ({
  publications,
  isLoading,
  error,
  processingIds,
  onEdit,
  onApprove,
  onReject,
  onRetry,
}) => {
  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className={`${themeColors.devAccent} w-8 h-8 animate-spin`} />
        <span className={`ml-3 ${themeColors.devText}`}>
          Loading pending publications...
        </span>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div
        className={`p-6 rounded-lg border ${themeColors.devCardBg} border-red-500/30`}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className={`font-medium ${themeColors.devText}`}>
            Error Loading Publications
          </h3>
        </div>
        <p className={`text-sm ${themeColors.devDescText} mb-4`}>{error}</p>
        <button
          onClick={onRetry}
          className={`px-4 py-2 rounded ${themeColors.devButtonBg} ${themeColors.devButtonHoverBg} ${themeColors.devText} transition-colors`}
        >
          Try Again
        </button>
      </div>
    );
  }

  // 空状态
  if (publications.length === 0) {
    return (
      <div
        className={`p-8 text-center rounded-lg border ${themeColors.devCardBg} border-gray-700`}
      >
        <div className={`text-4xl mb-4 ${themeColors.devDescText}`}>📝</div>
        <h3 className={`text-lg font-medium ${themeColors.devText} mb-2`}>
          No Pending Publications
        </h3>
        <p className={`${themeColors.devDescText}`}>
          All publications have been reviewed. New submissions will appear here.
        </p>
      </div>
    );
  }

  // 正常列表显示
  return (
    <div className="grid gap-4">
      {publications.map((publication) => (
        <PendingItem
          key={publication.id}
          publication={publication}
          isProcessing={processingIds.has(publication.id)}
          onEdit={onEdit}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default PendingList;
