// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// 使用一个本地模块作用域的变量来缓存 PrismaClient 实例
let prismaInstance: PrismaClient | null = null;

// 创建新 PrismaClient 实例的辅助函数
const createPrismaClient = () => {
  console.log('初始化一个新的 PrismaClient 实例...'); // 添加日志，方便观察实例化时机
  return new PrismaClient({
    // --- 日志配置 (可选) ---
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error'] // 开发环境打印详细日志
        : ['error'],                         // 生产环境只打印错误日志
  });
};

// --- 获取或创建 PrismaClient 单例 ---
// 这种方法比修改 global 更受推荐
const prisma = prismaInstance ?? createPrismaClient();

// 在非生产环境下，将创建的实例缓存到本地变量中
// 这样在开发模式的热重载中，可以重用同一个实例
if (process.env.NODE_ENV !== 'production') {
    if (!prismaInstance) {
        prismaInstance = prisma;
    }
}

// 默认导出 PrismaClient 的单例实例
export default prisma;

// (可选) 重新导出所有 Prisma 生成的类型，方便从一处导入
// 这样其他文件可以写 import type { Member, Publication } from '@/lib/prisma';
export * from '@prisma/client';