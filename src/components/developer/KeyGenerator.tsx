'use client';

import React, { useState } from 'react';
import { ArrowLeft, Key, Clipboard, Check, Loader2 } from 'lucide-react';

interface KeyGeneratorProps {
  onClose: () => void;
}

// 假设的可用权限列表 (应与 page.tsx 中的权限标识符一致，但不包括 generate_keys)
const AVAILABLE_PERMISSIONS = [
  { id: 'manage_news', label: 'Manage News' },
  { id: 'manage_photos', label: 'Manage Photos' },
  { id: 'manage_members', label: 'Manage Members' },
  { id: 'manage_codeservers', label: 'Manage Code Servers' },
  { id: 'manage_ops', label: 'Manage Ops Tools' },
];

/**
 * KeyGenerator 组件用于生成具有特定权限和时效的临时访问密钥。
 * TODO: 实现密钥生成逻辑（调用后端 API），处理有效期选择。
 */
const KeyGenerator: React.FC<KeyGeneratorProps> = ({ onClose }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiry, setExpiry] = useState<string>('1h'); // 默认 1 小时
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => 
      checked ? [...prev, permissionId] : prev.filter(id => id !== permissionId)
    );
  };

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setGeneratedKey(null);
    setCopySuccess(false);
    console.log("Generating key with permissions:", selectedPermissions, "and expiry:", expiry);
    // --- TODO: 在这里调用后端 API 生成密钥 --- 
    // const response = await fetch('/api/generate-key', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ permissions: selectedPermissions, expiry })
    // });
    // if (response.ok) { const data = await response.json(); setGeneratedKey(data.key); } 
    // else { console.error('Failed to generate key'); }
    
    // --- 模拟 API 调用 --- 
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    const mockKey = `temp_key_${selectedPermissions.join('_').slice(0,15)}_${Date.now().toString().slice(-5)}`;
    setGeneratedKey(mockKey);
    // ---------------------
    
    setIsGenerating(false);
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // 2 秒后移除成功提示
      }, (err) => {
        console.error('Failed to copy key: ', err);
      });
    }
  };

  return (
    <div>
      {/* 页眉 */} 
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
          <Key size={24} />
          Generate Access Key
        </h2>
        <button
          onClick={onClose}
          className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
        >
          <ArrowLeft size={14} className="mr-1" />
          Back to Tools
        </button>
      </div>

      {/* 配置区域 */} 
      <div className="space-y-6">
        {/* 权限选择 */}
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">Permissions:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            {AVAILABLE_PERMISSIONS.map(permission => (
              <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                />
                <span className="text-sm text-gray-300">{permission.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 有效期选择 */} 
        <div>
           <label htmlFor="key-expiry" className="block text-lg font-medium text-gray-200 mb-2">Expires in:</label>
           <select 
             id="key-expiry" 
             value={expiry} 
             onChange={(e) => setExpiry(e.target.value)}
             className="w-full md:w-1/3 p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1h">1 Hour</option>
              <option value="6h">6 Hours</option>
              <option value="1d">1 Day</option>
              <option value="7d">7 Days</option>
              {/* TODO: Add custom expiry option? */}
           </select>
        </div>

        {/* 生成按钮 */} 
        <button
          onClick={handleGenerateKey}
          disabled={isGenerating || selectedPermissions.length === 0} // 正在生成或未选择权限时禁用
          className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 size={20} className="mr-2 animate-spin" />
          ) : (
            <Key size={20} className="mr-2" />
          )}
          Generate Key
        </button>

        {/* 显示生成的密钥 */} 
        {generatedKey && (
          <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg relative">
            <p className="text-sm text-gray-400 mb-2">Generated Key (copy and share this):</p>
            <pre className="text-green-400 text-sm break-all whitespace-pre-wrap font-mono select-all">
              {generatedKey}
            </pre>
            <button 
              onClick={handleCopyKey}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copySuccess ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default KeyGenerator; 