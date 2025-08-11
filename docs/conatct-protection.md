# 邮箱地址保护功能

## 概述

为了防止网络爬虫批量收集我们的邮箱地址，我们实现了 `ObfuscatedContact` 组件来保护所有公开页面上的联系方式。

## 功能特性

1. **防爬虫保护**：服务端渲染时不会在 HTML 中直接暴露邮箱地址
2. **用户友好**：显示"点击查看邮箱"等友好提示文本
3. **一键复制**：支持快速复制真实地址到剪贴板
4. **交互式显示**：点击后可显示/隐藏真实地址

## 使用方法

```tsx
import ObfuscatedContact from "@/components/common/ObfuscatedContact";

// 邮箱保护
<ObfuscatedContact value="user@example.com" type="email" />

// 电话保护
<ObfuscatedContact value="(0791) 8396 8516" type="phone" />
```

## 应用范围

目前已应用于以下页面：

- ✅ Lab Chair 页面的联系邮箱
- ✅ Professor 页面的联系邮箱  
- ✅ Members 页面中所有成员的邮箱地址
- ✅ Contact 页面的联系方式
- ❌ 开发者界面（内部管理，无需保护）

## 工作原理

1. **服务端渲染**：显示友好的占位符文本（如："点击查看邮箱"）
2. **客户端挂载**：添加交互功能（点击显示、复制按钮）
3. **用户交互**：点击后动态显示真实地址
4. **防爬虫**：静态 HTML 中不包含真实邮箱地址

## 技术实现

- 使用 React 的 `useState` 和 `useEffect` 管理状态
- 客户端组件（"use client"）确保交互功能正常
- 服务端渲染时显示安全的占位符
- 支持深色模式和响应式设计

## 维护说明

- 所有新增的邮箱显示都应使用 `ObfuscatedContact` 组件
- 开发者界面可以直接显示邮箱（内部使用）
- 组件支持自定义样式类名，便于集成到不同设计中
