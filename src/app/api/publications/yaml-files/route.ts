import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const YAML_DIR = path.join(process.cwd(), 'data', 'yaml');

/**
 * 获取所有可用的 YAML 文件列表
 */
export async function GET() {
  try {
    // 确保目录存在
    if (!fs.existsSync(YAML_DIR)) {
      fs.mkdirSync(YAML_DIR, { recursive: true });
    }

    // 读取目录中的所有 .yml 和 .yaml 文件
    const files = fs.readdirSync(YAML_DIR)
      .filter(file => /\.(yml|yaml)$/i.test(file))
      .map(fileName => {
        const filePath = path.join(YAML_DIR, fileName);
        const stats = fs.statSync(filePath);
        
        return {
          name: fileName,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          path: `/data/yaml/${fileName}`
        };
      })
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return NextResponse.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error("Error reading YAML files:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to read YAML files: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 上传新的 YAML 文件
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.name.match(/\.(yml|yaml)$/i)) {
      return NextResponse.json(
        { error: "Only .yml and .yaml files are allowed" },
        { status: 400 }
      );
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // 确保目录存在
    if (!fs.existsSync(YAML_DIR)) {
      fs.mkdirSync(YAML_DIR, { recursive: true });
    }

    // 检查文件是否已存在
    const filePath = path.join(YAML_DIR, file.name);
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File "${file.name}" already exists` },
        { status: 409 }
      );
    }

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    console.log(`Successfully uploaded YAML file: ${file.name}`);

    return NextResponse.json({
      success: true,
      message: `File "${file.name}" uploaded successfully`,
      data: {
        name: file.name,
        size: file.size,
        path: `/data/yaml/${file.name}`
      }
    });

  } catch (error) {
    console.error("Error uploading YAML file:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload file: ${errorMessage}` },
      { status: 500 }
    );
  }
}
