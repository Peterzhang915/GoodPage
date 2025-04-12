'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, AlertTriangle, ExternalLink, Terminal, Save, Upload, History, Loader2, X, Edit, ArrowLeft, Server, Wrench } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import Typewriter from '@/components/Typewriter';

import ToolCard from '@/components/developer/ToolCard';
import NewsEditor from '@/components/developer/NewsEditor';
import PhotoManager from '@/components/developer/PhotoManager';
import MemberManager from '@/components/developer/MemberManager';
import CodeServerManager from '@/components/developer/CodeServerManager';
import OpsManager from '@/components/developer/OpsManager';

// --- Password Verification --- //
const verifyPassword = (password: string): boolean => {
  const correctPassword = "308666";
  return password === correctPassword;
};

// --- Developer Page Component --- //
const DeveloperPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [linuxPasswordInput, setLinuxPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'normal' | 'linux'>('normal');
  const [isPromptComplete, setIsPromptComplete] = useState(false);

  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleLoginAttempt = useCallback((enteredPassword: string) => {
    setError(null);
    if (verifyPassword(enteredPassword)) {
      setIsAuthenticated(true);
      setActiveTool(null); // Reset active tool on successful login
      console.log('Developer access granted.');
    } else {
      setError('Authentication failed.');
      console.warn('Failed developer login attempt.');
    }
    setPassword('');
    setLinuxPasswordInput('');
    setIsPromptComplete(false);
  }, []);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleLoginAttempt(password);
  };

  // 处理 Linux 风格登录界面的键盘输入
  useEffect(() => {
    if (displayMode === 'linux' && isPromptComplete) {
      const handleKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();
        if (event.key === 'Enter') {
          handleLoginAttempt(linuxPasswordInput);
        } else if (event.key === 'Backspace') {
          setLinuxPasswordInput((prev) => prev.slice(0, -1));
        } else if (event.key.length === 1) {
          setLinuxPasswordInput((prev) => prev + event.key);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => { window.removeEventListener('keydown', handleKeyDown); };
    }
  }, [displayMode, isPromptComplete, linuxPasswordInput, handleLoginAttempt]);

  // 根据认证状态切换 body 的 CSS 类，用于应用全局暗色主题
  useEffect(() => {
    const bodyClass = 'developer-mode-active';
    if (isAuthenticated) {
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
    }
    // 清理函数：确保组件卸载或登出时移除类
    return () => {
      document.body.classList.remove(bodyClass);
    };
  }, [isAuthenticated]);

  // 记录开发者访问事件 (仅在认证成功时)
  useEffect(() => {
    if (isAuthenticated) {
       fetch('/api/visit?source=developer', { method: 'POST' })
        .catch(err => console.error('Error recording developer visit:', err));
    }
  }, [isAuthenticated]);


  const normalIntroText = "Whoa! You found the secret passage!\nAre you one of us, or just randomly mashing buttons?\nProve your worthiness!";
  const linuxIntroText = `[root@goodlab ~]# access --level=developer --session=new\nWARNING: /proc/secrets/dev_access requires elevation.\nAuthentication required. Password:`;

  // --- Login Screen UI --- //
  if (!isAuthenticated) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className={`bg-white p-10 rounded-lg shadow-xl max-w-xl w-full border border-yellow-300 relative`}
        >
          <button
             onClick={() => setDisplayMode(prev => prev === 'normal' ? 'linux' : 'normal')}
             className={`absolute top-4 right-4 p-2 rounded hover:bg-gray-100 ${themeColors.textColorSecondary} transition-colors`}
             title="Toggle display mode"
          >
             <Terminal size={18} />
          </button>
          <AlertTriangle size={52} className="mx-auto text-yellow-500 mb-5" />
          <h1 className={`text-3xl font-bold mb-5 ${themeColors.ccfBText}`}>Developer Access Only</h1>
          <div className={`mb-8 text-left text-sm ${themeColors.textColorSecondary} min-h-[6em] whitespace-pre-wrap pl-0 ml-0`} >
            <Typewriter
              key={displayMode}
              text={displayMode === 'normal' ? normalIntroText : linuxIntroText}
              speed={displayMode === 'normal' ? 30 : 15}
              onComplete={() => setIsPromptComplete(true)}
            />
            {displayMode === 'linux' && isPromptComplete && (
              <span className="text-yellow-500 inline-block">
                {'*'.repeat(linuxPasswordInput.length)}
                <span className="inline-block w-2 h-4 bg-current ml-1 animate-blink"></span>
              </span>
            )}
          </div>
          {displayMode === 'normal' && (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label htmlFor="dev-password" className="sr-only">Developer Password</label>
                <input
                  id="dev-password" name="dev-password" type="password"
                  autoComplete="current-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`py-3 px-4 block w-full shadow-sm ${themeColors.textColorPrimary} ${themeColors.backgroundWhite} focus:ring-indigo-500 focus:border-indigo-500 border ${error ? 'border-red-500' : themeColors.borderMedium} rounded-md text-base`}
                />
              </div>
              {error && <p className="text-sm text-red-600 text-left">{error}</p>}
              <button
                type="submit"
                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium ${themeColors.textWhite} ${themeColors.ccfABg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity`}
              >
                <Lock size={18} className="mr-2" /> Unlock Developer Tools
              </button>
            </form>
          )}
           {displayMode === 'linux' && error && (
               <p className="text-sm text-red-600 text-left mt-4">{error}</p>
            )}
        </motion.div>
      </div>
    );
  }

  // --- Authenticated View: Developer Toolbox --- //
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className={`text-4xl font-bold text-green-400 mb-2 flex items-center justify-center gap-3`}>
          <Unlock size={36} /> Developer Toolbox Activated!
        </h1>
        <p className="text-gray-400">Welcome back, master builder! Here are your tools. Use them wisely.</p>
      </motion.div>

      {/* --- Conditional Rendering: Tool Cards Grid OR Active Tool View --- */}
      {activeTool === null ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Tool: Manage Code Servers */}
          <ToolCard
            title="Manage Code Servers"
            description="View, add, or remove Code Server instances."
            buttonText="Manage Servers"
            icon={<Server size={16} className="mr-2"/>}
            onButtonClick={() => setActiveTool('codeserver')}
            delay={0.1}
          />

          {/* Tool: Update News */}
          <ToolCard
            title="Update News"
            description="Modify the news items displayed on the homepage."
            buttonText="Manage News"
            icon={<Edit size={16} className="mr-2"/>}
            onButtonClick={() => setActiveTool('news')}
            delay={0.2}
          />

          {/* Tool: Add Photo (Placeholder) */}
          <ToolCard
            title="Add New Photo"
            description="Quickly upload and add a new photo to the gallery."
            buttonText="Upload Photo"
            icon={<Upload size={16} className="mr-2"/>}
            onButtonClick={() => setActiveTool('photo')}
            disabled={true}
            delay={0.3}
          />

          {/* Tool: Add Member (Placeholder) */}
          <ToolCard
            title="Add New Member"
            description="Add information for a new lab member."
            buttonText="Add Member"
            icon={<Unlock size={16} className="mr-2"/>}
            onButtonClick={() => setActiveTool('member')}
            disabled={true}
            delay={0.4}
          />

          {/* Tool: Operations Tools */}
          <ToolCard
            title="Operations Tools"
            description="Access tools for server maintenance and monitoring."
            buttonText="Open Ops Tools"
            icon={<Wrench size={16} className="mr-2"/>}
            onButtonClick={() => setActiveTool('ops')}
            disabled={true}
            delay={0.5}
          />

        </motion.div>
      ) : (
        // Show Active Tool's Detailed View
        <motion.div
          key={activeTool}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {activeTool === 'news' && <NewsEditor onClose={() => setActiveTool(null)} />}
          {activeTool === 'photo' && <PhotoManager onClose={() => setActiveTool(null)} />}
          {activeTool === 'member' && <MemberManager onClose={() => setActiveTool(null)} />}
          {activeTool === 'codeserver' && <CodeServerManager onClose={() => setActiveTool(null)} />}
          {activeTool === 'ops' && <OpsManager onClose={() => setActiveTool(null)} />}
        </motion.div>
      )}
    </div>
  );
};

export default DeveloperPage;
