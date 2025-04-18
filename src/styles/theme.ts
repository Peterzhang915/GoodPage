/**
 * GoodPage 颜色主题定义
 * 
 * 定义 Tailwind CSS 类字符串，用于整个应用程序中一致的颜色使用。
 * 遵循命名约定和逻辑分组。
 */
export const themeColors = {
  // ==========================================================================
  // == 核心调色板 & 主要 UI 颜色
  // ==========================================================================
  primary: "#3b82f6", // 核心主色 (例如，blue-500 的十六进制值)
  primaryBg: "bg-blue-500", // 使用主色的背景
  accentColor: "text-slate-800", // 交互元素（链接等）的强调色 - 如果蓝色更合适，可以重新审视
  linkColor: "text-slate-800", // 链接的特定颜色 (可与强调色不同)

  textColorPrimary: "text-gray-800", // 主要文本颜色 (高对比度)
  textColorSecondary: "text-gray-600", // 次要文本 (较低强调)
  textColorTertiary: "text-gray-500", // 三级文本 (例如，柔和的描述文字、页脚文字)

  backgroundWhite: "bg-white", // 标准白色背景
  backgroundLight: "bg-gray-100", // 浅灰色背景 (用于细微区分的区域)
  backgroundMedium: "bg-gray-200", // 中灰色背景
  backgroundDark: "bg-gray-300", // 深灰色背景 (谨慎使用)
  backgroundBlack: "bg-black", // 黑色背景 (暗色模式?)

  borderLight: "border-gray-100", // 细微边框
  borderMedium: "border-gray-200", // 标准边框
  borderDark: "border-gray-300", // 强调边框

  // ==========================================================================
  // == 主站主题颜色 (页头、页脚、导航)
  // ==========================================================================
  themePageBg: "bg-gray-50", // 主站整体页面背景色
  themeHeaderBg: "bg-slate-800", // 主站页头背景色
  themeHeaderLightBg: "bg-slate-700", // 页头元素的较浅变体
  themeLightText: "text-gray-100", // 浅色文字 (通常用于深色背景)
  themePrimaryText: "text-slate-800", // 主站主要文字颜色
  themeSecondaryText: "text-slate-700", // 主站次要文字颜色
  themeMutedText: "text-gray-500", // 柔和文字 (非关键信息)
  themeDarkBorder: "border-slate-900", // 主站元素的深色边框
  themePrimaryBorder: "border-slate-800", // 匹配主题色的主要边框颜色
  themeAccentBorder: "border-blue-500", // 强调边框 (例如，高亮)

  navBackground: "bg-white", // 导航栏背景色
  navTextColor: "text-gray-800", // 导航文字颜色
  navHoverText: "text-gray-700", // 导航文字悬停颜色
  navHoverBorder: "border-gray-300", // 导航边框悬停颜色
  navActiveText: "text-slate-900", // 当前激活导航项的文字颜色
  navActiveBorder: "border-slate-500", // 当前激活导航项的边框颜色

  footerBackground: "bg-gray-50", // 页脚背景色
  footerTextColor: "text-gray-500", // 页脚文字颜色
  footerBorder: "border-gray-200", // 页脚顶部边框颜色

  // ==========================================================================
  // == 反馈 & 状态颜色
  // ==========================================================================
  successText: "text-green-600", // 成功提示文字
  successBg: "bg-green-100", // 成功提示背景
  errorText: "text-red-600", // 错误提示文字
  errorBg: "bg-red-100", // 错误提示背景
  warningText: "text-yellow-600", // 警告提示文字
  warningBg: "bg-yellow-100", // 警告提示背景
  infoText: "text-blue-600", // 信息提示文字
  infoBg: "bg-blue-100", // 信息提示背景

  // ==========================================================================
  // == 开发者工具特定颜色
  // ==========================================================================
  devCardBg: "bg-gray-800", // 工具卡片、登录区域背景
  devText: "text-gray-200", // 开发者工具内的主要文字颜色 (用于深色背景)
  devTitleText: "text-green-400", // 标题文字 (例如，ASCII 艺术字、区域标题)
  devDescText: "text-gray-400", // 描述文字
  devAccent: "text-indigo-400", // 开发者工具内链接/按钮的强调色
  devBorder: "border-gray-700", // 开发者工具内的标准边框
  devMutedBg: "bg-gray-700", // 柔和背景 (例如，表格标题)
  devMutedText: "text-gray-300", // 柔和文字 (例如，表格标题)
  devDisabledText: "text-gray-500", // 禁用元素的文字
  devDescDisabledText: "text-gray-600", // 禁用元素的描述文字
  devButtonBg: "bg-indigo-600", // 主要按钮背景
  devButtonText: "text-white", // 主要按钮文字
  devButtonDisabledBg: "bg-gray-700", // 禁用按钮背景
  devButtonDisabledBorder: "border-gray-600", // 禁用按钮边框
  devHeaderBg: "bg-gray-700/50", // 表格标题背景
  devHeaderText: "text-gray-300", // 表格标题文字
  devRowHover: "hover:bg-gray-700/40", // 表格行悬停背景
  // 注意: devBg 已移除，因为 devCardBg 似乎承担了主要背景色的作用。

  // ==========================================================================
  // == 特定内容类型颜色 (CCF, 高亮)
  // ==========================================================================
  // --- CCF 评级颜色 ---
  ccfAText: "text-red-600",
  ccfABg: "bg-red-100",
  ccfBText: "text-orange-600",
  ccfBBg: "bg-orange-100",
  ccfCText: "text-yellow-600",
  ccfCBg: "bg-yellow-100",

  // --- 高亮/特色标签颜色 ---
  highlightText: "text-indigo-600",
  highlightBg: "bg-indigo-100",

  // ==========================================================================
  // == 通用工具类颜色 (可能与核心调色板重叠，尽量使用核心调色板)
  // ==========================================================================
  // --- 附加文本颜色 ---
  textWhite: "text-white", // 通常在深色背景上使用 themeLightText
  textGrayWhite: "text-gray-200", // devText 的别名?
  textGrayLight: "text-gray-400", // devDescText 的别名?
  textGrayMedium: "text-gray-500", // textColorTertiary 或 themeMutedText 的别名?
  textGrayDark: "text-gray-600", // textColorSecondary 的别名?

  // --- 渐变色 (谨慎使用) ---
  gradientPrimary: "from-slate-900 via-slate-800 to-slate-700", // 主渐变色
  gradientFade: "from-gray-100 to-transparent", // 淡出渐变

  // --- 透明度助手 (尽可能优先使用 Tailwind 类) ---
  opacityLight: "bg-opacity-50", // 轻度不透明
  opacityMedium: "bg-opacity-75", // 中度不透明
  opacityDark: "bg-opacity-95", // 深度不透明 (接近不透明)
};
