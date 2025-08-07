"use client";

import React, { useState, useRef, useEffect } from "react";
import { themeColors } from "@/styles/theme";
import { 
  Loader2, 
  Download, 
  CheckCircle, 
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  FileText,
  Play
} from "lucide-react";
import { toast } from "sonner";
import ProfessorsConfig from "./ProfessorsConfig";

interface DblpFile {
  name: string;
  size: number;
  lastModified: string;
}

interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  total: number;
  duplicateTitles: string[];
  fileName: string;
}

/**
 * DBLP 导入管理器组件
 * 提供上传 DBLP 输出文件并导入出版物的功能
 */
const DblpImportManager: React.FC = () => {
  const [dblpFiles, setDblpFiles] = useState<DblpFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRunningCrawler, setIsRunningCrawler] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDblpFiles();
  }, []);

  /**
   * 加载文件列表
   */
  const loadDblpFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch('/api/publications/dblp-files');
      const result = await response.json();

      if (response.ok && result.success) {
        setDblpFiles(result.data || []);
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
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      const response = await fetch('/api/publications/dblp-files', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`File "${file.name}" uploaded successfully!`);
        await loadDblpFiles();
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
  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete file "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/publications/dblp-files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`File "${fileName}" deleted successfully!`);
        await loadDblpFiles();
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Delete failed: ${errorMessage}`);
    }
  };

  /**
   * 导入 DBLP 文件
   */
  const handleImportFile = async (fileName: string) => {
    if (!fileName) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/publications/import-dblp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
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
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US');
  };

  /**
   * 运行 DBLP 爬虫
   */
  const handleRunCrawler = async () => {
    setIsRunningCrawler(true);
    try {
      const response = await fetch('/api/publications/run-dblp-crawler', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('DBLP crawler completed successfully!');
        await loadDblpFiles();
      } else {
        throw new Error(result.error || 'Crawler failed');
      }
    } catch (error) {
      console.error('Crawler error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Crawler failed: ${errorMessage}`);
    } finally {
      setIsRunningCrawler(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className={`text-3xl font-bold ${themeColors.devText} mb-2`}>
          DBLP Import System
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <ExternalLink className="w-4 h-4" />
          <span>Automated publication import from DBLP database</span>
        </div>
      </div>

      {/* 主要功能区域 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 左侧：配置和控制 */}
        <div className="space-y-6">
          {/* 教授配置区域 */}
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-1 rounded-xl">
            <ProfessorsConfig onConfigUpdate={() => {
              console.log('Professors configuration updated');
            }} />
          </div>

          {/* 爬虫控制区域 */}
          <div className={`p-6 rounded-xl ${themeColors.devCardBg} border border-gray-600 bg-gradient-to-br from-cyan-900/10 to-blue-900/10`}>
            <div className="flex items-center gap-3 mb-4">
              <Play className="w-6 h-6 text-cyan-400" />
              <h3 className={`text-lg font-medium ${themeColors.devText}`}>Crawler Control</h3>
            </div>
            <p className={`text-sm ${themeColors.devDescText} mb-4`}>
              Run the DBLP crawler to automatically fetch publications for configured professors
            </p>
            <button
              onClick={handleRunCrawler}
              disabled={isRunningCrawler}
              className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isRunningCrawler
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              } transition-colors disabled:opacity-50`}
            >
              {isRunningCrawler ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running DBLP Crawler...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run DBLP Crawler
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧：文件管理 */}
        <div className="space-y-6">
          {/* 文件管理区域 */}
          <div className={`p-6 rounded-xl ${themeColors.devCardBg} border border-gray-600 bg-gradient-to-br from-blue-900/10 to-indigo-900/10`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <h3 className={`text-lg font-medium ${themeColors.devText}`}>Files Management</h3>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
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
                      Upload
                    </>
                  )}
                </button>
                <button
                  onClick={loadDblpFiles}
                  disabled={isLoadingFiles}
                  className={`inline-flex items-center px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium ${themeColors.devText} ${themeColors.devCardBg} hover:bg-gray-700 transition-colors disabled:opacity-50`}
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
            <div className={`rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden`}>
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <span className={`ml-2 ${themeColors.devText}`}>Loading files...</span>
                </div>
              ) : dblpFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className={`${themeColors.devDescText} mb-2 text-lg`}>
                    No DBLP files available
                  </p>
                  <p className={`text-sm ${themeColors.devDescText}`}>
                    Run the crawler or upload a file to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {dblpFiles.map((file, index) => (
                    <div key={index} className="p-4 hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className={`font-medium ${themeColors.devText}`}>{file.name}</p>
                            <p className={`text-sm ${themeColors.devDescText}`}>
                              {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleImportFile(file.name)}
                            disabled={isImporting}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white ${
                              isImporting
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            } transition-colors disabled:opacity-50`}
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Import
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="inline-flex items-center px-3 py-2 border border-red-600 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 导入结果区域 - 移动到右侧文件管理下方 */}
          {importResult && (
            <div className={`p-6 rounded-xl ${themeColors.devCardBg} border border-green-600 bg-gradient-to-br from-green-900/20 to-emerald-900/20`}>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h3 className={`text-xl font-medium ${themeColors.devText}`}>Import Completed</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-green-900/30 border border-green-600/50">
                  <div className="text-2xl font-bold text-green-400 mb-2">{importResult.imported}</div>
                  <div className={`text-xs ${themeColors.devDescText} font-medium`}>Successfully Imported</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-900/30 border border-yellow-600/50">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">{importResult.duplicatesSkipped}</div>
                  <div className={`text-xs ${themeColors.devDescText} font-medium`}>Duplicates Skipped</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-900/30 border border-blue-600/50">
                  <div className="text-2xl font-bold text-blue-400 mb-2">{importResult.total}</div>
                  <div className={`text-xs ${themeColors.devDescText} font-medium`}>Total Processed</div>
                </div>
              </div>

              {importResult.duplicateTitles && importResult.duplicateTitles.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                  <p className={`text-sm ${themeColors.devDescText} mb-2 font-medium`}>Skipped duplicate publications:</p>
                  <div className="max-h-24 overflow-y-auto">
                    <ul className={`text-xs ${themeColors.devDescText} space-y-1`}>
                      {importResult.duplicateTitles.map((title, index) => (
                        <li key={index} className="truncate">• {title}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                <p className="text-blue-400 text-sm">
                  💡 Imported publications have been added to the "Pending Review" tab where you can review, edit, and publish them.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* 使用说明区域 */}
      <div className={`p-6 rounded-xl bg-gray-800/50 border border-gray-600`}>
        <h4 className={`font-medium ${themeColors.devText} mb-4 text-lg`}>Usage Instructions:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className={`font-medium ${themeColors.devText} mb-2 text-green-400`}>Automated Workflow:</h5>
            <ul className={`text-sm ${themeColors.devDescText} space-y-1`}>
              <li>• <strong>Configure:</strong> Set up professor names in the configuration panel</li>
              <li>• <strong>Run Crawler:</strong> Click "Run DBLP Crawler" to fetch latest publications</li>
              <li>• <strong>Import:</strong> Click "Import" on the generated file to add publications</li>
            </ul>
          </div>
          <div>
            <h5 className={`font-medium ${themeColors.devText} mb-2 text-blue-400`}>Manual Workflow:</h5>
            <ul className={`text-sm ${themeColors.devDescText} space-y-1`}>
              <li>• <strong>Upload:</strong> Upload manually generated .txt files (max 10MB)</li>
              <li>• <strong>Import:</strong> Process uploaded files to add publications</li>
              <li>• <strong>Manage:</strong> Delete unnecessary files from the system</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className={`text-xs ${themeColors.devDescText}`}>
            <strong>Note:</strong> System automatically detects duplicates and imports publications to "Pending Review" for final approval.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DblpImportManager;
