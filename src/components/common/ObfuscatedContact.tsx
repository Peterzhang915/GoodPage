"use client"; // Mark as a Client Component

import React, { useState, useEffect } from "react";
import { Copy, EyeOff } from "lucide-react";

type ObfuscatedContactProps = {
  value: string;
  type: "email" | "phone";
  className?: string;
};

/**
 * 防爬虫联系方式组件
 *
 * 功能特性：
 * 1. 服务端渲染时显示友好占位符文本（如：点击查看邮箱）
 * 2. 客户端挂载后可点击显示真实地址
 * 3. 支持一键复制功能
 * 4. 防止静态HTML中直接暴露邮箱地址
 */
const ObfuscatedContact: React.FC<ObfuscatedContactProps> = ({
  value,
  type,
  className = "",
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // 生成友好的占位符文本
  const getPlaceholderText = (contactType: "email" | "phone"): string => {
    if (contactType === "email") {
      return "click to view email address";
    } else {
      return "click to view phone number";
    }
  };

  const placeholderText = getPlaceholderText(type);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 复制到剪贴板功能
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 切换显示/隐藏真实地址
  const toggleReveal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRevealed(!isRevealed);
  };

  // 服务端渲染或客户端未挂载时显示友好占位符
  if (!isMounted || !isRevealed) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <button
          onClick={isMounted ? toggleReveal : undefined}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1"
          disabled={!isMounted}
        >
          {placeholderText}
        </button>
        {isMounted && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={copySuccess ? "Copied!" : "Copy Address"}
          >
            <Copy
              size={14}
              className={`transition-colors ${
                copySuccess
                  ? "text-green-500"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            />
          </button>
        )}
      </span>
    );
  }

  // 显示真实地址时的渲染
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {type === "email" ? (
        <a
          href={`mailto:${value}`}
          className="hover:underline"
        >
          {value}
        </a>
      ) : (
        <span>{value}</span>
      )}
      <div className="inline-flex items-center gap-1">
        <button
          onClick={toggleReveal}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Hide Address"
        >
          <EyeOff size={14} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
        </button>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={copySuccess ? "Copied!" : "Copy Address"}
        >
          <Copy
            size={14}
            className={`transition-colors ${
              copySuccess
                ? "text-green-500"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          />
        </button>
      </div>
    </span>
  );
};

export default ObfuscatedContact;
