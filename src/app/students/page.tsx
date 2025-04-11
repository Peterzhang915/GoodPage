import React from 'react';
import { themeColors } from '@/styles/theme';

const StudentsPage: React.FC = () => {
  return (
    <div className={themeColors.backgroundWhite}>
      <h1 className={themeColors.textColorPrimary}>Students 页面</h1>
      <p className={themeColors.textColorSecondary}>这是一个易于扩展的学生模板。您可以在这里添加学生列表或相关信息。</p>
      {/* 占位符：添加您的学生内容，例如列表或表单 */}
      <div>
        {/* 示例：未来扩展的占位 */}
      </div>
    </div>
  );
};

export default StudentsPage; 