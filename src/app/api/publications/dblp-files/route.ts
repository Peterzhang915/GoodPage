import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DBLP_DIR = path.join(process.cwd(), "data", "dblp");

/**
 * 获取所有可用的 DBLP 文件列表
 */
export async function GET() {
  try {
    // 确保目录存在
    if (!fs.existsSync(DBLP_DIR)) {
      fs.mkdirSync(DBLP_DIR, { recursive: true });
    }

    // 读取目录中的所有 .txt 文件
    const files = fs
      .readdirSync(DBLP_DIR)
      .filter((file) => /\.txt$/i.test(file))
      .map((fileName) => {
        const filePath = path.join(DBLP_DIR, fileName);
        const stats = fs.statSync(filePath);

        return {
          name: fileName,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          path: `/data/dblp/${fileName}`,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
      );

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error loading DBLP files:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to load DBLP files: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 上传新的 DBLP 文件
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    // 验证文件类型
    if (!file.name.match(/\.txt$/i)) {
      return NextResponse.json(
        { error: "只允许 .txt 格式的 DBLP 输出文件" },
        { status: 400 }
      );
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件大小必须小于 10MB" },
        { status: 400 }
      );
    }

    // 确保目录存在
    if (!fs.existsSync(DBLP_DIR)) {
      fs.mkdirSync(DBLP_DIR, { recursive: true });
    }

    // 检查文件是否已存在
    const filePath = path.join(DBLP_DIR, file.name);
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `文件 "${file.name}" 已存在` },
        { status: 409 }
      );
    }

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    console.log(`Successfully uploaded DBLP file: ${file.name}`);

    return NextResponse.json({
      success: true,
      message: `文件 "${file.name}" 上传成功`,
      data: {
        name: file.name,
        size: file.size,
        path: `/data/dblp/${file.name}`,
      },
    });
  } catch (error) {
    console.error("Error uploading DBLP file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `上传失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
