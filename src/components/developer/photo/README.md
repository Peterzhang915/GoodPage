# 相册管理组件模块

这是一个经过重构的相册管理组件模块，采用了现代前端项目的最佳实践，具有清晰的结构和良好的可维护性。

## 📁 文件结构

```
src/components/developer/photo/
├── PhotoManager.tsx              # 原始组件（保留）
├── PhotoManager.tsx    # 重构后的主组件
├── index.ts                      # 模块导出文件
├── README.md                     # 文档说明
├── types/
│   └── index.ts                 # TypeScript 类型定义
├── constants/
│   └── index.ts                 # 常量和配置
├── services/
│   └── photoApi.ts              # API 服务层
├── hooks/
│   ├── usePhotoManager.ts       # 主要业务逻辑 Hook
│   ├── usePhotoUpload.ts        # 上传功能 Hook
│   └── usePhotoOperations.ts    # 图片操作 Hook
├── components/
│   ├── PhotoCard.tsx            # 图片卡片组件
│   ├── UploadArea.tsx           # 上传区域组件
│   ├── CategorySelector.tsx     # 分类选择器组件
│   └── PhotoGrid.tsx            # 图片网格组件
└── utils/
    └── index.ts                 # 工具函数
```

## 🚀 主要特性

### 1. 模块化设计

- **组件分离**：将大型组件拆分为多个小型、专注的组件
- **逻辑分离**：使用自定义 Hooks 管理状态和业务逻辑
- **服务分离**：API 调用逻辑独立到服务层

### 2. 类型安全

- **完整的 TypeScript 支持**：所有组件和函数都有完整的类型定义
- **接口规范**：清晰的接口定义，便于开发和维护

### 3. 可重用性

- **独立组件**：每个组件都可以独立使用
- **通用 Hooks**：业务逻辑可以在不同组件间复用
- **工具函数**：提供通用的工具函数库

### 4. 可维护性

- **单一职责**：每个文件都有明确的职责
- **清晰的依赖关系**：模块间的依赖关系清晰明确
- **统一的代码风格**：遵循一致的编码规范

## 📖 使用指南

### 基本使用

```tsx
import { PhotoManager } from "@/components/developer/photo";

function App() {
  return <PhotoManager onClose={() => console.log("关闭")} />;
}
```

### 使用单独的组件

```tsx
import {
  PhotoCard,
  UploadArea,
  CategorySelector,
} from "@/components/developer/photo";

function CustomPhotoManager() {
  return (
    <div>
      <CategorySelector value="Albums" onChange={setCategory} />
      <UploadArea category="Albums" onUploadComplete={refresh} />
      {/* 其他组件 */}
    </div>
  );
}
```

### 使用 Hooks

```tsx
import { usePhotoManager, usePhotoUpload } from "@/components/developer/photo";

function CustomComponent() {
  const { photos, loading, error } = usePhotoManager();
  const { uploadPhoto, uploading } = usePhotoUpload({
    category: "Albums",
    onUploadSuccess: () => console.log("上传成功"),
  });

  // 自定义逻辑
}
```

### 使用 API 服务

```tsx
import { photoApi } from "@/components/developer/photo";

async function handleCustomOperation() {
  try {
    const photos = await photoApi.getPhotos("Albums");
    console.log("获取到的照片:", photos);
  } catch (error) {
    console.error("获取失败:", error);
  }
}
```

## 🔧 API 参考

### 主要组件

#### PhotoManager

重构后的主组件，提供完整的相册管理功能。

**Props:**

- `onClose: () => void` - 关闭回调函数

#### PhotoCard

单张图片的卡片组件。

**Props:**

- `photo: GalleryImage` - 图片数据
- `onDelete: (photo: GalleryImage) => void` - 删除回调
- `onToggleVisibility: (photo: GalleryImage) => void` - 可见性切换回调
- `onOrderChange: (photo: GalleryImage, newOrder: number) => void` - 顺序变更回调
- `onUpdateMetadata: (photo: GalleryImage, caption: string | null, date: string | null) => void` - 元数据更新回调
- `isAlbumsView?: boolean` - 是否为相册视图

### 主要 Hooks

#### usePhotoManager()

主要的业务逻辑 Hook，管理图片列表和基本状态。

**返回值:**

- `category: Category` - 当前分类
- `photos: GalleryImage[]` - 图片列表
- `loading: boolean` - 加载状态
- `error: string | null` - 错误信息
- `setCategory: (category: Category) => void` - 设置分类
- `refreshPhotos: () => void` - 刷新图片列表

#### usePhotoUpload(options)

图片上传功能 Hook。

**参数:**

- `category: Category` - 当前分类
- `onUploadSuccess?: () => void` - 上传成功回调
- `onError?: (error: string) => void` - 错误回调

**返回值:**

- `uploading: boolean` - 上传状态
- `file: File | null` - 当前文件
- `uploadPhoto: () => Promise<void>` - 执行上传

### API 服务

#### photoApi

提供所有图片相关的 API 调用方法。

**主要方法:**

- `getPhotos(category, includeHidden)` - 获取图片列表
- `uploadPhoto(uploadData)` - 上传图片
- `deletePhoto(photoId)` - 删除图片
- `updatePhoto(updateData)` - 更新图片信息

## 🎯 设计原则

### 1. 单一职责原则

每个组件和函数都有明确的单一职责，便于理解和维护。

### 2. 开放封闭原则

组件对扩展开放，对修改封闭。可以通过组合和配置来扩展功能。

### 3. 依赖倒置原则

高层模块不依赖低层模块，都依赖于抽象接口。

### 4. 组合优于继承

通过组合小型组件来构建复杂功能，而不是使用继承。

## 🔄 迁移指南

### 从原始组件迁移

1. **替换导入**：

   ```tsx
   // 原来
   import PhotoManager from "./PhotoManager";

   // 现在
   import { PhotoManager as PhotoManager } from "./index";
   ```

2. **API 保持兼容**：
   重构后的组件保持了与原组件相同的 API，可以直接替换。

3. **渐进式迁移**：
   可以逐步使用新的子组件和 Hooks 来替换原有逻辑。

## 🧪 测试建议

### 单元测试

- 为每个 Hook 编写单元测试
- 为工具函数编写测试用例
- 为 API 服务编写模拟测试

### 集成测试

- 测试组件间的交互
- 测试完整的用户流程

### 示例测试文件结构

```
__tests__/
├── hooks/
│   ├── usePhotoManager.test.ts
│   ├── usePhotoUpload.test.ts
│   └── usePhotoOperations.test.ts
├── components/
│   ├── PhotoCard.test.tsx
│   └── UploadArea.test.tsx
├── services/
│   └── photoApi.test.ts
└── utils/
    └── index.test.ts
```

## 📝 贡献指南

1. **代码风格**：遵循项目的 ESLint 和 Prettier 配置
2. **类型定义**：为所有新增的接口和函数添加完整的类型定义
3. **文档更新**：更新相关的文档和注释
4. **测试覆盖**：为新功能添加相应的测试用例

## 🔗 相关资源

- [React Hooks 官方文档](https://reactjs.org/docs/hooks-intro.html)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [项目编码规范](../../../docs/coding-standards.md)
