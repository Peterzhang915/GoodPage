const { PrismaClient } = require('@prisma/client');
const { readdir } = require('fs/promises');
const path = require('path');
const fs = require('fs/promises');

const prisma = new PrismaClient();

// 支持的分类
const VALID_CATEGORIES = [
  'Meetings',
  'Graduation',
  'Team Building',
  'Sports',
  'Lab Life',
  'Competition'
] as const;

// 获取分类
function getCategoryFromPath(filepath: string): string {
  if (filepath.includes('Events/groupbuild')) return 'Team Building';
  if (filepath.includes('Events/lab_life') || filepath.includes('Events/lablife')) return 'Lab Life';
  if (filepath.includes('Meetings')) return 'Meetings';
  if (filepath.includes('Graduation')) return 'Graduation';
  if (filepath.includes('Sports')) return 'Sports';
  if (filepath.includes('Competition')) return 'Competition';
  return 'Other';
}

// 递归扫描目录
async function scanDirectory(dir: string, baseDir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
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

// 导出数据到 CSV
async function exportToCSV(photos: any[]) {
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

  // 保存到 prisma/initcsv/GalleryPhoto.csv
  const outputDir = path.join(process.cwd(), 'prisma', 'initcsv');
  const outputFile = path.join(outputDir, 'GalleryPhoto.csv');

  // 确保目录存在
  await fs.mkdir(outputDir, { recursive: true });

  // 写入文件
  await fs.writeFile(outputFile, csvContent, 'utf-8');
  console.log(`\nGallery data exported to ${outputFile}`);
}

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

    // 2. 扫描图片文件
    const galleryDir = path.join(process.cwd(), 'public', 'images', 'gallery');
    console.log('\nScanning directory:', galleryDir);

    const files = await scanDirectory(galleryDir, galleryDir);
    console.log(`Found ${files.length} images`);

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
        console.log(`Skipping file with invalid category: ${file}`);
        skipCount++;
        continue;
      }

      try {
        // 如果文件已存在于数据库中，跳过
        if (existingFiles.has(file)) {
          console.log(`File already exists in database: ${file}`);
          skipCount++;
          continue;
        }

        // 获取当前分类中最大的 display_order
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
        console.log(`Imported: ${file}`);
        newCount++;
      } catch (error) {
        console.error(`Error importing ${file}:`, error);
        errorCount++;
      }
    }

    // 5. 导出所有数据到 CSV
    await exportToCSV(allPhotos);

    // 6. 打印统计信息
    console.log('\nImport Summary:');
    console.log(`Total files found: ${files.length}`);
    console.log(`New records created: ${newCount}`);
    console.log(`Files skipped: ${skipCount}`);
    console.log(`Errors encountered: ${errorCount}`);

    // 7. 打印分类统计
    const categoryStats = allPhotos.reduce((acc, photo) => {
      acc[photo.category] = (acc[photo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\nPhotos by category:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`${category}: ${count} photos`);
    });

    console.log('\nImport and export completed successfully');

  } catch (error) {
    console.error('Process failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 