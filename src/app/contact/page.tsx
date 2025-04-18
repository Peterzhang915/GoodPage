// src/app/contact/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { themeColors } from "@/styles/theme";

import SchoolInfo from "@/components/contact/SchoolInfo";
import AddressInfo from "@/components/contact/AddressInfo";
import ContactMethods from "@/components/contact/ContactMethods";

// 容器动画变体：控制整体淡入效果以及子元素的交错入场动画
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const ContactPage: React.FC = () => {
  return (
    <div className={`px-4 py-12 ${themeColors.textColorPrimary}`}>
      <motion.h1
        className={`text-4xl font-bold mb-12 text-center`}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Contact Us
      </motion.h1>

      <motion.div
        className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-lg shadow-xl border border-gray-100 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 实验室名称 */}
        <motion.div className="mb-8">
          <h3
            className={`text-2xl font-semibold mb-2 ${themeColors.textColorPrimary}`}
          >
            Generic Operational and Optimal Data Lab
          </h3>
          <p className="text-xl text-gray-600">泛在数据分析与优化实验室</p>
        </motion.div>

        {/* 渲染提取出的子组件 */}
        <SchoolInfo />
        <AddressInfo />
        <ContactMethods />
      </motion.div>
    </div>
  );
};

export default ContactPage;
