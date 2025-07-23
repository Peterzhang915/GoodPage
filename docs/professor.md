# Professor 页面变更说明文档

## 1. 变更背景

为提升教授个人主页的可维护性、可扩展性和数据一致性，对 `src/app/professor/jiahuishu/page.tsx` 及其相关组件进行了重构和优化。此次变更旨在实现：
- 统一教授页面与 lab_leader 页面的数据结构和展示风格
- 支持从数据库动态获取教授信息
- 组件化各类学术信息展示，便于后续扩展

## 2. 页面结构与数据流

### 2.1 页面入口
- 路径：`src/app/professor/jiahuishu/page.tsx`
- 类型：Next.js 13+ App Router 的 Server Component
- 主要逻辑：
  1. 通过 Prisma 查询数据库，获取 id 为 `JiahuiHu` 的教授信息（member 表）
  2. 若查无此人，返回提示
  3. 其余学术成果、服务、奖项、资助等数据暂以空数组占位，后续可扩展为数据库动态获取
  4. 将所有数据通过 props 传递给 `ProfessorProfileContent` 组件

### 2.2 组件拆分
- 顶层组件：`ProfessorProfileContent`（`src/components/lab_leader/ProfessorProfileContent.tsx`）
  - 负责整体页面布局与各分区渲染
  - 接收所有学术数据、错误信息、地址等 props
- 主要子组件：
  - `LabLeaderHeader`：教授头像、姓名、职称、联系方式、地址等（支持中英文）
  - `ResearchInterestsSection`：研究方向介绍
  - `PublicationsSection`：代表性论文列表
  - `AcademicServicesSection`：学术服务（含 featured/detailed 展开）
  - `AwardsSection`：获奖情况（含 featured/detailed 展开）
  - `SponsorshipsSection`：科研资助/项目（含 featured/detailed 展开）

### 2.3 数据流与数据库关系
- 当前仅 member 主表通过 Prisma 查询，后续可扩展为：
  - publications、academicService、award、sponsorship 等表按 member_id 过滤查询
  - 支持 isFeatured 字段分组
- 所有数据均通过 props 传递，组件内部不再自行请求

## 3. 主要变更点

### 3.1 professor 页面重构
- 原页面逻辑简化为：
  - 仅负责数据获取与异常处理
  - UI 交由 `ProfessorProfileContent` 及其子组件负责
- 便于后续支持多位教授页面的复用

### 3.2 组件化与复用
- 复用 lab_leader 目录下的所有核心展示组件，统一风格
- 组件 props 设计与 lab_leader 页面对齐，便于后续数据结构统一
- 各分区均支持空数据和错误提示，提升健壮性

### 3.3 动画与主题
- 页面整体及各分区引入 framer-motion 动画，提升用户体验
- 主题色、背景色、字体等均通过 themeColors 统一管理，便于主题切换

### 3.4 与 lab_leader 页面的异同
- 数据流一致，均为 Server Component 获取数据后传递给同一套组件
- professor 页面当前仅查 member 主表，lab_leader 页面已支持多表联查
- professor 页面可作为模板，后续支持多位教授/PI 主页

## 4. 后续扩展建议
- 按 member_id 动态查询并填充 publications、services、awards、sponsorships 等数据
- 支持多语言切换（中英文）
- 支持多位教授页面自动路由与复用
- 丰富各分区内容，如加入社会兼职、团队介绍等

## 5. 相关文件
- 页面入口：`src/app/professor/jiahuishu/page.tsx`
- 主要组件：`src/components/lab_leader/ProfessorProfileContent.tsx` 及其所有子组件
- 数据库接口：`@/lib/prisma`
- 类型定义：`@/lib/types`、`@prisma/client`

## 6. 教授顺序的排序控制说明

### 6.1 排序字段
- `Member` 表包含 `display_order` 字段，专用于控制教授（PROFESSOR）在所有成员列表中的显示顺序，数值越小越靠前。

### 6.2 前后端排序逻辑
- `/members` 路由：
  - 教授分组内部，前端会根据 `display_order` 升序排序。
  - 其他成员分组按入学年、姓名等排序。
- developer 管理端：
  - 成员管理列表渲染前，前端会自动将所有 `status === 'PROFESSOR'` 的成员按 `display_order` 升序排列，其余成员顺序不变。
  - 这样保证了管理端和前台页面的教授顺序完全一致。

### 6.3 维护建议
- 如需调整教授在列表中的显示顺序，只需在数据库或管理端编辑该成员的 `display_order` 字段。
- 其他成员（非教授）不受该字段影响，顺序由原有逻辑决定。

---
如需进一步扩展或有疑问，请联系开发团队。 