/**
 * 图片上传区域组件
 * 
 * 提供拖拽上传和文件选择功能
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, Type, Calendar } from 'lucide-react';
import type { UploadAreaProps } from '../types';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { PLACEHOLDERS, UPLOAD_CONFIG } from '../constants';

/**
 * 上传区域组件
 */
const UploadArea: React.FC<UploadAreaProps> = ({
  category,
  onUploadComplete,
  onError
}) => {
  const {
    uploading,
    file,
    caption,
    date,
    isDragging,
    canUpload,
    showUploadArea,
    setCaption,
    setDate,
    handleFileSelect,
    triggerFileSelect,
    uploadPhoto,
    cancelUpload,
    dragHandlers,
    fileInputRef
  } = usePhotoUpload({
    category,
    onUploadSuccess: onUploadComplete,
    onError
  });

  // 如果不显示上传区域，返回 null
  if (!showUploadArea) {
    return null;
  }

  /**
   * 处理文件输入变化
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  /**
   * 处理上传
   */
  const handleUpload = async () => {
    await uploadPhoto();
  };

  return (
    <div className="mb-8 space-y-4">
      {/* 拖拽上传区域 */}
      <div 
        className={`bg-gray-800 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-green-500 hover:bg-gray-750 ${
          isDragging ? 'border-green-500 bg-green-500 bg-opacity-10' : 'border-gray-600'
        }`}
        onClick={triggerFileSelect}
        onDragOver={dragHandlers.onDragOver}
        onDragLeave={dragHandlers.onDragLeave}
        onDrop={dragHandlers.onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        <div className="text-gray-300 mb-1">
          {file ? (
            <span className="text-green-400">{file.name}</span>
          ) : (
            <>
              <span className="text-green-400">Click to upload</span> or drag and drop images here
            </>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Supports {UPLOAD_CONFIG.ACCEPTED_TYPES_TEXT} formats, up to {UPLOAD_CONFIG.MAX_FILE_SIZE_TEXT}
        </p>
      </div>

      {/* 上传表单 */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-800 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* 图片标题 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Type size={16} className="mr-1" />
                  Image Caption
                </label>
                <input
                  type="text"
                  placeholder={PLACEHOLDERS.CAPTION}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Add a caption to display below the image
                </p>
              </div>

              {/* 拍摄日期 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Calendar size={16} className="mr-1" />
                  Photo Date
                </label>
                <input
                  type="text"
                  placeholder={PLACEHOLDERS.DATE}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used for photo sorting and display, recommend YYYY.MM.DD format
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelUpload}
                disabled={uploading}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!canUpload}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Start Upload
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadArea;
