"use client";

import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { themeColors } from "@/styles/theme";

interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  total: number;
  duplicateTitles: string[];
  fileName: string;
}

// 可用的 YAML 文件列表（放在 scripts 目录下）
const AVAILABLE_YAML_FILES = [
  'JiahuiHu.yml',
  // 可以添加更多文件
];

/**
 * YAML 导入管理器组件
 * 参考重置密码的逻辑，直接处理服务器上的文件
 */
const YamlImportManager: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [clearResult, setClearResult] = useState<{deletedCount: number} | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  /**
   * 执行导入 - 参考重置密码的逻辑
   */
  const handleImport = async (fileName: string) => {
    if (!fileName) {
      toast.error('Please select a YAML file first');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // 发送到 API，类似重置密码的逻辑
      const response = await fetch('/api/publications/import-yaml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setImportResult(result.data);
        toast.success(`Successfully imported ${result.data.imported} publications!`);

        if (result.data.duplicatesSkipped > 0) {
          toast.warning(`Skipped ${result.data.duplicatesSkipped} duplicate publications`);
        }
      } else {
        throw new Error(result.error || 'Import failed');
      }

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * 一键清除所有 pending 记录
   */
  const handleClearAll = async () => {
    if (!confirm('确定要删除所有 pending 记录吗？此操作不可撤销！')) {
      return;
    }

    setIsClearing(true);
    setClearResult(null);

    try {
      const response = await fetch('/api/publications/pending/clear-all', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setClearResult(result.data);
        toast.success(`Successfully deleted ${result.data.deletedCount} pending publications!`);
      } else {
        throw new Error(result.error || 'Clear failed');
      }

    } catch (error) {
      console.error('Clear error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Clear failed: ${errorMessage}`);
    } finally {
      setIsClearing(false);
    }
  };

  /**
   * 重置状态
   */
  const handleReset = () => {
    setSelectedFileName('');
    setImportResult(null);
    setClearResult(null);
  };

  return (
    <div className={`space-y-6 ${themeColors.devCardBg} p-6 rounded-lg border border-gray-700`}>
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <Upload className={`${themeColors.devAccent} w-6 h-6`} />
        <h3 className={`text-xl font-semibold ${themeColors.devText}`}>
          Import Publications from YAML
        </h3>
      </div>

      {/* 文件选择区域 - 参考重置密码的表格布局 */}
      <div className="space-y-6">
        <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg ${themeColors.devCardBg}`}>
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Available YAML Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {AVAILABLE_YAML_FILES.map((fileName) => (
                <tr key={fileName} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-400" />
                      <span className={themeColors.devText}>{fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${themeColors.devDescText}`}>
                      /scripts/{fileName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleImport(fileName)}
                      disabled={isImporting}
                      className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white ${
                        isImporting
                          ? "bg-gray-600 cursor-not-allowed animate-pulse"
                          : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      } transition-colors disabled:opacity-50`}
                      title={`Import ${fileName} to pending review`}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1" />
                          Import
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex gap-4">
          {/* 重置按钮 */}
          {(importResult || clearResult) && (
            <button
              onClick={handleReset}
              className={`inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium ${themeColors.devText} ${themeColors.devCardBg} hover:bg-gray-700 transition-colors`}
            >
              Reset Results
            </button>
          )}

          {/* 一键清除按钮 */}
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isClearing
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            } transition-colors disabled:opacity-50`}
            title="Delete all pending publications"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Pending
              </>
            )}
          </button>
        </div>
      </div>

      {/* 清除结果 */}
      {clearResult && (
        <div className="space-y-4">
          <div className={`p-4 rounded-md border ${themeColors.devCardBg} border-red-600`}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-red-500" />
              <h4 className={`font-medium ${themeColors.devText}`}>Clear Completed</h4>
            </div>

            <div className={`space-y-2 text-sm ${themeColors.devDescText}`}>
              <div>🗑️ Deleted {clearResult.deletedCount} pending publications</div>
            </div>
          </div>

          <div className={`p-3 rounded-md bg-green-900/20 border border-green-600`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-green-400" />
              <span className={`text-sm ${themeColors.devText}`}>
                All pending publications have been cleared. You can now import fresh data.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 导入结果 */}
      {importResult && (
        <div className="space-y-4">
          <div className={`p-4 rounded-md border ${themeColors.devCardBg} border-green-600`}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h4 className={`font-medium ${themeColors.devText}`}>Import Completed</h4>
            </div>
            
            <div className={`space-y-2 text-sm ${themeColors.devDescText}`}>
              <div>📁 File: {importResult.fileName}</div>
              <div>📊 Total publications in file: {importResult.total}</div>
              <div>✅ Successfully imported: {importResult.imported}</div>
              <div>⚠️ Duplicates skipped: {importResult.duplicatesSkipped}</div>
            </div>

            {importResult.duplicateTitles.length > 0 && (
              <div className="mt-4">
                <h5 className={`font-medium ${themeColors.devText} mb-2`}>Duplicate Titles Skipped:</h5>
                <div className={`max-h-32 overflow-y-auto space-y-1 text-xs ${themeColors.devDescText}`}>
                  {importResult.duplicateTitles.map((title, index) => (
                    <div key={index} className="truncate">
                      • {title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-md bg-blue-900/20 border border-blue-600`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span className={`text-sm ${themeColors.devText}`}>
                Imported publications are now in the <strong>Pending</strong> section for review.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className={`p-4 rounded-md bg-gray-800/50 border border-gray-600`}>
        <h4 className={`font-medium ${themeColors.devText} mb-2`}>Instructions:</h4>
        <ul className={`text-sm ${themeColors.devDescText} space-y-1`}>
          <li>• <strong>Import:</strong> Click "Import" button for any available YAML file</li>
          <li>• <strong>Clear All:</strong> Click "Clear All Pending" to delete all pending publications</li>
          <li>• Files should be placed in the /scripts directory</li>
          <li>• The file should have a 'works' array with publication entries</li>
          <li>• Author information will be automatically parsed and saved</li>
          <li>• Duplicate titles will be automatically skipped (checks all existing records)</li>
          <li>• Imported publications will appear in the Pending section for review</li>
          <li>• You can then approve or edit them before publishing</li>
          <li>• yml source file comes from <a href="https://github.com/TheAlbertDev/get-orcid-publications" target="_blank" rel="noopener noreferrer" className={`text-blue-400 hover:text-blue-500`}>get-orcid-publications</a></li>
          <li>• to update the yml file, please update data, just fork the repo and use the workflow</li>
        </ul>
      </div>
    </div>
  );
};

export default YamlImportManager;
