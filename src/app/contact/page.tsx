import React from 'react';
import { themeColors } from '@/styles/theme';

const ContactPage: React.FC = () => {
  return (
    <div className={themeColors.backgroundWhite}>
      <h1 className={themeColors.textColorPrimary}>联系页面</h1>
      <p className={themeColors.textColorSecondary}>这是一个易于扩展的联系模板。您可以在这里添加联系表单或信息。</p>
      {/* 占位符：添加您的联系内容，例如表单或地址 */}
      <div>
        {/* 示例：未来扩展的占位 */}
      </div>
    </div>
  );
};

export default ContactPage; 