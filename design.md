# 项目设计文档

## 1. 主页设计

该部分已经基本完成，不作过多说明

## 2. 开发者页面设计

### 2.1 访问与认证机制

*   **入口触发:** 采用特定的键盘序列（上上下下左右左右baba，即 Konami Code）作为触发开发者登录界面的方式。该监听逻辑应在全局布局或顶层组件中实现。
*   **登录界面:** 触发后，应显示一个**覆盖层 (Overlay) 或模态框 (Modal)** 形式的登录界面，**而不是**跳转到一个单独的 `/developer/login` 路由。
*   **登录提示:** 可以在登录覆盖层上添加一句轻松的提示语，鼓励发现此"彩蛋"的访客，例如："你发现了秘密通道！但只有授权成员才能进入哦。"
*   **认证方式:** 采用 **用户名 + 强密码** 的认证方式。
    *   后端必须对密码进行**哈希加盐**处理后存储，严禁明文存储。
*   **禁止直接访问:** `/developer` 路由本身应受到保护。如果用户未经认证直接访问该路径，应被重定向到首页或显示无权限提示。
*   **认证实现:** 认证逻辑（验证用户名密码、生成 Session/Token）在后端 API 实现，推荐使用安全的 HTTP Only Cookie 存储 Session ID 或 Token。

### 2.2 账户与角色权限 (RBAC)

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

### 2.3 数据模型

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