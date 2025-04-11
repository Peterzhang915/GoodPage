// src/app/contact/page.tsx
'use client'; // 需要客户端组件以使用 Framer Motion hooks 和事件处理

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Building2, School, ChevronDown, ChevronUp, Map as MapIcon, ExternalLink } from 'lucide-react'; // 导入图标
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
    marginTop: '0.5rem', // 减小展开时的上边距
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
  const [isAddressHovered, setIsAddressHovered] = useState(false); // 新增: 地址悬停状态

  return (
    <div className={`px-4 py-16 ${themeColors.textColorPrimary}`}>
      <motion.h1 
        className={`text-4xl font-bold mb-12 text-center ${themeColors.ccfAText}`}
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
              {/* 学校链接 */}
              <motion.a 
                href="https://smcs.ncu.edu.cn/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`inline-flex items-center gap-1 ${themeColors.textColorPrimary} hover:${themeColors.ccfAText} transition-colors group`}
                whileHover={{ y: -1 }}
              >
                School of Information Engineering
                <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity"/>
              </motion.a>
              {/* 部门信息 - 紧随学校下方，添加缩进和样式 */}
              <p className={`text-sm ${themeColors.textColorSecondary} pl-1`}>
                Department of Computer Science and Engineering
              </p>
              {/* 大学链接 - 稍微隔开 */} 
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
          </div>
          {/* 修改地址交互：悬停提示，点击展开 */}
          <motion.div 
            className="cursor-pointer relative" // 添加 relative 定位
            onClick={() => setIsMapExpanded(!isMapExpanded)} // 点击切换地图
            onHoverStart={() => setIsAddressHovered(true)} // 记录悬停开始
            onHoverEnd={() => setIsAddressHovered(false)}   // 记录悬停结束
          >
            <div className="flex items-start gap-4"> {/* 原地址容器 */}
              <MapPin size={20} className={`mt-1 ${themeColors.textColorSecondary}`} />
              <div>
                <p>IEB A608-1, 999 Xuefu BLVD</p> 
                <p>Nanchang, Jiangxi, 330000</p>
                <p>China</p> 
              </div>
            </div>
            {/* 条件渲染悬停提示 */} 
            <AnimatePresence>
              {isAddressHovered && !isMapExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`text-sm ${themeColors.ccfAText} mt-2 ml-10 absolute -bottom-5 left-0 whitespace-nowrap`}
                >
                  Click here 👇 to show location
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* 地图内容 (展开逻辑不变) */}
          <AnimatePresence initial={false}>
            {isMapExpanded && (
              <motion.div
                key="map-section"
                variants={expandingSectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-gray-50 rounded border border-gray-200 p-4 mt-2 ml-10" // 添加左边距对齐提示
              >
                {/* TODO: 在这里嵌入地图组件或 iframe */}
                <p className="text-center text-gray-500">Map will be displayed here.</p>
                <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                  <MapIcon size={48} className="text-gray-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-4 mb-8"> {/* 分块 3: 联系方式 - 增加 mb-8 */}
          <motion.div 
            className="flex items-center gap-4 group cursor-pointer"
            whileHover="hover"
          >
            <motion.div variants={{ hover: { x: 3, y: -2, rotate: 5, scale: 1.1, color: themeColors.ccfAText } }} transition={{ duration: 0.2 }}>
              <Mail size={20} className={`${themeColors.textColorSecondary} group-hover:${themeColors.ccfAText} transition-colors`} />
            </motion.div>
            <a href="mailto:xuz@ncu.edu.cn" className={`${themeColors.textColorPrimary} group-hover:${themeColors.ccfAText} transition-colors`}>
              xuz@ncu.edu.cn
            </a>
          </motion.div>
          <motion.div 
            className="flex items-center gap-4 group cursor-pointer"
            whileHover="hover"
          >
            <motion.div 
              variants={{ hover: { rotate: [0, -8, 8, -8, 8, 0], scale: 1.1, color: themeColors.ccfAText } }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Phone size={20} className={`${themeColors.textColorSecondary} group-hover:${themeColors.ccfAText} transition-colors`} />
            </motion.div>
            <a 
              href="tel:+8679183968516" 
              className={`${themeColors.textColorPrimary} group-hover:${themeColors.ccfAText} transition-colors`}
            >
              (0791) 8396 8516
            </a>
          </motion.div>
        </motion.div>

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
