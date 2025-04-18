"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Save,
  History,
  Loader2,
  X,
  ArrowLeft,
  Trash2,
  CheckCircle,
  Edit2,
  Radio,
} from "lucide-react";
// Removed themeColors import as we use hardcoded dark theme classes now

// --- 辅助函数：格式化日期 --- //
function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
}

// --- 接口定义 --- //
interface NewsData {
  title: string;
  news: string[];
}

interface NewsHistoryEntry {
  timestamp: string; // 时间戳，或 'live', 'draft' 等特殊值
  title: string;
  news: string[];
  isLive?: boolean; // 是否为线上版本
  isDraft?: boolean; // 是否为当前草稿
}

interface NewsEditorProps {
  onClose: () => void;
}

// --- 新闻编辑器组件 --- //
const NewsEditor: React.FC<NewsEditorProps> = ({ onClose }) => {
  // 编辑器状态
  const [title, setTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [isLoading, setIsLoading] = useState(true); // 初始加载状态
  const [isSaving, setIsSaving] = useState(false); // 保存操作状态
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info" | null
  >(null);

  // 历史记录功能状态
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newsHistory, setNewsHistory] = useState<NewsHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null); // 跟踪正在删除的历史记录时间戳

  // 获取当前线上新闻 (组件挂载时)
  const fetchLiveNews = useCallback(async (showLoadingMessage = true) => {
    if (showLoadingMessage) {
      setIsLoading(true);
      setStatusMessage("Loading live news data...");
      setMessageType("info");
    }
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed to fetch news");
      const data: NewsData = await res.json();
      if (data && typeof data.title === "string" && Array.isArray(data.news)) {
        setTitle(data.title);
        setNewsContent(data.news.join("\n"));
        if (showLoadingMessage) {
          setStatusMessage("Live news data loaded.");
          setMessageType("success");
          setTimeout(() => setStatusMessage(null), 2000);
        }
      } else {
        throw new Error("Invalid data format received for live news.");
      }
    } catch (err) {
      console.error("Fetch live news error:", err);
      setStatusMessage("Failed to load live news data.");
      setMessageType("error");
    } finally {
      if (showLoadingMessage) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveNews();
  }, [fetchLiveNews]);

  // 处理保存新闻逻辑
  const handleSaveNews = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    setMessageType(null);
    setHistoryError(null);
    try {
      const currentTitle = title.trim() || "(Untitled)";
      const newsArray = newsContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const payload: NewsData = { title: currentTitle, news: newsArray };

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Save failed with status: " + res.status }));
        throw new Error(errorData.error || "Failed to save news");
      }
      setStatusMessage("News updated successfully!");
      setMessageType("success");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Save news error:", err);
      setStatusMessage(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  // 获取新闻历史记录 (包含线上版本和当前草稿)
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    setNewsHistory([]);
    try {
      // 并发获取历史记录和线上数据
      const [historyRes, liveRes] = await Promise.all([
        fetch("/api/news/history"),
        fetch("/api/news"),
      ]);

      // 处理历史记录
      if (!historyRes.ok) throw new Error("Failed to fetch history");
      const historyData: NewsHistoryEntry[] = await historyRes.json();
      if (!Array.isArray(historyData))
        throw new Error("Invalid history data format.");

      // 处理线上数据
      if (!liveRes.ok)
        throw new Error("Failed to fetch live data for history view");
      const liveData: NewsData = await liveRes.json();
      if (
        !liveData ||
        typeof liveData.title !== "string" ||
        !Array.isArray(liveData.news)
      ) {
        throw new Error("Invalid live data format received.");
      }

      // 创建线上版本条目
      const liveEntry: NewsHistoryEntry = {
        timestamp: "live", // 特殊标识符
        title: liveData.title,
        news: liveData.news,
        isLive: true,
      };

      // 创建草稿条目 (基于当前编辑器状态)
      const draftNewsArray = newsContent
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const draftEntry: NewsHistoryEntry = {
        timestamp: "draft", // 特殊标识符
        title: title || "(Current Draft)", // 使用编辑器标题或占位符
        news: draftNewsArray,
        isDraft: true,
      };

      // 合并：线上版本、草稿、历史记录
      const combinedHistory = [liveEntry, draftEntry, ...historyData];

      setNewsHistory(combinedHistory);
      setShowHistoryModal(true);
    } catch (err) {
      console.error("Fetch history/live error:", err);
      setHistoryError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred fetching data",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 从历史记录、线上版本或草稿加载特定版本
  const loadVersion = (version: NewsHistoryEntry) => {
    setTitle(version.title || "(Untitled)"); // 加载标题
    setNewsContent(version.news.join("\n"));
    setShowHistoryModal(false);

    let message = "";
    if (version.isLive) {
      message = "Live version loaded into editor.";
    } else if (version.isDraft) {
      message = "Current draft reloaded.";
    } else {
      message = `Loaded historical version from ${formatDate(version.timestamp)}. Click Save News to make it live.`;
    }
    setStatusMessage(message);
    setMessageType("info"); // 使用 'info' 类型显示加载消息
    setHistoryError(null);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 删除历史记录条目
  const handleDeleteHistory = async (timestampToDelete: string) => {
    // 无法删除线上版本或草稿
    if (
      !timestampToDelete ||
      timestampToDelete === "live" ||
      timestampToDelete === "draft"
    )
      return;

    // 可选：添加确认对话框
    if (
      !confirm(
        `Are you sure you want to delete the history entry from ${formatDate(timestampToDelete)}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsLoadingDelete(timestampToDelete);
    try {
      const res = await fetch(
        `/api/news/history?timestamp=${encodeURIComponent(timestampToDelete)}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Delete failed with status: " + res.status }));
        throw new Error(errorData.error || "Failed to delete history entry");
      }

      // 从状态中移除已删除条目
      setNewsHistory((prev) =>
        prev.filter((entry) => entry.timestamp !== timestampToDelete),
      );
      // 不再需要显示成功消息，因为条目会直接消失
    } catch (err) {
      console.error("Delete history error:", err);
      setHistoryError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during deletion",
      );
    } finally {
      setIsLoadingDelete(null);
    }
  };

  // --- UI 渲染 --- //
  return (
    <div className="p-6 bg-gray-900 text-gray-200 rounded-lg border border-gray-700 shadow-xl relative min-h-[600px] flex flex-col">
      {/* 页眉 */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400">News Editor</h2>
        <div className="flex items-center space-x-3">
          {/* 历史记录按钮 */}
          <button
            onClick={fetchHistory}
            className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoadingHistory || isSaving}
            title="View edit history"
          >
            {isLoadingHistory ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <History size={14} className="mr-1" />
            )}
            History
          </button>
          {/* 保存按钮 */}
          <button
            onClick={handleSaveNews}
            className="inline-flex items-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving || isLoading}
            title="Save current news as live version"
          >
            {isSaving ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <Save size={14} className="mr-1" />
            )}
            {isSaving ? "Saving..." : "Save News"}
          </button>
          {/* 返回按钮 */}
          <button
            onClick={onClose}
            className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
          >
            <ArrowLeft size={14} className="mr-1" />
            Back
          </button>
        </div>
      </div>
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-10">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
        </div>
      )}
      {/* 状态消息 */} {/* Positioned fixed at the top */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-lg text-sm font-medium ${messageType === "success" ? "bg-green-600 text-white" : messageType === "error" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}
        >
          {statusMessage}
        </motion.div>
      )}
      {/* 编辑器主体内容 */}
      {!isLoading && (
        <div className="flex-grow flex flex-col space-y-4">
          {/* 标题输入 */}
          <div>
            <label
              htmlFor="news-title"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              News Title (Optional)
            </label>
            <input
              id="news-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this news update (e.g., Weekly Update)"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSaving}
            />
          </div>

          {/* 新闻内容输入 (Textarea) */}
          <div className="flex-grow flex flex-col">
            <label
              htmlFor="news-content"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              News Content (One item per line)
            </label>
            <textarea
              id="news-content"
              rows={15} // 增加默认行数
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="Enter news items here, one per line.\nExample:\n- Prof. Smith received a research grant.\n- Paper accepted to CVPR 2024.\n- Welcome new members!"
              className="flex-grow w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
              disabled={isSaving}
            />
          </div>
        </div>
      )}
      {/* 历史记录模态框 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-20 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-gray-700"
          >
            {/* 模态框标题 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                <History size={20} /> News History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* 历史记录内容区 */}
            <div className="p-4 flex-grow overflow-y-auto">
              {isLoadingHistory && (
                <p className="text-center text-gray-400">Loading history...</p>
              )}
              {historyError && (
                <p className="text-center text-red-500">
                  Error: {historyError}
                </p>
              )}
              {!isLoadingHistory && newsHistory.length === 0 && (
                <p className="text-center text-gray-500">
                  No history available yet.
                </p>
              )}
              {!isLoadingHistory && newsHistory.length > 0 && (
                <ul className="space-y-3">
                  {newsHistory.map((entry) => (
                    <li
                      key={entry.timestamp}
                      className="p-4 bg-gray-700 rounded-md border border-gray-600 flex justify-between items-start space-x-4"
                    >
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`font-semibold ${entry.isLive ? "text-green-400" : entry.isDraft ? "text-yellow-400" : "text-indigo-400"}`}
                          >
                            {entry.isLive ? (
                              <>
                                <CheckCircle
                                  size={14}
                                  className="inline mr-1"
                                />{" "}
                                Live Version
                              </>
                            ) : entry.isDraft ? (
                              <>
                                <Edit2 size={14} className="inline mr-1" />{" "}
                                Current Draft
                              </>
                            ) : (
                              formatDate(entry.timestamp)
                            )}
                          </span>
                          {entry.title &&
                            entry.title !== "(Untitled)" &&
                            entry.title !== "(Current Draft)" && (
                              <span className="text-xs text-gray-400 bg-gray-600 px-1.5 py-0.5 rounded">
                                {entry.title}
                              </span>
                            )}
                        </div>
                        <ul className="list-disc list-inside text-sm text-gray-300 pl-2 space-y-1 max-h-24 overflow-y-auto">
                          {entry.news.length > 0 ? (
                            entry.news.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))
                          ) : (
                            <li className="italic text-gray-500">No content</li>
                          )}
                        </ul>
                      </div>
                      <div className="flex-shrink-0 flex flex-col space-y-2 items-end">
                        <button
                          onClick={() => loadVersion(entry)}
                          className="inline-flex items-center px-2.5 py-1 border border-indigo-500 rounded text-xs font-medium text-indigo-400 hover:bg-indigo-900/50 transition-colors"
                          title="Load this version into the editor"
                        >
                          Load
                        </button>
                        {!entry.isLive &&
                          !entry.isDraft && ( // 只有历史记录可以删除
                            <button
                              onClick={() =>
                                handleDeleteHistory(entry.timestamp)
                              }
                              className={`inline-flex items-center px-2.5 py-1 border border-red-500 rounded text-xs font-medium text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50 ${isLoadingDelete === entry.timestamp ? "animate-pulse" : ""}`}
                              disabled={isLoadingDelete === entry.timestamp}
                              title="Delete this history entry permanently"
                            >
                              {isLoadingDelete === entry.timestamp ? (
                                <Loader2
                                  size={12}
                                  className="animate-spin mr-1"
                                />
                              ) : (
                                <Trash2 size={12} className="mr-1" />
                              )}
                              Delete
                            </button>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NewsEditor;
