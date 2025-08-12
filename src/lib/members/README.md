# Members 模块

这个目录包含了成员相关的所有功能，已从原来的单个 `members.ts` 文件解耦为多个模块。

## 文件结构

### `index.ts`
统一导出文件，保持向后兼容性。所有其他文件仍然可以通过 `@/lib/members` 导入所有函数。

### `utils.ts`
成员状态计算相关的工具函数：
- `calculateMemberGradeStatus()` - 计算成员显示状态字符串
- `calculateGraduationStatus()` - 计算成员是否已毕业
- `EducationFormData` - Education 表单数据类型定义

### `queries.ts`
成员数据查询函数：
- `getAllMembersGrouped()` - 获取所有公开成员信息，用于成员列表页
- `getMemberProfileData()` - 根据 ID 获取单个成员的完整档案信息
- `getAllMembersForManager()` - 获取所有成员信息，用于管理列表

### `education.ts`
Education CRUD 操作函数：
- `getEducationRecordById()` - 根据 ID 获取单个教育记录
- `createEducationRecord()` - 为成员创建新的教育记录
- `updateEducationRecord()` - 更新现有的教育记录
- `deleteEducationRecord()` - 根据 ID 删除教育记录

## 使用方式

由于有 `index.ts` 文件重新导出所有函数，现有的导入方式保持不变：

```typescript
import { 
  getAllMembersGrouped, 
  getMemberProfileData, 
  calculateMemberGradeStatus 
} from "@/lib/members";
```

## 优势

1. **职责分离**: 每个文件都有明确的职责
2. **易于维护**: 单个文件长度合理，便于阅读和修改
3. **向后兼容**: 不影响现有代码的导入路径
4. **可扩展性**: 新功能可以添加到相应的模块中
