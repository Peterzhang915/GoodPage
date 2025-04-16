"use client";

import React from "react";
import { ArrowLeft, Wrench } from "lucide-react";

interface OpsManagerProps {
  onClose: () => void;
}

/**
 * OpsManager 组件的占位符。
 * TODO: 实现服务器维护和监控工具的功能。
 */
const OpsManager: React.FC<OpsManagerProps> = ({ onClose }) => {
  return (
    <div>
      {/* 页眉 */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
          <Wrench size={24} />
          Operations Tools (Coming Soon)
        </h2>
        <button
          onClick={onClose}
          className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
        >
          <ArrowLeft size={14} className="mr-1" />
          Back to Tools
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center text-gray-400">
        <p>
          Tools for server maintenance and monitoring will be available here.
        </p>
        <p className="mt-2 text-sm">(Functionality under development)</p>
      </div>
    </div>
  );
};

export default OpsManager;
