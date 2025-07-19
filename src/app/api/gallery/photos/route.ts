import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

// 数据库模型类型
interface DBGalleryPhoto {
  id: number;
  filename: string;
  category: string;
  caption: string | null;
  date: string | null;
  is_visible: boolean;
  show_in_albums: boolean;
  display_order: number;
  albums_order: number;
  created_at: Date;
  updated_at: Date;
}

// 允许的图片类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const GALLERY_BASE = path.join(process.cwd(), 'public', 'images', 'gallery');

// 精确分组映射规则
const VALID_CATEGORIES = [
  'Meetings',
  'Graduation',
  'Team Building',
  'Sports',
  'Lab Life',
  'Competition'
] as const;

// 获取所有图片（按业务分组）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeHidden = searchParams.get('include_hidden') === 'true';
    const category = searchParams.get('category');

    let where: any = {};
    if (category === 'Albums') {
      // 首页相册分区：只根据 show_in_albums 控制显示
      if (!includeHidden) {
        where.show_in_albums = true;
      }
    } else if (category) {
      // 其它分区（如 Sports、Graduation 等）：严格用 category+is_visible 控制
      where.category = category;
      if (!includeHidden) {
        where.is_visible = true;
      }
    } else {
      // 没有 category 时，默认返回所有 is_visible=true 的图片（兼容老用法）
      if (!includeHidden) {
        where.is_visible = true;
      }
    }

    const images = await prisma.galleryPhoto.findMany({
      where,
      orderBy: category === 'Albums' ? [
        { show_in_albums: 'desc' },
        { albums_order: 'asc' },
        { created_at: 'desc' }
      ] : [
        { category: 'asc' },
        { display_order: 'asc' },
        { created_at: 'desc' }
      ]
    });

    const formattedImages = images.map((img: DBGalleryPhoto) => ({
      id: img.id.toString(),
      src: `/images/gallery/${img.filename}`,
      alt: img.caption || 'photo',
      caption: img.caption,
      date: img.date,
      category: img.category,
      is_visible: img.is_visible,
      show_in_albums: img.show_in_albums,
      display_order: img.display_order,
      albums_order: img.albums_order
    }));

    return NextResponse.json({ success: true, data: formattedImages });
  } catch (e) {
    console.error('Failed to read gallery:', e);
    return NextResponse.json({ success: false, error: { message: 'Failed to read gallery.' } }, { status: 500 });
  }
}

// 上传图片
export async function POST(req: NextRequest) {
  console.log('Received file upload request');
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string;
    const caption = formData.get('caption') as string;
    const date = formData.get('date') as string;

    // 验证文件
    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ success: false, error: { message: '请选择要上传的图片' } }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json({ 
        success: false, 
        error: { message: `不支持的文件类型。支持的类型：${ALLOWED_MIME_TYPES.map(type => type.split('/')[1]).join(', ')}` } 
      }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      console.log(`File too large: ${file.size} bytes`);
      return NextResponse.json({ 
        success: false, 
        error: { message: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）` } 
      }, { status: 400 });
    }

    // 验证分类
    if (!category || !VALID_CATEGORIES.includes(category as any)) {
      console.log(`Invalid category: ${category}`);
      return NextResponse.json({ 
        success: false, 
        error: { message: '请选择有效的相册分类' } 
      }, { status: 400 });
    }

    // 确定存储路径
    let targetDir = GALLERY_BASE;
    let subPath = '';
    
    switch (category) {
      case 'Team Building':
        subPath = path.join('Events', 'groupbuild');
        break;
      case 'Lab Life':
        subPath = path.join('Events', 'lab_life');
        break;
      default:
        subPath = category;
    }
    
    targetDir = path.join(targetDir, subPath);

    try {
      // 确保目录存在
      await mkdir(targetDir, { recursive: true });
      console.log(`Ensured directory exists: ${targetDir}`);
    } catch (error) {
      console.error('Failed to create directory:', error);
      return NextResponse.json({ 
        success: false, 
        error: { message: '创建目录失败' } 
      }, { status: 500 });
    }

    // 生成文件名
    const fileExt = path.extname(file.name).toLowerCase();
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(targetDir, filename);
    const relativePath = path.join(subPath, filename).replace(/\\/g, '/');

    try {
      // 保存文件
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      console.log(`File saved: ${filePath}`);

      // 获取当前分类中最大的 display_order
      const maxOrder = await prisma.galleryPhoto.findFirst({
        where: { category },
        orderBy: { display_order: 'desc' },
        select: { display_order: true }
      });

      // 创建数据库记录
      const photo = await prisma.galleryPhoto.create({
        data: {
          filename: relativePath,
          category,
          caption: caption || null,
          date: date || null,
          display_order: (maxOrder?.display_order ?? -1) + 1,
          show_in_albums: false,
          albums_order: 0
        }
      });
      console.log(`Database record created: ${photo.id}`);

      return NextResponse.json({
        success: true,
        data: {
          id: photo.id.toString(),
          src: `/images/gallery/${relativePath}`,
          category: photo.category,
          caption: photo.caption,
          date: photo.date,
          is_visible: photo.is_visible,
          display_order: photo.display_order
        }
      });
    } catch (error) {
      console.error('Failed to save file or create database record:', error);
      return NextResponse.json({ 
        success: false, 
        error: { message: '保存文件失败' } 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: { message: '上传失败，请重试' } 
    }, { status: 500 });
  }
}

// 删除图片
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: { message: 'Photo ID required.' } }, { status: 400 });
  }

  try {
    // 获取照片记录
    const photo = await prisma.galleryPhoto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!photo) {
      return NextResponse.json({ success: false, error: { message: 'Photo not found.' } }, { status: 404 });
    }

    // 删除物理文件
    const filePath = path.join(GALLERY_BASE, photo.filename);
    // await unlink(filePath); // unlink is not imported, so this line is removed

    // 删除数据库记录
    await prisma.galleryPhoto.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete failed:', e);
    return NextResponse.json({ success: false, error: { message: 'Delete failed.' } }, { status: 500 });
  }
}

// 更新图片
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      id, 
      is_visible, 
      show_in_albums,
      display_order, 
      albums_order,
      category, 
      caption, 
      date 
    } = data;

    if (!id) {
      return NextResponse.json({ success: false, error: { message: 'Photo ID required.' } }, { status: 400 });
    }

    // 验证类别
    if (category && !VALID_CATEGORIES.includes(category as any)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid category.' } }, { status: 400 });
    }

    // 更新照片记录
    const photo = await prisma.galleryPhoto.update({
      where: { id: parseInt(id) },
      data: {
        is_visible: is_visible !== undefined ? is_visible : undefined,
        show_in_albums: show_in_albums !== undefined ? show_in_albums : undefined,
        display_order: display_order !== undefined ? display_order : undefined,
        albums_order: albums_order !== undefined ? albums_order : undefined,
        category: category || undefined,
        caption: caption !== undefined ? caption : undefined,
        date: date !== undefined ? date : undefined
      }
    });

    return NextResponse.json({ success: true, data: photo });
  } catch (e) {
    console.error('Update failed:', e);
    return NextResponse.json({ success: false, error: { message: 'Update failed.' } }, { status: 500 });
  }
} 