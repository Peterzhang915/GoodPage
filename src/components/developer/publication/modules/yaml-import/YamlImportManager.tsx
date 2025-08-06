"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Plus, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { themeColors } from "@/styles/theme";

interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  total: number;
  duplicateTitles: string[];
  fileName: string;
}

interface YamlFile {
  name: string;
  size: number;
  lastModified: string;
  path: string;
}

/**
 * YAML 导入管理器组件
 * 参考重置密码的逻辑，直接处理服务器上的文件
 */
const YamlImportManager: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [yamlFiles, setYamlFiles] = useState<YamlFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 加载文件列表
   */
  const loadYamlFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch('/api/publications/yaml-files');
      const result = await response.json();

      if (response.ok && result.success) {
        setYamlFiles(result.data);
      } else {
        throw new Error(result.error || 'Failed to load files');
      }
    } catch (error) {
      console.error('Load files error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load files: ${errorMessage}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  /**
   * 上传文件
   */
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/publications/yaml-files', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`File "${file.name}" uploaded successfully!`);
        await loadYamlFiles(); // 重新加载文件列表
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 删除文件
   */
  const handleFileDelete = async (fileName: string) => {
    if (!confirm(`确定要删除文件 "${fileName}" 吗？此操作不可撤销！`)) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(fileName));
    try {
      const response = await fetch(`/api/publications/yaml-files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`File "${fileName}" deleted successfully!`);
        await loadYamlFiles(); // 重新加载文件列表
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Delete failed: ${errorMessage}`);
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // 清空 input 值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 组件挂载时加载文件列表
   */
  useEffect(() => {
    loadYamlFiles();
  }, []);

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
   * 重置状态
   */
  const handleReset = () => {
    setImportResult(null);
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

      {/* 文件管理区域 */}
      <div className="space-y-6">
        {/* 上传按钮 */}
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-medium ${themeColors.devText}`}>YAML Files Management</h3>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".yml,.yaml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isUploading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              } transition-colors disabled:opacity-50`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload YAML File
                </>
              )}
            </button>
            <button
              onClick={loadYamlFiles}
              disabled={isLoadingFiles}
              className={`inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium ${themeColors.devText} ${themeColors.devCardBg} hover:bg-gray-700 transition-colors disabled:opacity-50`}
            >
              {isLoadingFiles ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* 文件列表 */}
        <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg ${themeColors.devCardBg}`}>
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {isLoadingFiles ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-400" />
                      <span className={`text-sm ${themeColors.devDescText}`}>Loading files...</span>
                    </div>
                  </td>
                </tr>
              ) : yamlFiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <span className={`text-sm ${themeColors.devDescText}`}>No YAML files found. Upload one to get started.</span>
                  </td>
                </tr>
              ) : (
                yamlFiles.map((file) => (
                <tr key={file.name} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-400" />
                      <span className={themeColors.devText}>{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${themeColors.devDescText}`}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${themeColors.devDescText}`}>
                      {new Date(file.lastModified).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleImport(file.name)}
                        disabled={isImporting}
                        className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white ${
                          isImporting
                            ? "bg-gray-600 cursor-not-allowed animate-pulse"
                            : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        } transition-colors disabled:opacity-50`}
                        title={`Import ${file.name} to pending review`}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 mr-1" />
                            Import
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleFileDelete(file.name)}
                        disabled={deletingFiles.has(file.name)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white ${
                          deletingFiles.has(file.name)
                            ? "bg-gray-600 cursor-not-allowed animate-pulse"
                            : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        } transition-colors disabled:opacity-50`}
                        title={`Delete ${file.name}`}
                      >
                        {deletingFiles.has(file.name) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 重置按钮 */}
        {importResult && (
          <button
            onClick={handleReset}
            className={`inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium ${themeColors.devText} ${themeColors.devCardBg} hover:bg-gray-700 transition-colors`}
          >
            Reset Results
          </button>
        )}
      </div>



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
          <li>• <strong>Upload:</strong> Click "Upload YAML File" to add new YAML files to the system</li>
          <li>• <strong>Import:</strong> Click "Import" button for any available YAML file to import publications</li>
          <li>• <strong>Delete:</strong> Click "Delete" button to remove YAML files from the system</li>
          <li>• Files are stored in the /data/yaml directory on the server</li>
          <li>• Only .yml and .yaml files are accepted (max 10MB)</li>
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
