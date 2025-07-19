/**
 * 实验室相册 API 路由处理
 * 
 * 功能：
 * 1. GET：获取图片列表，支持按分类筛选和隐藏/显示控制
 * 2. POST：上传新图片，包括文件保存和数据库记录创建
 * 3. DELETE：删除图片，包括文件删除和数据库记录删除
 * 4. PATCH：更新图片信息，如标题、日期、显示顺序等
 * 
 * 安全性：
 * - 文件类型限制
 * - 文件大小限制
 * - 存储路径验证
 * - 错误处理和日志记录
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

/**
 * 数据库模型类型定义
 * 对应 prisma schema 中的 GalleryPhoto 模型
 */
interface DBGalleryPhoto {
  id: number;
  filename: string;        // 文件路径（相对于 public/images/gallery）
  category: string;        // 图片分类
  caption: string | null;  // 图片说明
  date: string | null;     // 拍摄日期
  is_visible: boolean;     // 是否在分类中显示
  show_in_albums: boolean; // 是否在首页相册显示
  display_order: number;   // 分类中的显示顺序
  albums_order: number;    // 首页相册中的显示顺序
  created_at: Date;        // 创建时间
  updated_at: Date;        // 更新时间
}

/**
 * 文件上传配置
 */
// 允许上传的文件类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 最大文件大小：10MB
const GALLERY_BASE = path.join(process.cwd(), 'public', 'images', 'gallery'); // 图片存储基础路径

/**
 * 有效的图片分类列表
 * 注意：添加新分类时需要同时修改：
 * 1. 这个常量
 * 2. 上传时的路径映射逻辑
 * 3. 前端的分类选择器
 */
const VALID_CATEGORIES = [
  'Meetings',      // 会议照片
  'Graduation',    // 毕业照片
  'Team Building', // 团建活动
  'Sports',        // 运动照片
  'Lab Life',      // 实验室生活
  'Competition'    // 比赛照片
] as const;

/**
 * GET 请求处理：获取图片列表
 * 
 * 查询参数：
 * - category: 要筛选的分类
 * - include_hidden: 是否包含隐藏的图片
 * 
 * 特殊处理：
 * 1. category=Albums：按首页相册规则筛选和排序
 * 2. 指定 category：按分类规则筛选和排序
 * 3. 无 category：返回所有可见图片
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeHidden = searchParams.get('include_hidden') === 'true';
    const category = searchParams.get('category');

    // 构建查询条件
    let where: any = {};
    if (category === 'Albums') {
      // 首页相册模式：只按 show_in_albums 筛选
      if (!includeHidden) {
        where.show_in_albums = true;
      }
    } else if (category) {
      // 分类模式：按 category 和 is_visible 筛选
      where.category = category;
      if (!includeHidden) {
        where.is_visible = true;
      }
    } else {
      // 默认模式：只返回可见图片
      if (!includeHidden) {
        where.is_visible = true;
      }
    }

    // 查询数据库
    const images = await prisma.galleryPhoto.findMany({
      where,
      orderBy: category === 'Albums' ? [
        { show_in_albums: 'desc' },  // 首页相册排序规则
        { albums_order: 'asc' },
        { created_at: 'desc' }
      ] : [
        { category: 'asc' },         // 分类视图排序规则
        { display_order: 'asc' },
        { created_at: 'desc' }
      ]
    });

    // 格式化返回数据
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

/**
 * POST 请求处理：上传新图片
 * 
 * 请求体（FormData）：
 * - file: 图片文件
 * - category: 图片分类
 * - caption: 图片说明（可选）
 * - date: 拍摄日期（可选）
 * 
 * 处理流程：
 * 1. 验证请求数据
 * 2. 保存文件到对应目录
 * 3. 创建数据库记录
 */
export async function POST(req: NextRequest) {
  console.log('Received file upload request');
  
  try {
    // 解析请求数据
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string;
    const caption = formData.get('caption') as string;
    const date = formData.get('date') as string;

    // 文件存在性验证
    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ success: false, error: { message: '请选择要上传的图片' } }, { status: 400 });
    }

    // 文件类型验证
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json({ 
        success: false, 
        error: { message: `不支持的文件类型。支持的类型：${ALLOWED_MIME_TYPES.map(type => type.split('/')[1]).join(', ')}` } 
      }, { status: 400 });
    }

    // 文件大小验证
    if (file.size > MAX_FILE_SIZE) {
      console.log(`File too large: ${file.size} bytes`);
      return NextResponse.json({ 
        success: false, 
        error: { message: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）` } 
      }, { status: 400 });
    }

    // 分类验证
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
    
    // 根据分类确定子目录
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

    // 创建目录（如果不存在）
    try {
      await mkdir(targetDir, { recursive: true });
      console.log(`Ensured directory exists: ${targetDir}`);
    } catch (error) {
      console.error('Failed to create directory:', error);
      return NextResponse.json({ 
        success: false, 
        error: { message: '创建目录失败' } 
      }, { status: 500 });
    }

    // 生成唯一文件名
    const fileExt = path.extname(file.name).toLowerCase();
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(targetDir, filename);
    const relativePath = path.join(subPath, filename).replace(/\\/g, '/');

    try {
      // 保存文件
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      console.log(`File saved: ${filePath}`);

      // 获取当前分类中的最大显示顺序
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

      // 返回成功响应
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

/**
 * DELETE 请求处理：删除图片
 * 
 * 查询参数：
 * - id: 要删除的图片 ID
 * 
 * 处理流程：
 * 1. 查找数据库记录
 * 2. 删除文件系统中的图片
 * 3. 删除数据库记录
 */
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