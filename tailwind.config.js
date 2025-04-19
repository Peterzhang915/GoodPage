/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // 确保扫描 app 目录
  ],
  safelist: [
    "bg-theme-page",
    "bg-theme-header",
    "bg-theme-header-light",
    "text-theme-light",
    "text-theme-primary",
    "text-theme-secondary",
    "text-theme-muted",
    "border-theme-dark",
    "border-theme-primary",
    "border-theme",
  ],
  theme: {
    extend: {
      // 可以在这里扩展主题，例如添加自定义颜色、字体等
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
