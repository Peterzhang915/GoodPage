// src/app/contact/page.tsx
'use client'; // 需要客户端组件以使用 Framer Motion hooks 和事件处理

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Building2, School, ChevronDown, ChevronUp, Map as MapIcon } from 'lucide-react'; // 导入图标
import { themeColors } from '@/styles/theme';

// 定义动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 子元素依次出现，间隔 0.2 秒
      delayChildren: 0.1, // 延迟 0.1 秒开始第一个子元素的动画
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

const expandingSectionVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: '1rem', // 展开时添加上边距
    marginBottom: '2rem', // 展开时添加下边距
    overflow: 'visible',
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const ContactPage: React.FC = () => {
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  return (
    <div className={`container mx-auto px-4 py-12 ${themeColors.textColorPrimary}`}> {/* 使用 textColorPrimary */}
      <motion.h1 
        className={`text-4xl font-bold mb-16 text-center ${themeColors.textColorPrimary}`}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Contact Us
      </motion.h1>

      {/* 使用 motion.div 包裹并应用 containerVariants 实现子元素交错动画 */}
      <motion.div 
        className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-lg shadow-xl border border-gray-100 overflow-hidden" // 增强样式
        variants={containerVariants}
        initial="hidden"
        animate="visible" // 使用 animate 确保页面加载时就执行动画
      >
        <motion.div variants={itemVariants} className="mb-8"> {/* 分块 1: 实验室名称 */}
          <h3 className={`text-2xl font-semibold mb-2 ${themeColors.textColorPrimary}`}> 
            Generic Operational and Optimal Data Lab
          </h3>
          <p className="text-xl text-gray-600">泛在数据分析与优化实验室</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-5 mb-8"> {/* 分块 2: 地址信息 */}
          <div className="flex items-start gap-4">
            <School size={20} className={`mt-1 ${themeColors.textColorSecondary}`} />
            <div>
              <p>School of Information Engineering</p>
              <p>Department of Computer Science and Engineering</p>
              <p>The Nanchang University</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin size={20} className={`mt-1 ${themeColors.textColorSecondary}`} />
            <div>
              <p>IEB A608-1, 999 Xuefu BLVD</p> {/* 调整地址显示 */}
              <p>Nanchang, Jiangxi, 330000</p>
              <p>China</p> {/* 添加国家 */}
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-4 mb-8"> {/* 分块 3: 联系方式 - 增加 mb-8 */}
          <div className="flex items-center gap-4">
            <Mail size={20} className={`${themeColors.textColorSecondary}`} />
            <a href="mailto:xuz@ncu.edu.cn" className={`hover:underline ${themeColors.textColorPrimary} hover:${themeColors.ccfAText}`}>
              xuz@ncu.edu.cn
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Phone size={20} className={`${themeColors.textColorSecondary}`} />
            {/* 更新电话号码并添加 tel: 链接 */}
            <a href="tel:+8679183968516" className={`hover:underline ${themeColors.textColorPrimary} hover:${themeColors.ccfAText}`}>
              (0791) 8396 8516
            </a>
          </div>
        </motion.div>

        {/* --- 地图触发器 --- */}
        <motion.div variants={itemVariants} className="border-t pt-6 mb-6"> 
          <button
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className={`flex justify-between items-center w-full text-left text-lg font-medium ${themeColors.textColorPrimary} hover:${themeColors.ccfAText} transition-colors`}
          >
            <span>View our location</span>
            {isMapExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </motion.div>

        {/* --- 地图内容 (可展开) --- */}
        <AnimatePresence initial={false}>
          {isMapExpanded && (
            <motion.div
              key="map-section"
              variants={expandingSectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gray-50 rounded border border-gray-200 p-4" // 简单样式
            >
              {/* TODO: 在这里嵌入地图组件或 iframe */}
              <p className="text-center text-gray-500">Map will be displayed here.</p>
              <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                <MapIcon size={48} className="text-gray-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- 表单触发器 --- */}
        <motion.div variants={itemVariants} className="border-t pt-6"> 
          <button
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className={`flex justify-between items-center w-full text-left text-lg font-medium ${themeColors.textColorPrimary} hover:${themeColors.ccfAText} transition-colors`}
          >
            <span>Need to send us a message?</span>
            {isFormExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </motion.div>

        {/* --- 联系表单 (可展开) --- */}
        <AnimatePresence initial={false}>
          {isFormExpanded && (
            <motion.div
              key="form-section"
              variants={expandingSectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            > 
              {/* 表单标题移到内部或移除 */}
              {/* <h4 className={`text-xl font-semibold mb-4 pt-6 ${themeColors.ccfCText}`}>Send us a message</h4> */}
              <form action="#" method="POST"> 
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  {/* 姓名 */}
                  <div>
                    <label htmlFor="first-name" className={`block text-sm font-medium ${themeColors.textColorSecondary}`}>Name</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        required
                        className={`py-3 px-4 block w-full shadow-sm ${themeColors.textColorPrimary} focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md`}
                      />
                    </div>
                  </div>
                  {/* 邮箱 */}
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium ${themeColors.textColorSecondary}`}>Email</label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={`py-3 px-4 block w-full shadow-sm ${themeColors.textColorPrimary} focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md`}
                      />
                    </div>
                  </div>
                  {/* 主题 (可选) */}
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className={`block text-sm font-medium ${themeColors.textColorSecondary}`}>Subject</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        className={`py-3 px-4 block w-full shadow-sm ${themeColors.textColorPrimary} focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md`}
                      />
                    </div>
                  </div>
                  {/* 消息内容 */}
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className={`block text-sm font-medium ${themeColors.textColorSecondary}`}>Message</label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className={`py-3 px-4 block w-full shadow-sm ${themeColors.textColorPrimary} focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md`}
                      />
                    </div>
                  </div>
                </div>
                {/* 提交按钮 */}
                <div className="mt-6 sm:col-span-2">
                  <button
                    type="submit"
                    className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium ${themeColors.textWhite} ${themeColors.ccfABg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity`}
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        {/* --- 可展开表单结束 --- */}

      </motion.div>
    </div>
  );
};

export default ContactPage;
