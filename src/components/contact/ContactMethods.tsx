"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
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

// 防爬虫处理：将联系信息拆分为片段
const emailUser = "xuz";
const emailDomain = "ncu.edu.cn";
const phonePart1 = "(0791)";
const phonePart2 = "8396";
const phonePart3 = "8516";

const ContactMethods: React.FC = () => {
  // 使用状态存储最终生成的、可点击的链接，初始值设为无效链接以防爬虫
  const [emailHref, setEmailHref] = useState<string>("#");
  const [phoneHref, setPhoneHref] = useState<string>("#");

  useEffect(() => {
    // 仅在组件挂载到客户端后执行，动态生成真实的 mailto 和 tel 链接
    setEmailHref(`mailto:${emailUser}@${emailDomain}`);
    setPhoneHref(
      `tel:+86${phonePart1.replace(/\(|\)/g, "")}${phonePart2}${phonePart3}`,
    );
  }, []); // 空依赖数组确保此 effect 仅在挂载时运行一次

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
        {/* 邮箱链接，href 动态绑定状态，文本保持可读 */}
        <a
          href={emailHref} // 绑定到客户端生成的链接
          className={`${themeColors.textColorPrimary} group-hover:${themeColors.ccfAText} transition-colors`}
        >
          {`${emailUser}@${emailDomain}`}
        </a>
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
        {/* 电话链接，href 动态绑定状态，文本保持可读 */}
        <a
          href={phoneHref} // 绑定到客户端生成的链接
          className={`${themeColors.textColorPrimary} group-hover:${themeColors.ccfAText} transition-colors`}
        >
          {`${phonePart1} ${phonePart2} ${phonePart3}`}
        </a>
      </motion.div>
    </motion.div>
  );
};

export default ContactMethods;
