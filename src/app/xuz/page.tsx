import React from 'react';
import { themeColors } from '@/styles/theme';

const XuzPage: React.FC = () => {
  return (
    <div className={themeColors.backgroundWhite}>
      <h1 className={themeColors.textColorPrimary}>Xuz 页面</h1>
      <p className={themeColors.textColorSecondary}>这是一个易于扩展的模板页面。您可以在这里添加相关内容，如个人信息或资源。</p>
      {/* 占位符：添加您的专属内容，例如简介或链接 */}
      <div>
        {/* 示例：未来扩展的占位 */}
      </div>
    </div>
  );
};

export default XuzPage; 