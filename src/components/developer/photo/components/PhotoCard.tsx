/**
 * 图片卡片组件
 *
 * 显示单张图片及其操作控件
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Eye, EyeOff, Trash2, Check, X } from "lucide-react";
import type { PhotoCardProps } from "../types";
import { TOOLTIPS } from "../constants";

/**
 * 图片卡片组件
 */
const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onDelete,
  onToggleVisibility,
  onOrderChange,
  onUpdateMetadata,
  isAlbumsView = false,
}) => {
  // 组件状态
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(photo.caption || "");
  const [editDate, setEditDate] = useState(photo.date || "");
  const [isComposing, setIsComposing] = useState(false);

  // 同步编辑状态与 props
  useEffect(() => {
    if (isEditing) {
      setEditCaption(photo.caption || "");
      setEditDate(photo.date || "");
    }
  }, [isEditing, photo.caption, photo.date]);

  /**
   * 保存编辑
   */
  const handleSave = () => {
    onUpdateMetadata(photo, editCaption || null, editDate || null);
    setIsEditing(false);
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    setEditCaption(photo.caption || "");
    setEditDate(photo.date || "");
    setIsEditing(false);
  };

  /**
   * 处理向上移动
   */
  const handleMoveUp = () => {
    const currentOrder = isAlbumsView
      ? photo.albums_order
      : photo.display_order;
    onOrderChange(photo, currentOrder - 1);
  };

  /**
   * 处理向下移动
   */
  const handleMoveDown = () => {
    const currentOrder = isAlbumsView
      ? photo.albums_order
      : photo.display_order;
    onOrderChange(photo, currentOrder + 1);
  };

  /**
   * 获取可见性状态
   */
  const isVisible = isAlbumsView ? photo.show_in_albums : photo.is_visible;

  /**
   * 获取当前顺序
   */
  const currentOrder = isAlbumsView ? photo.albums_order : photo.display_order;

  /**
   * 获取可见性切换的提示文本
   */
  const getVisibilityTooltip = () => {
    if (isAlbumsView) {
      return isVisible ? TOOLTIPS.REMOVE_FROM_ALBUM : TOOLTIPS.ADD_TO_ALBUM;
    }
    return isVisible ? TOOLTIPS.HIDE_IN_CATEGORY : TOOLTIPS.SHOW_IN_CATEGORY;
  };

  return (
    <motion.div
      className={`relative group border rounded-lg overflow-hidden ${
        isVisible
          ? isAlbumsView
            ? "border-green-500"
            : "border-gray-700"
          : "border-red-700 opacity-50"
      }`}
      layout
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 图片 */}
      <img
        src={photo.src}
        alt={photo.alt || "photo"}
        className="w-full h-40 object-cover"
      />

      {/* 控制层 */}
      <AnimatePresence>
        {(showControls || isEditing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-2"
          >
            {/* 顶部控制按钮 */}
            <div className="flex justify-end gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition-colors"
                    title={TOOLTIPS.EDIT_INFO}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onToggleVisibility(photo)}
                    className="bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition-colors"
                    title={getVisibilityTooltip()}
                  >
                    {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {!isAlbumsView && (
                    <button
                      onClick={() => onDelete(photo)}
                      className="bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-80 transition-colors"
                      title={TOOLTIPS.DELETE_PHOTO}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* 底部信息和控制 */}
            <div className="space-y-2">
              {/* 排序控制 */}
              {!isEditing && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleMoveUp}
                    className="bg-black bg-opacity-60 rounded px-3 py-1 text-white text-sm hover:bg-opacity-80 transition-colors disabled:opacity-50"
                    disabled={currentOrder <= 0}
                    title={TOOLTIPS.MOVE_UP}
                  >
                    Move Up
                  </button>
                  <button
                    onClick={handleMoveDown}
                    className="bg-black bg-opacity-60 rounded px-3 py-1 text-white text-sm hover:bg-opacity-80 transition-colors"
                    title={TOOLTIPS.MOVE_DOWN}
                  >
                    Move Down
                  </button>
                </div>
              )}

              {/* 图片信息编辑/显示 */}
              {isEditing ? (
                <div className="bg-black bg-opacity-80 rounded p-2 space-y-2">
                  <div>
                    <input
                      key={photo.id + (isEditing ? "-editing" : "-view")}
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      placeholder="Image Caption"
                      className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      placeholder="Photo Date (YYYY.MM.DD)"
                      className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-700 rounded px-2 py-1 text-white text-sm hover:bg-gray-600 transition-colors"
                      title={TOOLTIPS.CANCEL_EDIT}
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 rounded px-2 py-1 text-white text-sm hover:bg-green-500 transition-colors"
                      title={TOOLTIPS.SAVE_CHANGES}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                (photo.caption || photo.date) && (
                  <div className="bg-black bg-opacity-60 rounded p-2 text-xs">
                    {photo.caption && (
                      <div className="text-white truncate">{photo.caption}</div>
                    )}
                    {photo.date && (
                      <div className="text-gray-300 text-xs">{photo.date}</div>
                    )}
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhotoCard;
