export const themeColors = {
  // --- CCF 等级：独立部分，用于优先级区分 ---
  // CCF 是一个自定义分类系统，用于根据优先级或重要性对元素进行颜色标记。
  // 使用规则：
  // - A 级 (最高优先级)：用于关键内容，如重要通知或高对比度显示，例如 ccfAText 和 ccfABg。
  // - B 级 (中间优先级)：用于次要内容，提供中等强调，例如 ccfBText 和 ccfBBg。
  // - C 级 (标准优先级)：用于一般内容，避免过度突出，例如 ccfCText 和 ccfCBg。
  // 建议：在组件中使用这些颜色时，确保对比度符合可访问性标准（例如 WCAG 指南），并根据实际需求组合使用。
  ccfAText: 'text-blue-900',  // A 级文本颜色，更深的蓝色表示最高优先级
  ccfABg: 'bg-blue-200',  // A 级背景颜色，浅蓝色用于高亮显示
  ccfBText: 'text-blue-700',  // B 级文本颜色，深蓝色表示中间优先级
  ccfBBg: 'bg-blue-100',  // B 级背景颜色，浅蓝色背景
  ccfCText: 'text-blue-600',  // C 级文本颜色，蓝色用于标准级显示
  ccfCBg: 'bg-blue-50',  // C 级背景颜色，极浅蓝色背景

  // --- 核心调色板：基础颜色定义 ---
  // 这些是项目的基本颜色，用于背景、边框和文本，确保整体风格简洁一致
  primary: 'text-slate-900',  // 主色调，使用深灰蓝色作为核心主题色
  textColorPrimary: 'text-gray-900',  // 主文本颜色，保持深灰色以增加对比度
  textColorSecondary: 'text-gray-700',  // 次要文本颜色，调整为更深的灰色，提高可读性
  textColorTertiary: 'text-gray-600',  // 三级文本颜色，浅灰色用于辅助说明
  linkColor: 'text-slate-800',  // 链接颜色，统一为蓝色以突出交互元素
  accentColor: 'text-slate-800',  // 强调色，蓝色用于突出关键元素
  navBackground: 'bg-white',  // 导航栏背景色，保持白色以确保简洁
  navTextColor: 'text-gray-800',  // 导航文本颜色，深灰色用于可读性
  navHoverText: 'text-gray-700',  // 导航悬停文本颜色，灰色提示交互
  navHoverBorder: 'border-gray-300',  // 导航悬停边框颜色，灰色边框
  footerBorder: 'border-gray-200',  // 页脚边框颜色，浅灰色分隔线
  footerTextColor: 'text-gray-500',  // 页脚文本颜色，浅灰色用于辅助信息
  footerBackground: 'bg-gray-50',  // 页脚背景颜色，浅灰色背景

  // --- 新增的背景色：扩展背景选项 ---
  // 这些背景色用于不同场景，提供更多灵活性
  backgroundWhite: 'bg-white',  // 白色背景，用于主要内容区
  backgroundBlack: 'bg-black',  // 黑色背景，用于暗模式或强调
  backgroundLight: 'bg-gray-100',  // 浅灰背景，用于轻量区块
  backgroundMedium: 'bg-gray-200',  // 中灰背景，用于标准区块
  backgroundDark: 'bg-gray-300',  // 深灰背景，用于次要区域

  // --- 新增的边框：控制边界样式 ---
  // 边框颜色用于元素分隔，提高界面清晰度
  borderLight: 'border-gray-100',  // 浅灰边框，用于细微分隔
  borderMedium: 'border-gray-200',  // 中灰边框，用于标准分隔
  borderDark: 'border-gray-300',  // 深灰边框，用于强调分隔

  // --- 新增的文字颜色：文本样式扩展 ---
  // 这些颜色用于各种文本级别，确保可访问性
  textWhite: 'text-white',  // 白色文本，用于深色背景
  textGrayLight: 'text-gray-400',  // 浅灰文本，用于辅助信息
  textGrayMedium: 'text-gray-500',  // 中灰文本，用于次要内容
  textGrayDark: 'text-gray-600',  // 深灰文本，用于强调

  // --- 新增的渐变：视觉效果增强 ---
  // 渐变用于动态效果，但需审慎使用
  gradientPrimary: 'from-slate-900 via-slate-800 to-slate-700',  // 主渐变，从深灰到中灰
  gradientFade: 'from-gray-100 to-transparent',  // 淡出渐变，用于内容过渡

  // --- 新增的透明度：控制不透明度 ---
  // 这些用于背景或元素的透明效果
  opacityLight: 'bg-opacity-50',  // 轻度透明，50% 不透明
  opacityMedium: 'bg-opacity-75',  // 中度透明，75% 不透明
  opacityDark: 'bg-opacity-95'  // 深度透明，95% 不透明
}; 