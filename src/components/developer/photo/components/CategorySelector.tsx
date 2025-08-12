/**
 * 分类选择器组件
 *
 * 提供相册分类选择功能
 */

import React from "react";
import type { CategorySelectorProps } from "../types";
import {
  VALID_CATEGORIES,
  getCategoryLabel,
  getCategoryDescription,
} from "../constants";

/**
 * 分类选择器组件
 */
const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
}) => {
  /**
   * 处理分类变更
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as any);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select album category
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        {VALID_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {getCategoryLabel(category)} ({category})
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">
        {getCategoryDescription(value)}
      </p>
    </div>
  );
};

export default CategorySelector;
