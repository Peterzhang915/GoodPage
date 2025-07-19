import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. 检查数据库连接
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }

    // 2. 获取所有图片数据
    const photos = await prisma.galleryPhoto.findMany({
      orderBy: [
        { category: 'asc' },
        { display_order: 'asc' }
      ]
    });

    console.log(`Found ${photos.length} photos in database`);

    // 3. 将数据转换为 CSV 格式
    const csvHeader = 'filename,category,caption,date,is_visible,show_in_albums,display_order,albums_order\n';
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

    // 4. 保存到 prisma/initcsv/GalleryPhoto.csv
    const outputDir = path.join(process.cwd(), 'prisma', 'initcsv');
    const outputFile = path.join(outputDir, 'GalleryPhoto.csv');

    // 确保目录存在
    await fs.mkdir(outputDir, { recursive: true });

    // 写入文件
    await fs.writeFile(outputFile, csvContent, 'utf-8');
    console.log(`Data exported to ${outputFile}`);

    // 5. 打印统计信息
    const categoryStats = photos.reduce((acc, photo) => {
      acc[photo.category] = (acc[photo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\nCategory Statistics:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`${category}: ${count} photos`);
    });

  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 