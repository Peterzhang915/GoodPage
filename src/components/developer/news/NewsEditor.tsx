"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  X,
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

  // 获取当前线上新闻 (组件挂载时)
  const fetchLiveNews = useCallback(async (showLoadingMessage = true) => {
    if (showLoadingMessage) {
      setIsLoading(true);
      setStatusMessage("Loading live news data...");
      setMessageType("info");
    }
    try {
      const res = await fetch("/api/news");
      if (!res.ok) {
        // Attempt to parse error message from API if available
        let errorMsg = `Failed to fetch news (Status: ${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData && errorData.error && errorData.error.message) {
            errorMsg = errorData.error.message;
          }
        } catch (e) { /* Ignore parsing error, use status code message */ }
        throw new Error(errorMsg);
      }
      
      // Parse the JSON response
      const result = await res.json(); 

      // Check for standard success format
      if (result.success && result.data) {
        const newsData = result.data as NewsData; // Type assertion
        // Validate the inner data structure
        if (typeof newsData.title === "string" && Array.isArray(newsData.news)) {
          setTitle(newsData.title);
          setNewsContent(newsData.news.join("\n"));
          if (showLoadingMessage) {
            setStatusMessage("Live news data loaded.");
            setMessageType("success");
            setTimeout(() => setStatusMessage(null), 2000);
          }
        } else {
          throw new Error("Invalid inner data format received for live news.");
        }
      } else {
        // Handle cases where API didn't return { success: true, data: ... }
        // Or potentially handle legacy format if needed, though API seems to handle it
        throw new Error("Unexpected response format from API."); 
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

  // --- UI 渲染 --- //
  return (
    <div className="p-6 bg-gray-900 text-gray-200 rounded-lg border border-gray-700 shadow-xl relative min-h-[600px] flex flex-col">
      {/* 页眉 */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400">News Editor</h2>
        <div className="flex items-center space-x-3">
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
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="Enter news items here, one per line.\nExample:\n- Prof. Smith received a research grant.\n- Paper accepted to CVPR 2024.\n- Welcome new members!"
              className="flex-grow w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y h-64"
              disabled={isSaving}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsEditor;
