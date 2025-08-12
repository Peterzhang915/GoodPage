<div align="center">

# NCU GOOD Lab 主页 (Homepage4good)

[![Plugin Version](https://img.shields.io/badge/Latest_Version-v1.0-blue.svg?style=for-the-badge&color=76bad9)](https://github.com/LEtorpedo/GoodPage)
[![GOODLab](https://img.shields.io/badge/GOODLab-website-ff69b4?style=for-the-badge)](https://good.ncu.edu.cn/)

_✨ 本项目是南昌大学 GOOD 实验室新版主页的前端实现，使用 Next.js, TypeScript, Tailwind CSS 和 Framer Motion 构建。 ✨_

</div>

<br/>
<br/>
<br/>

## 环境要求

在开始之前，请确保您的开发环境中安装了以下软件：

- [Node.js](https://nodejs.org/) (建议使用 LTS 版本，例如 v18 或 v20)
- [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装)

> 注意：本项目统一使用 npm 作为包管理工具，以确保团队开发环境的一致性。

## 快速开始 (Getting Started)

请按照以下步骤在本地运行项目进行开发：

1. **克隆仓库 (Clone Repository):**

   ```bash
   git clone https://github.com/LEtorpedo/GoodPage
   ```

2. **安装依赖 (Install Dependencies):**
   进入项目根目录 (包含 `package.json` 文件的目录)，然后运行以下命令：

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev      #如果你的数据库还没初始化，可能还需要运行这一条代码
   ```

3. **扫描图片库 (Scan Gallery):**
   （可选）如果需要导入图片库中的图片到数据库，运行：

   ```bash
   npm run db:scan-gallery
   ```

   这个命令会扫描 `public/images/gallery` 目录下的所有图片，并将它们添加到数据库中。它会自动：
   - 根据目录结构识别图片分类
   - 跳过已经存在的图片
   - 保持现有的显示顺序和设置

4. **运行开发服务器 (Run Development Server):**
   安装完依赖后，运行以下命令启动 Next.js 开发服务器：

   ```bash
   npm dev
   ```

   此命令会启动一个本地服务器，通常监听在 `http://localhost:3000`。

5. **在浏览器中查看 (View in Browser):**
   打开您的浏览器，访问 [http://localhost:3000](http://localhost:3000)。您应该能看到正在开发的实验室主页。

6. **配置代码格式化 (Code Formatting Setup):**
   为确保代码风格一致，建议配置 Prettier 自动格式化：

   ```bash
   # 格式化整个项目（首次运行推荐）
   npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
   ```

   然后在 VS Code 中配置保存时自动格式化（详见下方"开发工具与代码规范"部分）。

7. **开始编辑 (Start Editing):**
   项目的主要页面代码位于 `src/app/page.tsx`。您可以开始修改这个文件，保存后页面会自动更新以反映您的更改。

## 主要技术栈

- **框架:** [Next.js](https://nextjs.org/) v15.3.0 (App Router)
- **语言:** [TypeScript](https://www.typescriptlang.org/) v5
- **样式:** [Tailwind CSS](https://tailwindcss.com/) v4.1.3
- **动画:** [Framer Motion](https://www.framer.com/motion/) v12.6.3
- **React:** v19.0.0
- **数据库:** [Prisma](https://www.prisma.io/) 与 SQLite
- **代码质量:** [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

## 项目结构 (简要)

```
homepage4good/
├── public/              # 存放静态资源，如图片和网站图标
│   └── images/          # 网站使用的图片资源
├── prisma/              # Prisma 数据库相关文件
│   ├── migrations/      # 数据库迁移记录
│   ├── schema.prisma    # 数据库模型定义
│   ├── seed.ts          # 数据库种子数据
│   └── dev.db           # SQLite 数据库文件
├── src/
│   ├── app/             # Next.js App Router 核心目录
│   │   ├── api/         # API 路由处理
│   │   ├── blog/        # 博客页面
│   │   ├── contact/     # 联系页面
│   │   ├── developer/   # 开发者页面
│   │   ├── gallery/     # 图库页面
│   │   ├── members/     # 成员页面
│   │   ├── publications/# 发表文章页面
│   │   ├── students/    # 学生信息页面
│   │   ├── globals.css  # 全局 CSS 样式
│   │   ├── layout.tsx   # 根布局文件
│   │   └── page.tsx     # 主页组件
│   ├── components/      # 可复用的 UI 组件
│   │   ├── developer/   # 开发者相关组件
│   │   ├── Footer.tsx   # 页脚组件
│   │   ├── Navbar.tsx   # 导航栏组件
│   │   ├── HeroSection.tsx # 首页英雄区组件
│   │   ├── MemberCard.tsx  # 成员卡片组件
│   │   ├── PhotoGallery.tsx # 照片墙组件
│   │   └── ...          # 其他组件
│   ├── hooks/           # 自定义 React Hooks
│   ├── lib/             # 工具函数和库集成
│   │   └── prisma.ts    # Prisma 客户端配置
│   └── styles/          # 样式相关配置和主题
├── .env                 # 环境变量配置文件
├── .eslintrc.json       # ESLint 配置文件
├── .gitignore           # Git 忽略文件配置
├── .prettierrc          # Prettier 代码格式化配置文件
├── next-env.d.ts        # Next.js 类型声明
├── next.config.mjs      # Next.js 配置文件
├── package.json         # 项目依赖和脚本
├── package-lock.json    # 依赖版本锁定文件 (请勿手动修改)
├── postcss.config.mjs   # PostCSS 配置文件 (用于 Tailwind CSS)
├── README.md            # 项目说明文件 (就是您正在看的这个)
├── tailwind.config.js   # Tailwind CSS 配置文件
└── tsconfig.json        # TypeScript 配置文件
```

## 开发工具与代码规范

### 代码格式化 (Prettier)

本项目使用 [Prettier](https://prettier.io/) 确保代码格式的一致性。配置文件位于 `.prettierrc`。

#### 🚀 自动格式化设置 (推荐)

**VS Code 配置：**
1. 安装 "Prettier - Code formatter" 扩展
2. 打开设置 (`Ctrl+,` 或 `Cmd+,`)
3. 搜索 "format on save"，勾选 "Editor: Format On Save"
4. 搜索 "default formatter"，选择 "Prettier - Code formatter"

**效果：** 每次保存文件时自动格式化代码

#### 📝 手动格式化

```bash
# 格式化整个项目
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# 格式化单个文件
npx prettier --write src/components/MyComponent.tsx

# 检查格式是否正确（不修改文件）
npx prettier --check "src/**/*.{ts,tsx,js,jsx}"
```

#### 🎯 格式化规则

项目采用以下格式化规则：
- 使用双引号 (`"`)
- 语句末尾加分号 (`;`)
- 每行最大 80 字符
- 缩进使用 2 个空格
- 对象/数组末尾添加逗号


## 团队协作规范

### Git 工作流

- **主分支:** `main` - 用于生产环境版本，保持稳定
- **开发分支:** `dev` - 用于整合功能，测试稳定后合并到主分支
- **功能分支:** `feature/功能名称` - 从dev分支创建，开发完成后合并回dev

### 代码提交规范

提交信息应当简洁明了，遵循以下格式：

```
<类型>: <简短描述>

<详细描述（可选）>
```

常用类型：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行）
- `refactor`: 代码重构（既不是新功能也不是修bug）
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

### 代码规范要求

- **提交前必须格式化代码** - 使用 Prettier 确保格式一致
- **遵循 TypeScript 严格模式** - 避免使用 `any` 类型
- **组件命名使用 PascalCase** - 如 `UserProfile.tsx`
- **文件命名遵循项目约定** - 详见开发规范文档

### 依赖管理

- 添加新依赖前请在团队内讨论。
- **添加生产依赖** (项目运行时必需的包，如 React, Next.js):

  ```bash
  npm install <package-name> --save
  ```

  > 💡 `--save` 标志（在较新版本的 npm 中是默认行为，但显式写出更清晰）会将依赖添加到 `package.json` 的 `dependencies` 部分。

- **添加开发依赖** (仅在开发过程中需要的包，如 ESLint, TypeScript):

  ```bash
  npm install <package-name> --save-dev
  ```

  > 💡 `--save-dev` 标志会将依赖添加到 `package.json` 的 `devDependencies` 部分。

- 确保提交代码时同时提交 `package.json` 和 `package-lock.json` 文件。这两个文件必须保持同步。

## 常见问题解决

### 依赖和环境问题

如果遇到依赖问题或环境不一致的情况，可尝试：

```bash
# 清理并重新安装依赖
rm -rf node_modules
npm ci

# 如果出现字体下载问题，可能是网络问题，通常可以忽略
# Next.js 会使用后备字体
```

### 代码格式化问题

**问题：VS Code 没有自动格式化**
```bash
# 1. 确保安装了 Prettier 扩展
# 2. 检查 VS Code 设置中是否启用了 "Format On Save"
# 3. 手动格式化测试
npx prettier --write src/app/page.tsx
```

**问题：格式化后代码风格不一致**
```bash
# 检查 .prettierrc 配置文件是否存在
cat .prettierrc

# 重新格式化整个项目
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
```

**问题：Git 提交时出现格式化冲突**
```bash
# 提交前格式化代码
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
git add .
git commit -m "style: 统一代码格式"
```

## 部署指南

项目可部署在 Vercel 上：

1. 将代码推送到 GitHub
2. 在 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 创建新项目并连接仓库
3. 配置环境变量 (如果需要)
4. 点击部署 🚀

更多详情请查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

---
