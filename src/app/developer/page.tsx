'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, AlertTriangle, ExternalLink, Terminal } from 'lucide-react'; // Added ExternalLink and Terminal
import { themeColors } from '@/styles/theme';
import Typewriter from '@/components/Typewriter'; // 导入 Typewriter 组件

// 修改密码验证函数，使用静态密码
const verifyPassword = (password: string): boolean => {
  // 暂时使用静态密码，部署时应改为更安全的方式
  const correctPassword = "308666"; 
  return password === correctPassword;
};

const DeveloperPage: React.FC = () => {
  const [password, setPassword] = useState(''); // For normal mode form
  const [linuxPasswordInput, setLinuxPasswordInput] = useState(''); // For linux mode typing
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'normal' | 'linux'>('normal');
  const [isPromptComplete, setIsPromptComplete] = useState(false); // Track typewriter completion

  // 修改 handleLogin 以接受密码参数
  const handleLoginAttempt = useCallback((enteredPassword: string) => {
    setError(null); 
    if (verifyPassword(enteredPassword)) {
      setIsAuthenticated(true);
      console.log('Developer access granted.');
    } else {
      setError('Authentication failed.'); // 更通用的错误信息
      console.warn('Failed developer login attempt.');
    }
    setPassword(''); // Clear normal input
    setLinuxPasswordInput(''); // Clear linux input
    setIsPromptComplete(false); // Reset prompt completion for next attempt if needed
  }, []); // Empty dependency array as it uses no external state directly

  // Normal form submission handler
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleLoginAttempt(password);
  };

  // Effect for Linux mode keyboard listener
  useEffect(() => {
    // Only listen if in linux mode and prompt is complete
    if (displayMode === 'linux' && isPromptComplete) {
      const handleKeyDown = (event: KeyboardEvent) => {
        event.preventDefault(); // Prevent default actions like scrolling on arrow keys if needed

        if (event.key === 'Enter') {
          handleLoginAttempt(linuxPasswordInput);
        } else if (event.key === 'Backspace') {
          setLinuxPasswordInput((prev) => prev.slice(0, -1));
        } else if (event.key.length === 1) { // Check if it's a single printable character
          setLinuxPasswordInput((prev) => prev + event.key);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      console.log('Linux input listener attached');

      // Cleanup listener
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        console.log('Linux input listener removed');
      };
    }
  }, [displayMode, isPromptComplete, linuxPasswordInput, handleLoginAttempt]); // Add dependencies

  // Effect to toggle body class based on authentication status
  useEffect(() => {
    const bodyClass = 'developer-mode-active';
    if (isAuthenticated) {
      document.body.classList.add(bodyClass);
      console.log('Added body class:', bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
      console.log('Removed body class:', bodyClass);
    }

    // Cleanup function to remove class on component unmount
    return () => {
      document.body.classList.remove(bodyClass);
      console.log('Cleanup: Removed body class:', bodyClass);
    };
  }, [isAuthenticated]); // Dependency array ensures this runs when auth changes

  // Effect to record developer visit on successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authenticated, recording developer visit...');
      fetch('/api/visit?source=developer', { method: 'POST' })
        .then(res => {
          if (!res.ok) {
            console.error('Failed to record developer visit:', res.statusText);
          }
          return res.json(); // Consume the response body even if not used
        })
        .then(data => console.log('Developer visit recorded:', data)) // Optional log
        .catch(err => console.error('Error recording developer visit:', err));
    }
  }, [isAuthenticated]); // Run only when isAuthenticated changes

  // 定义不同模式下的文本
  const normalIntroText = "Whoa! You found the secret passage!\nAre you one of us, or just randomly mashing buttons?\nProve your worthiness!";
  // 模拟 Linux 风格的文本 - 移除末尾空格
  const linuxIntroText = `[root@goodlab ~]# access --level=developer --session=new\nWARNING: /proc/secrets/dev_access requires elevation.\nAuthentication required. Password:`; // No trailing space

  // 如果未认证，显示登录界面
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-mono"> {/* 应用 font-mono */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          // 增大卡片尺寸和内边距
          className="bg-white p-10 rounded-lg shadow-xl max-w-xl w-full border border-yellow-300 relative"
        >
          {/* 添加切换按钮 */}
          <button 
             onClick={() => setDisplayMode(prev => prev === 'normal' ? 'linux' : 'normal')}
             className={`absolute top-4 right-4 p-2 rounded hover:bg-gray-100 ${themeColors.textColorSecondary} transition-colors`}
             title="Toggle display mode"
          >
             <Terminal size={18} />
          </button>

          <AlertTriangle size={52} className="mx-auto text-yellow-500 mb-5" /> {/* 稍微增大图标 */}
          <h1 className={`text-3xl font-bold mb-5 ${themeColors.ccfBText}`}>Developer Access Only</h1> {/* 增大标题 */}
          {/* Typewriter section */}
          {/* 将 Typewriter 和星号放在同一父级下，允许 inline 排列 */}
          <div className={`mb-8 text-left text-sm ${themeColors.textColorSecondary} min-h-[6em] whitespace-pre-wrap pl-0 ml-0`} > 
            <Typewriter 
              key={displayMode} 
              text={displayMode === 'normal' ? normalIntroText : linuxIntroText} 
              speed={displayMode === 'normal' ? 30 : 15} 
              onComplete={() => setIsPromptComplete(true)} 
            />
            {/* Display asterisks for Linux mode password input - Now directly after Typewriter */}
            {displayMode === 'linux' && isPromptComplete && (
              // 使用 inline-block 或 inline，并添加闪烁光标 (如果需要)
              <span className="text-yellow-500 inline-block">
                {'*'.repeat(linuxPasswordInput.length)}
                {/* 也可以在这里添加一个闪烁的光标 */}
                <span className="inline-block w-2 h-4 bg-current ml-1 animate-blink"></span>
              </span>
            )}
          </div>

          {/* Conditionally render the standard form */} 
          {displayMode === 'normal' && (
            <form onSubmit={handleFormSubmit} className="space-y-5"> 
              <div>
                <label htmlFor="dev-password" className="sr-only">Developer Password</label>
                <input
                  id="dev-password"
                  name="dev-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  className={`py-3 px-4 block w-full shadow-sm ${themeColors.textColorPrimary} focus:ring-indigo-500 focus:border-indigo-500 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md text-base`}
                />
              </div>
              {error && (
                 <p className="text-sm text-red-600 text-left">{error}</p>
              )}
              <button
                type="submit"
                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium ${themeColors.textWhite} ${themeColors.ccfABg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity`}
              >
                <Lock size={18} className="mr-2" /> Unlock Developer Tools
              </button>
            </form>
          )}
          {/* Display error for Linux mode if needed */} 
           {displayMode === 'linux' && error && (
               <p className="text-sm text-red-600 text-left mt-4">{error}</p>
            )}

        </motion.div>
      </div>
    );
  }

  // 如果已认证，显示开发者工具箱
  return (
    // 应用 font-mono, 深色背景, 浅色文本 和 padding
    <div className="font-mono px-4 py-8 bg-gray-900 text-gray-100 rounded-lg mt-8 mb-8"> {/* 添加圆角和外边距 */}
      <motion.h1 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         // 使用更亮的颜色，调整间距
         className={`text-3xl md:text-4xl font-bold mb-6 text-green-400 flex items-center gap-3`} 
      >
         <Unlock size={32} /> 
         <span>Developer Toolbox Activated!</span>
      </motion.h1>

      {/* 使用浅灰色文本 */}
      <p className="mb-10 text-base text-gray-400">Welcome back, master builder! Here are your tools. Use them wisely.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* 可以稍微减小 gap */}
        {/* Tool: Code Server Link - 应用暗色卡片样式 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          // 移除 bg-white 和 shadow, 添加暗色背景和边框
          className="bg-gray-800 p-6 rounded-md border border-gray-700 flex flex-col justify-between"
        >
          <div> 
            {/* 调整标题和描述颜色 */}
            <h2 className="text-xl font-semibold mb-3 text-green-400">Code Server Access</h2>
            <p className="text-sm text-gray-400 mb-5">Direct link to the internal Code Server instance.</p>
          </div>
          <a 
            href="http://your-codeserver-internal-ip:port" 
            target="_blank" 
            rel="noopener noreferrer"
            // 调整按钮颜色以适应深色背景
            className={`mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors`}
          >
            Open Code Server
            <ExternalLink size={16} className="ml-2"/>
          </a>
        </motion.div>

        {/* Tool: Add Photo (Placeholder) - 应用暗色卡片样式 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-md border border-gray-700 flex flex-col justify-between"
        >
           <div>
            <h2 className="text-xl font-semibold mb-3 text-green-400">Add New Photo</h2>
            <p className="text-sm text-gray-400 mb-5">Quickly upload and add a new photo to the gallery.</p>
          </div>
           {/* 调整禁用按钮样式 */}
          <button disabled className="mt-auto inline-flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-700 cursor-not-allowed">
            Upload Photo (Coming Soon)
          </button>
        </motion.div>

        {/* Tool: Add Member (Placeholder) - 应用暗色卡片样式 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-md border border-gray-700 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold mb-3 text-green-400">Add New Member</h2>
            <p className="text-sm text-gray-400 mb-5">Add information for a new lab member.</p>
          </div>
           {/* 调整禁用按钮样式 */}
          <button disabled className="mt-auto inline-flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-700 cursor-not-allowed">
            Add Member (Coming Soon)
          </button>
        </motion.div>

      </div>
    </div>
  );

};

export default DeveloperPage;
