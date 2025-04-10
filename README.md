# NCU GOOD Lab 主页 (Homepage4good)

本项目是南昌大学 GOOD 实验室新版主页的前端实现，使用 Next.js, TypeScript, Tailwind CSS 和 Framer Motion 构建。

## 环境要求

在开始之前，请确保您的开发环境中安装了以下软件：

*   [Node.js](https://nodejs.org/) (建议使用 LTS 版本，例如 v18 或 v20)
*   [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装) 或 [yarn](https://yarnpkg.com/) 或 [pnpm](https://pnpm.io/)

## 快速开始 (Getting Started)

请按照以下步骤在本地运行项目进行开发：

1.  **克隆仓库 (Clone Repository):**
    ```bash
    git clone https://github.com/YourUsername/YourRepositoryName.git # 请替换为实际的仓库地址
    cd homepage4good
    ```

2.  **安装依赖 (Install Dependencies):**
    进入项目根目录 (包含 `package.json` 文件的目录)，然后运行以下命令之一：
    ```bash
    npm install
    # 或者
    # yarn install
    # 或者
    # pnpm install
    ```
    这将下载并安装项目所需的所有依赖包。

3.  **运行开发服务器 (Run Development Server):**
    安装完依赖后，运行以下命令启动 Next.js 开发服务器：
    ```bash
    npm run dev
    # 或者
    # yarn dev
    # 或者
    # pnpm dev
    ```
    此命令会启动一个本地服务器，通常监听在 `http://localhost:3000`。

4.  **在浏览器中查看 (View in Browser):**
    打开您的浏览器，访问 [http://localhost:3000](http://localhost:3000)。您应该能看到正在开发的实验室主页。

5.  **开始编辑 (Start Editing):**
    项目的主要页面代码位于 `src/app/page.tsx`。您可以开始修改这个文件，保存后页面会自动更新以反映您的更改。

## 主要技术栈

*   **框架:** [Next.js](https://nextjs.org/) (App Router)
*   **语言:** [TypeScript](https://www.typescriptlang.org/)
*   **样式:** [Tailwind CSS](https://tailwindcss.com/) v4
*   **动画:** [Framer Motion](https://www.framer.com/motion/)
*   **包管理器:** npm (项目初始化时使用，但兼容 yarn/pnpm)

## 项目结构 (简要)

```
homepage4good/
├── public/           # 存放静态资源，如图片
├── src/
│   ├── app/          # Next.js App Router 核心目录
│   │   ├── globals.css # 全局 CSS 样式
│   │   ├── layout.tsx  # 根布局文件
│   │   └── page.tsx    # 主页组件
│   └── ...           # 其他组件或页面可以放在这里
├── .env.local        # 本地环境变量 (需自行创建，已加入 .gitignore)
├── .eslintrc.json    # ESLint 配置文件
├── .gitignore        # Git 忽略文件配置
├── next-env.d.ts     # Next.js 类型声明
├── next.config.mjs   # Next.js 配置文件
├── package.json      # 项目依赖和脚本
├── postcss.config.mjs # PostCSS 配置文件 (用于 Tailwind CSS)
├── README.md         # 项目说明文件 (就是您正在看的这个)
└── tailwind.config.js # Tailwind CSS 配置文件
└── tsconfig.json     # TypeScript 配置文件
```

## 贡献指南 (Contributing)

(后续可以添加团队协作规范，例如分支策略、代码风格要求等)

---

(保留原 README 中关于 Vercel 部署的部分，如果需要的话)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
