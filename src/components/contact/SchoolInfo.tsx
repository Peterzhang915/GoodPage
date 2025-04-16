'use client'; // Client component for motion effects

import React from 'react';
import { motion } from 'framer-motion';
import { School, ExternalLink } from 'lucide-react';
import { themeColors } from '@/styles/theme';

// 单个条目动画变体：控制从下方滑入并淡入的效果
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

const SchoolInfo: React.FC = () => {
  return (
    // 应用 itemVariants 使该信息块整体执行入场动画
    <motion.div variants={itemVariants} className="flex items-start gap-4 mb-5">
      {/* 图标悬停动画 */}
      <motion.div
        whileHover={{ scale: 1.15, y: -2, color: themeColors.ccfAText }}
        transition={{ duration: 0.2 }}
        className={`mt-1 ${themeColors.textColorSecondary}`}
      >
        <School size={20} />
      </motion.div>
      <div>
        {/* 学院链接 */}
        <motion.a
          href="https://smcs.ncu.edu.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 ${themeColors.textColorPrimary} hover:${themeColors.ccfAText} transition-colors group`}
          whileHover={{ y: -1 }}
        >
          School of Mathematics and Computer Sciences
          <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity"/>
        </motion.a>
        {/* 部门文本 */}
        <p className={`text-sm ${themeColors.textColorSecondary}`}>
          Department of Computer Science and Engineering
        </p>
        {/* 大学链接 */}
        <motion.a
          href="https://www.ncu.edu.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 mt-1 ${themeColors.textColorPrimary} hover:${themeColors.ccfAText} transition-colors group`}
          whileHover={{ y: -1 }}
        >
          The Nanchang University
          <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity"/>
        </motion.a>
      </div>
    </motion.div>
  );
};

export default SchoolInfo; 