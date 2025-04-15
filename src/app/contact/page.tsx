// src/app/contact/page.tsx
'use client'; // 需要客户端组件以使用 Framer Motion hooks 和事件处理

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Building2, School, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'; // 导入图标
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
  hidden: { 
    opacity: 0, 
    height: 0, 
    marginTop: 0, 
    marginBottom: 0, 
    overflow: 'hidden', 
    clipPath: 'inset(0 0 100% 0)', // Start clipped from bottom
  },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: '0.5rem',
    marginBottom: '1rem', // Add some bottom margin when expanded
    overflow: 'visible',
    clipPath: 'inset(0 0 0% 0)', // Fully revealed
    transition: { 
      duration: 0.4, // Slightly longer duration for combined effect
      ease: "easeInOut",
      // Ensure opacity/height/clipPath animate together
      when: "beforeChildren"
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
    clipPath: 'inset(0 0 100% 0)', // Clip back on exit
    transition: { 
      duration: 0.3, 
      ease: "easeInOut" 
    }
  }
};

const ContactPage: React.FC = () => {
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isAddressHovered, setIsAddressHovered] = useState(false); // 新增: 地址悬停状态

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
        <motion.div variants={itemVariants} className="mb-8"> 
          <h3 className={`text-2xl font-semibold mb-2 ${themeColors.textColorPrimary}`}> 
            Generic Operational and Optimal Data Lab
        </h3>
          <p className="text-xl text-gray-600">泛在数据分析与优化实验室</p>
        </motion.div>

        {/* School Info Block - Now a direct child, added mb-5 */}
        <motion.div variants={itemVariants} className="flex items-start gap-4 mb-5"> 
          {/* Wrap School Icon */}
          <motion.div
            whileHover={{ scale: 1.15, y: -2, color: themeColors.ccfAText }} 
            transition={{ duration: 0.2 }}
            className={`mt-1 ${themeColors.textColorSecondary}`} 
          >
            <School size={20} />
          </motion.div>
          {/* School Text Content */}
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
            {/* 部门信息 */}
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

        {/* Address Info Block - Now a direct child (link), added mb-8 */}
        <a 
          href="https://ditu.amap.com/search?query=南昌大学前湖校区信息工程学院&center=115.879329,28.570309&zoom=15"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-current no-underline group mb-8" // Added mb-8
        >
          {/* Apply itemVariants animation to the inner motion.div if needed, or remove if link itself shouldn't animate */}
          <motion.div 
            variants={itemVariants} // Apply animation here if desired
            className="relative flex items-start gap-4"
            onHoverStart={() => setIsAddressHovered(true)} 
            onHoverEnd={() => setIsAddressHovered(false)}   
          >
            {/* MapPin Icon */}
            <motion.div
              variants={{
                normal: { y: 0, color: themeColors.textColorSecondary },
                hover: { 
                  y: [0, -3, 0],
                  color: themeColors.ccfAText, 
                  transition: { duration: 0.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.1 }
                }
              }}
              animate={isAddressHovered ? "hover" : "normal"}
              className="mt-1 flex-shrink-0 transition-colors duration-200 ease-in-out group-hover:text-[${themeColors.ccfAText}]"
            >
              <MapPin size={20} />
            </motion.div>
            {/* Address Text Content */}
            <div className="flex-grow transition-colors duration-200 ease-in-out group-hover:text-[${themeColors.ccfAText}]"> 
              <p>IEB A608-1, 999 Xuefu BLVD</p> 
              <p>Nanchang, Jiangxi, 330000</p>
              <p>China</p> 
            </div>
            {/* Conditional Hint Text */}
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
        
        {/* Contact Info Block - Kept mb-8 */}
        <motion.div variants={itemVariants} className="space-y-4 mb-8"> 
          {/* Mail section */}
          <motion.div 
            className="flex items-start gap-4 group cursor-pointer"
            whileHover="hover"
          >
            <motion.div variants={{ hover: { x: 3, y: -2, rotate: 5, scale: 1.1, color: themeColors.ccfAText } }} transition={{ duration: 0.2 }}>
              <Mail size={20} className={`${themeColors.textColorSecondary} group-hover:${themeColors.ccfAText} transition-colors`} />
            </motion.div>
            <a href="mailto:xuz@ncu.edu.cn" className={`${themeColors.textColorPrimary} group-hover:${themeColors.ccfAText} transition-colors`}>
              xuz@ncu.edu.cn
            </a>
          </motion.div>
          {/* Phone section */}
          <motion.div 
            className="flex items-start gap-4 group cursor-pointer"
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
