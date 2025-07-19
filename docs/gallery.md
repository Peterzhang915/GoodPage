# Gallery 功能说明文档

## 1. 数据库结构

### 1.1 GalleryPhoto 表
表名：`GalleryPhoto`
功能：存储实验室相册的图片信息和显示控制

#### 字段说明
| 字段名 | 类型 | 说明 | 是否必填 |
|--------|------|------|----------|
| id | INTEGER | 主键，自增 | 是 |
| filename | TEXT | 图片文件路径，相对于 public/images/gallery | 是 |
| category | TEXT | 图片分类 | 是 |
| caption | TEXT | 图片说明文字 | 否 |
| date | TEXT | 拍摄日期，建议格式：YYYY.MM.DD | 否 |
| is_visible | BOOLEAN | 是否在分类中显示 | 是，默认 true |
| display_order | INTEGER | 在分类中的显示顺序 | 是，默认 0 |
| show_in_albums | BOOLEAN | 是否在首页相册中显示 | 是，默认 false |
| albums_order | INTEGER | 在首页相册中的显示顺序 | 是，默认 0 |
| created_at | DATETIME | 创建时间 | 是，自动 |
| updated_at | DATETIME | 更新时间 | 是，自动 |

#### 索引设计
1. 文件名唯一索引：
   ```sql
   CREATE UNIQUE INDEX "GalleryPhoto_filename_key" ON "GalleryPhoto"("filename");
   ```
   目的：确保不会重复导入同一张图片

2. 分类和可见性组合索引：
   ```sql
   CREATE INDEX "GalleryPhoto_category_is_visible_idx" ON "GalleryPhoto"("category", "is_visible");
   ```
   目的：优化按分类查询和显示过滤

3. 相册显示索引：
   ```sql
   CREATE INDEX "GalleryPhoto_show_in_albums_idx" ON "GalleryPhoto"("show_in_albums");
   ```
   目的：优化首页相册查询

### 1.2 支持的图片分类
- Meetings：会议照片
- Graduation：毕业照片
- Team Building：团建活动
- Sports：运动照片
- Lab Life：实验室生活
- Competition：比赛照片

## 2. 文件结构

### 2.1 数据库迁移文件
位置：`prisma/migrations/`
- `20250419090000_add_gallery_photo/`：创建基础表结构
- `20250419090001_add_albums_fields/`：添加相册功能字段

### 2.2 数据处理脚本
位置：`scripts/`
- `scan-gallery.ts`：扫描和导入图片信息
- `export-gallery-data.ts`：导出图片数据到 CSV

### 2.3 前端组件
位置：`src/components/`
- `developer/photo/PhotoManager.tsx`：管理界面组件
- `gallery/PhotoGallery.tsx`：展示界面组件

## 3. 功能说明

### 3.1 图片管理
1. 自动扫描：
   - 扫描目录：`public/images/gallery`
   - 根据目录结构自动识别分类
   - 支持格式：jpg, jpeg, png, gif, webp
   - 文件大小限制：10MB

2. 显示控制：
   - 可设置图片在分类中的可见性
   - 可调整图片在分类中的显示顺序
   - 可控制图片是否在首页相册中显示
   - 可调整首页相册中的显示顺序

3. 元数据管理：
   - 可添加图片说明文字
   - 可设置拍摄日期
   - 自动记录创建和更新时间

### 3.2 数据同步
1. 导出功能：
   - 自动导出所有图片信息到 CSV
   - 位置：`prisma/initcsv/GalleryPhoto.csv`
   - 用途：数据备份和迁移

2. 导入功能：
   - 支持从 CSV 导入数据
   - 通过 Prisma seed 自动执行
   - 避免重复导入

## 4. 开发指南

### 4.1 添加新的图片分类
1. 在 `VALID_CATEGORIES` 常量中添加新分类
2. 在 `getCategoryFromPath` 函数中添加路径匹配规则
3. 更新相关的类型定义

### 4.2 修改数据结构
1. 修改 `prisma/schema.prisma` 文件
2. 创建新的迁移：
   ```bash
   pnpx prisma migrate dev --name your_migration_name
   ```
3. 更新相关的类型定义和组件

### 4.3 数据备份和恢复
1. 备份数据：
   ```bash
   pnpm run db:export-gallery
   ```
2. 恢复数据：
   ```bash
   pnpx prisma db seed
   ```

## 5. 注意事项

### 5.1 图片文件管理
- 图片文件应直接存放在 `public/images/gallery` 目录下
- 按分类创建子目录
- 建议使用有意义的文件名
- 建议压缩图片以优化加载速度

### 5.2 性能考虑
- 大量图片时注意分页加载
- 考虑使用图片缓存
- 适当使用图片压缩
- 合理控制每个分类的图片数量

### 5.3 数据安全
- 定期备份数据库和图片文件
- 注意文件权限设置
- 验证上传的文件类型和大小
- 保护图片元数据

## 6. 故障排除

### 6.1 常见问题
1. 图片不显示
   - 检查文件路径是否正确
   - 确认文件权限设置
   - 验证文件是否存在

2. 排序不正确
   - 检查 display_order 值
   - 确认分类是否正确
   - 验证可见性设置

3. 数据导入失败
   - 检查 CSV 文件格式
   - 确认文件编码为 UTF-8
   - 验证数据完整性

### 6.2 调试方法
1. 查看数据库记录
2. 检查文件系统
3. 查看应用日志
4. 使用开发者工具

## 7. 未来改进计划
1. 添加图片批量操作功能
2. 实现图片拖拽排序
3. 添加图片标签功能
4. 优化图片加载性能
5. 添加图片编辑功能 