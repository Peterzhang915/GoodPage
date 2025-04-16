"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { themeColors } from "@/styles/theme";

// 单个条目动画变体：控制从下方滑入并淡入的效果
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const AddressInfo: React.FC = () => {
  const [isAddressHovered, setIsAddressHovered] = useState(false);

  return (
    // 包含地图链接的外部锚点标签
    <a
      href="https://ditu.amap.com/search?query=南昌大学前湖校区信息工程学院&center=115.879329,28.570309&zoom=15"
      target="_blank"
      rel="noopener noreferrer"
      className="block text-current no-underline group mb-5"
    >
      {/* 应用入场动画并处理悬停状态 */}
      <motion.div
        variants={itemVariants} // 应用入场动画
        className="relative flex items-start gap-4"
        onHoverStart={() => setIsAddressHovered(true)}
        onHoverEnd={() => setIsAddressHovered(false)}
      >
        {/* 地图钉图标及其悬停动画 */}
        <motion.div
          // 定义图标普通状态和悬停状态下的动画效果
          variants={{
            normal: { y: 0, color: themeColors.textColorSecondary },
            hover: {
              y: [0, -3, 0], // 上下跳动效果
              color: themeColors.ccfAText, // 变色
              transition: {
                duration: 0.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.1,
              }, // 无限循环动画
            },
          }}
          animate={isAddressHovered ? "hover" : "normal"} // 根据悬停状态应用不同动画
          className="mt-1 flex-shrink-0 transition-colors duration-200 ease-in-out group-hover:text-[${themeColors.ccfAText}]"
        >
          <MapPin size={20} />
        </motion.div>
        {/* 地址文本内容 */}
        <div className="flex-grow transition-colors duration-200 ease-in-out group-hover:text-[${themeColors.ccfAText}]">
          <p>IEB A608-1, 999 Xuefu BLVD</p>
          <p>Nanchang, Jiangxi, 330000</p>
          <p>China</p>
        </div>
        {/* 条件渲染的悬停提示文本 (带动画) */}
        <AnimatePresence>
          {isAddressHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`text-sm ${themeColors.ccfAText} whitespace-nowrap flex-shrink-0`}
            >
              Go here! 👉
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </a>
  );
};

export default AddressInfo;
