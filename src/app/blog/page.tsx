import React from "react";
import { themeColors } from "@/styles/theme";

const BlogPage: React.FC = () => {
  return (
    <div className={themeColors.backgroundWhite}>
      <h1 className={themeColors.textColorPrimary}>博客页面</h1>
      <p className={themeColors.textColorSecondary}>
        这是一个易于扩展的博客模板。您可以在这里添加博客列表或文章内容。
      </p>
      {/* 占位符：添加您的博客内容，例如动态列表 */}
      <div>{/* 示例：未来扩展的占位 */}</div>
    </div>
  );
};

export default BlogPage;
