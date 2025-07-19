/**
 * 图片扫描和导入脚本
 * 
 * 功能：
 * 1. 扫描指定目录下的图片文件
 * 2. 根据目录结构自动识别分类
 * 3. 将图片信息导入数据库
 * 4. 导出数据到 CSV 用于备份和迁移
 * 
 * 使用方法：
 * pnpm run db:scan-gallery
 */

import { PrismaClient } from '@prisma/client';
import { readdir } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

/**
 * 支持的图片分类
 * 注意：添加新分类时需要同时修改：
 * 1. 这个常量定义
 * 2. getCategoryFromPath 函数的匹配规则
 * 3. 相关的类型定义
 */
const VALID_CATEGORIES = [
  'Meetings',    // 会议照片
  'Graduation',  // 毕业照片
  'Team Building', // 团建活动
  'Sports',      // 运动照片
  'Lab Life',    // 实验室生活
  'Competition'  // 比赛照片
] as const;

/**
 * 根据文件路径识别图片分类
 * @param filepath 图片文件的相对路径
 * @returns 识别出的分类名称
 */
function getCategoryFromPath(filepath: string): string {
  if (filepath.includes('Events/groupbuild')) return 'Team Building';
  if (filepath.includes('Events/lab_life') || filepath.includes('Events/lablife')) return 'Lab Life';
  if (filepath.includes('Meetings')) return 'Meetings';
  if (filepath.includes('Graduation')) return 'Graduation';
  if (filepath.includes('Sports')) return 'Sports';
  if (filepath.includes('Competition')) return 'Competition';
  return 'Other';
}

/**
 * 递归扫描目录，查找所有图片文件
 * @param dir 要扫描的目录路径
 * @param baseDir 基准目录，用于计算相对路径
 * @returns 图片文件的相对路径数组
 */
async function scanDirectory(dir: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      const subFiles = await scanDirectory(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * 将图片数据导出到 CSV 文件
 * @param photos 要导出的图片数据数组
 */
async function exportToCSV(photos: any[]) {
  // CSV 文件头
  const csvHeader = 'filename,category,caption,date,is_visible,show_in_albums,display_order,albums_order\n';
  
  // 转换数据为 CSV 行
  const csvRows = photos.map(photo => {
    return [
      photo.filename,
      photo.category,
      photo.caption || '',
      photo.date || '',
      photo.is_visible ? 'true' : 'false',
      photo.show_in_albums ? 'true' : 'false',
      photo.display_order,
      photo.albums_order
    ].map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(',');
  }).join('\n');

  const csvContent = csvHeader + csvRows;

  // 保存到 prisma/initcsv/GalleryPhoto.csv
  const outputDir = path.join(process.cwd(), 'prisma', 'initcsv');
  const outputFile = path.join(outputDir, 'GalleryPhoto.csv');

  // 确保输出目录存在
  await fs.mkdir(outputDir, { recursive: true });

  // 写入文件
  await fs.writeFile(outputFile, csvContent, 'utf-8');
  console.log(`\nGallery 数据已导出到 ${outputFile}`);
}

async function main() {
  try {
    // 1. 检查数据库连接
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error);
      process.exit(1);
    }

    // 2. 扫描图片文件
    const galleryDir = path.join(process.cwd(), 'public', 'images', 'gallery');
    console.log('\n扫描目录:', galleryDir);

    const files = await scanDirectory(galleryDir, galleryDir);
    console.log(`找到 ${files.length} 张图片`);

    // 3. 获取现有记录
    let existingFiles = new Set<string>();
    let existingPhotos: any[] = [];
    try {
      existingPhotos = await prisma.galleryPhoto.findMany();
      existingFiles = new Set(existingPhotos.map(p => p.filename));
    } catch (error) {
      if ((error as any).code !== 'P2021') {
        throw error;
      }
    }

    // 4. 为每个新文件创建数据库记录
    let newCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let allPhotos = [...existingPhotos];

    for (const file of files) {
      const category = getCategoryFromPath(file);
      if (!VALID_CATEGORIES.includes(category as any)) {
        console.log(`跳过无效分类的文件: ${file}`);
        skipCount++;
        continue;
      }

      try {
        // 如果文件已存在，跳过
        if (existingFiles.has(file)) {
          console.log(`文件已存在于数据库中: ${file}`);
          skipCount++;
          continue;
        }

        // 获取当前分类中最大的显示顺序
        let maxOrder = 0;
        try {
          const maxOrderRecord = await prisma.galleryPhoto.findFirst({
            where: { category },
            orderBy: { display_order: 'desc' },
            select: { display_order: true }
          });
          maxOrder = maxOrderRecord?.display_order ?? -1;
        } catch (error) {
          if ((error as any).code !== 'P2021') {
            throw error;
          }
        }

        // 创建新记录
        const newPhoto = await prisma.galleryPhoto.create({
          data: {
            filename: file,
            category,
            is_visible: true,
            show_in_albums: false,
            display_order: maxOrder + 1,
            albums_order: 0
          }
        });
        allPhotos.push(newPhoto);
        console.log(`导入成功: ${file}`);
        newCount++;
      } catch (error) {
        console.error(`导入 ${file} 时出错:`, error);
        errorCount++;
      }
    }

    // 5. 导出所有数据到 CSV
    await exportToCSV(allPhotos);

    // 6. 打印统计信息
    console.log('\n导入统计:');
    console.log(`发现文件总数: ${files.length}`);
    console.log(`新增记录数: ${newCount}`);
    console.log(`跳过文件数: ${skipCount}`);
    console.log(`错误数: ${errorCount}`);

    // 7. 打印分类统计
    const categoryStats = allPhotos.reduce((acc, photo) => {
      acc[photo.category] = (acc[photo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n按分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`${category}: ${count} 张`);
    });

    console.log('\n导入和导出完成');

  } catch (error) {
    console.error('处理失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 