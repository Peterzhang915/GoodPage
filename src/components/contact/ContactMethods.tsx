"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { themeColors } from "@/styles/theme";
import ObfuscatedContact from "@/components/common/ObfuscatedContact";

// 单个条目动画变体：控制从下方滑入并淡入的效果
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 12 },
  },
};

// 联系信息
const email = "xuz@ncu.edu.cn";
const phone = "(0791) 8396 8516";

const ContactMethods: React.FC = () => {

  return (
    // 应用入场动画
    <motion.div variants={itemVariants} className="space-y-4 mb-8">
      {/* 邮箱区域 */}
      <motion.div
        className="flex items-start gap-4 group cursor-pointer"
        whileHover="hover" // 应用下方定义的悬停动画变体名
      >
        {/* 邮箱图标及其悬停动画定义 */}
        <motion.div
          variants={{
            hover: {
              x: 3,
              y: -2,
              rotate: 5,
              scale: 1.1,
              color: themeColors.ccfAText,
            },
          }}
          transition={{ duration: 0.2 }}
        >
          <Mail
            size={20}
            className={`${themeColors.textColorSecondary} group-hover:${themeColors.ccfAText} transition-colors`}
          />
        </motion.div>
        {/* 使用 ObfuscatedContact 组件保护邮箱 */}
        <div className={`${themeColors.textColorPrimary} group-hover:${themeColors.ccfAText} transition-colors`}>
          <ObfuscatedContact value={email} type="email" />
        </div>
      </motion.div>
      {/* 电话区域 */}
      <motion.div
        className="flex items-start gap-4 group cursor-pointer"
        whileHover="hover"
      >
        {/* 电话图标及其悬停动画定义 */}
        <motion.div
          variants={{
            hover: {
              rotate: [0, -8, 8, -8, 8, 0],
              scale: 1.1,
              color: themeColors.ccfAText,
            },
          }} // 摇摆动画效果
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Phone
            size={20}
            className={`${themeColors.textColorSecondary} group-hover:${themeColors.ccfAText} transition-colors`}
          />
        </motion.div>
        {/* 使用 ObfuscatedContact 组件保护电话 */}
        <div className={`${themeColors.textColorPrimary} group-hover:${themeColors.ccfAText} transition-colors`}>
          <ObfuscatedContact value={phone} type="phone" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactMethods;
