"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Server,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  Edit,
  Trash2,
  Plus,
  Save,
  XCircle,
} from "lucide-react";

// 定义 Code Server 实例的数据结构
interface CodeServerInstance {
  id: string;
  name: string;
  url: string;
}

// 定义编辑表单的数据结构
interface EditFormData {
  name: string;
  url: string;
}

interface CodeServerManagerProps {
  onClose: () => void;
}

// 模拟后端 API 返回的数据
const MOCK_SERVERS_INITIAL: CodeServerInstance[] = [
  { id: "cs1", name: "Primary Dev Server", url: "http://47.115.228.15:18080" },
  {
    id: "cs2",
    name: "GPU Server (Experimental)",
    url: "http://gpu.example.com:8080",
  },
  { id: "cs3", name: "Backup Server", url: "http://backup.example.com:8080" },
];

/**
 * CodeServerManager 组件用于管理 Code Server 实例。
 * 提供添加、删除、修改服务器列表的功能（使用模拟数据）。
 * TODO: 对接真实 API；重新加入状态检查功能。
 */
const CodeServerManager: React.FC<CodeServerManagerProps> = ({ onClose }) => {
  const [servers, setServers] =
    useState<CodeServerInstance[]>(MOCK_SERVERS_INITIAL);

  // 添加服务器表单的状态
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // 编辑状态
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    url: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  // 添加服务器处理函数
  const handleAddServer = (event: React.FormEvent) => {
    event.preventDefault();
    setAddError(null);
    if (!newName.trim() || !newUrl.trim()) {
      setAddError("Name and URL cannot be empty.");
      return;
    }
    try {
      new URL(newUrl.trim()); // 验证前去除空格
    } catch (_) {
      setAddError("Invalid URL format.");
      return;
    }

    const newServer: CodeServerInstance = {
      id: `cs-${Date.now()}`,
      name: newName.trim(),
      url: newUrl.trim(),
    };

    setServers((prevServers) => [...prevServers, newServer]);
    setNewName("");
    setNewUrl("");
  };

  // 删除服务器处理函数
  const handleDeleteServer = (idToDelete: string) => {
    if (confirm("Are you sure you want to delete this server entry?")) {
      setServers((prevServers) =>
        prevServers.filter((server) => server.id !== idToDelete),
      );
      // 如果正在编辑的项被删除，则取消编辑状态
      if (editingServerId === idToDelete) {
        setEditingServerId(null);
        setEditFormData({ name: "", url: "" });
        setEditError(null);
      }
    }
  };

  // 开始编辑服务器
  const handleStartEdit = (server: CodeServerInstance) => {
    setEditingServerId(server.id);
    setEditFormData({ name: server.name, url: server.url });
    setEditError(null); // 清除之前的编辑错误
    setAddError(null); // 清除添加错误，避免混淆
  };

  // 处理编辑表单输入变化
  const handleEditFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingServerId(null);
    setEditFormData({ name: "", url: "" });
    setEditError(null);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    setEditError(null);
    if (!editingServerId) return; // 防御性检查

    const trimmedName = editFormData.name.trim();
    const trimmedUrl = editFormData.url.trim();

    if (!trimmedName || !trimmedUrl) {
      setEditError("Name and URL cannot be empty during edit.");
      return;
    }
    try {
      new URL(trimmedUrl);
    } catch (_) {
      setEditError("Invalid URL format during edit.");
      return;
    }

    setServers((prevServers) =>
      prevServers.map((server) =>
        server.id === editingServerId
          ? { ...server, name: trimmedName, url: trimmedUrl }
          : server,
      ),
    );

    handleCancelEdit(); // 保存成功后退出编辑模式
  };

  return (
    <div>
      {/* 页眉 */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
          <Server size={24} />
          Manage Code Servers
        </h2>
      </div>

      {/* 添加服务器表单 */}
      <form
        onSubmit={handleAddServer}
        className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-end gap-4 relative"
      >
        <div className="flex-grow">
          <label
            htmlFor="server-name"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Server Name
          </label>
          <input
            type="text"
            id="server-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Main Dev Server"
            disabled={!!editingServerId} // 编辑时禁用添加表单
            className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          />
        </div>
        <div className="flex-grow">
          <label
            htmlFor="server-url"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Server URL
          </label>
          <input
            type="text"
            id="server-url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="e.g., http://localhost:8080"
            disabled={!!editingServerId}
            className="w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={!!editingServerId}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} className="mr-1.5" />
          Add Server
        </button>
        {/* 添加错误显示位置调整 */}
        {addError && (
          <p className="text-xs text-red-400 absolute bottom-[-18px] left-4">
            {addError}
          </p>
        )}
      </form>

      {/* 服务器列表 */}
      <div className="space-y-3">
        {servers.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No servers configured yet.
          </p>
        )}
        {servers.map((server) => (
          <div
            key={server.id}
            className={`p-4 rounded-lg border flex items-center justify-between gap-4 ${editingServerId === server.id ? "bg-gray-700 border-indigo-500" : "bg-gray-800 border-gray-700"}`}
          >
            {/* 左侧：根据是否编辑显示不同内容 */}
            <div className="flex items-center gap-3 flex-grow overflow-hidden">
              {editingServerId === server.id ? (
                // 编辑模式：显示输入框
                <div className="flex gap-2 flex-grow items-center relative">
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="flex-grow p-1.5 border rounded bg-gray-600 border-gray-500 text-gray-100 text-sm"
                    placeholder="Server Name"
                  />
                  <input
                    type="text"
                    name="url"
                    value={editFormData.url}
                    onChange={handleEditFormChange}
                    className="flex-grow p-1.5 border rounded bg-gray-600 border-gray-500 text-gray-100 text-sm"
                    placeholder="Server URL"
                  />
                  {/* 编辑错误显示 */}
                  {editError && (
                    <p className="text-xs text-red-400 absolute bottom-[-18px] left-1">
                      {editError}
                    </p>
                  )}
                </div>
              ) : (
                // 显示模式：显示名称和链接
                <>
                  <span
                    className="font-medium text-gray-100 truncate"
                    title={server.name}
                  >
                    {server.name}
                  </span>
                  <a
                    href={server.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate"
                    title={server.url}
                  >
                    {server.url}
                  </a>
                </>
              )}
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              {editingServerId === server.id ? (
                // 编辑模式下的按钮：保存和取消
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="p-1.5 rounded text-green-400 hover:bg-gray-600"
                    title="Save Changes"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded text-gray-400 hover:bg-gray-600"
                    title="Cancel Edit"
                  >
                    <XCircle size={16} />
                  </button>
                </>
              ) : (
                // 显示模式下的按钮：编辑和删除
                <>
                  <button
                    onClick={() => handleStartEdit(server)}
                    disabled={!!editingServerId} // 正在编辑其他项时禁用
                    className="p-1.5 rounded text-indigo-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit Server"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteServer(server.id)}
                    disabled={!!editingServerId} // 正在编辑其他项时禁用
                    className="p-1.5 rounded text-red-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Server"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeServerManager;
