# 项目设计文档

## 1. 主页设计

该部分已经基本完成，不作过多说明

## 2. 开发者页面设计

开发者页面是授权用户管理网站内容的入口。

### 2.1 访问机制

*   **触发方式:** Konami Code (上上下下左右左右 B A)。在全局布局或特定组件中监听键盘事件序列。
*   **后续流程:** 成功触发后，显示认证界面（Modal 或独立页面）。

### 2.2 认证设计

*   **初期方案:** 固定密钥认证。
    *   在认证界面提供一个输入框。
    *   用户输入存储在环境变量 (`DEVELOPER_ACCESS_KEY` 或类似名称) 中的预设密钥。
    *   后端提供 API (`/api/auth/login`) 验证密钥。
    *   认证状态通过安全的 HttpOnly Cookie 或 Session 维护。
*   **未来扩展:** 可考虑引入用户名/密码登录或 OAuth (如 GitHub 登录)。

### 2.3 功能模块规划

开发者页面登录后，应提供以下核心管理功能：

*   **新闻管理 (News Management):** 添加、编辑、删除新闻条目。
*   **成员管理 (Member Management):** 添加、编辑、删除实验室成员信息。
*   **出版物管理 (Publication Management):**
    *   通过 BibTeX 文件批量导入。
    *   手动添加、编辑、删除出版物。
    *   (已实现部分) 待处理出版物审批流程。
    *   **负责人主页展示:** 在实验室负责人的编辑界面中，提供选项（如滑动菜单、复选框）让老师选择哪些出版物要展示在自己的个人主页上，并允许按 CCF 等级排序。
*   **照片墙管理 (Photo Gallery Management):** 上传照片、管理标签、设置特色照片。
*   **(待定) 实验室负责人主页编辑 (Lab Leader Profile Editor):** 
    *   **设计思路:** 提供一个集成式的、所见即所得 (WYSIWYG-like) 的编辑界面，以 `lab_leader/page.tsx` 的展示效果为蓝本。
    *   **界面:** 大致复刻老师主页布局，允许直接在对应位置进行编辑。
    *   **编辑方式:**
        *   **文本块 (如研究兴趣、简介):** 使用富文本或 Markdown 编辑器。
        *   **列表数据 (如服务、奖项):** 提供添加、编辑、删除按钮，并提供"直接显示/隐藏"开关来控制 `isFeatured` 状态，可能支持拖拽排序。
        *   **个人信息 (如姓名、邮箱):** 使用文本输入框。
    *   **目标:** 为老师提供一个完整、直观、易用的个人主页内容管理工具。
*   **(待定) 运维/工具 (Ops/Tools):**
    *   (已存在组件) `CodeServerManager`: 提供管理 code-server 的界面 (具体功能待定)。
    *   (已存在组件) `KeyGenerator`: 可能用于管理 API 密钥或其他访问凭证 (具体功能待定)。
    *   (已存在组件) `OpsManager`: 提供其他运维相关操作界面 (具体功能待定)。

### 2.4 账户与角色权限 (RBAC)

*   **账户标识:** 在 `Member` 数据模型中增加一个**唯一的 `username` 字段**作为登录账户名。
*   **角色定义:** 系统定义以下角色，具有不同的权限级别：
    *   **`Root`:** 系统最高权限（通常赋予导师），拥有所有管理权限，包括用户和角色管理。
    *   **`Admin`:** 网站管理员（通常赋予核心开发者），拥有除管理 Root 账户外的所有管理权限，包括内容管理、设置管理、用户管理（除 Root 外）。
    *   **`SeniorMember`:** 资深成员（如博士生、参与实验室管理的学生），拥有广泛的内容管理权限（新闻、出版物、照片），可以管理 `User` 级别的成员信息，可以批准待审核内容。
    *   **`Maintainer`:** 板块维护者，拥有特定模块的编辑权限（通过细分权限点实现，见下）。
    *   **`User`:** 普通实验室成员，只能编辑**自身**的成员信息，访问基础实验室服务。
    *   **`Alumni`:** 已毕业学生，**无任何开发者页面编辑或管理权限**。登录开发者页面后，应明确提示其"已毕业"状态，不显示管理功能。
*   **权限点列表 (初步):**
    *   `manage_users`: 管理用户账户及角色 (Root/Admin)
    *   `manage_roles`: 管理角色定义及权限 (Root)
    *   `manage_settings`: 管理网站全局设置 (Root/Admin)
    *   `manage_news`: 增删改新闻 (Root/Admin/SeniorMember/Maintainer with 'edit_news')
    *   `manage_publications`: 增删改出版物 (Root/Admin/SeniorMember/Maintainer with 'edit_publications')
    *   `manage_members`: 管理成员信息 (Root/Admin/SeniorMember 可改 User, User 只能改自己)
    *   `manage_photos`: 增删改照片 (Root/Admin/SeniorMember/Maintainer with 'edit_photos')
    *   `access_codeserver_basic`: 访问基础 Code Server (User 及以上)
    *   `access_codeserver_advanced`: 访问高级 Code Server (SeniorMember 及以上)
    *   `approve_content`: 批准待审核内容 (SeniorMember/Admin/Root)
    *   *(可根据需要增删权限点)*
*   **授权实现:** 授权检查（判断用户是否有执行某操作的权限）逻辑在后端 API 中实现，推荐使用**中间件 (Middleware)** 对需要权限的路由进行保护。

### 2.5 数据模型

采用灵活的关系型数据库设计方案：

*   **`Member` 表:** 包含成员基本信息，以及新增的 `username` (唯一) 字段。
*   **`Role` 表:** 存储角色信息 (`id`, `name`, `description`)。
*   **`Permission` 表:** 存储细分的权限点 (`id`, `action`, `resource`, `description`)。
*   **`MemberRole` 关联表:** 连接 `Member` 和 `Role` (多对多关系)。
*   **`RolePermission` 关联表:** 连接 `Role` 和 `Permission` (多对多关系)。

## 3. UI/UX 设计

(待补充：记录关键页面的布局、交互、动画等设计决策)

## 4. 技术选型

(待补充：记录项目使用的主要框架、库、数据库等及其版本)

## 5. 项目进度与状态

(待补充：记录已完成和未完成的主要功能模块)

*   **已完成:**
    *   ...
*   **进行中/未完成:**
    *   开发者页面权限系统设计
    *   ... 