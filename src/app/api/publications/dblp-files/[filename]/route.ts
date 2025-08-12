import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DBLP_DIR = path.join(process.cwd(), "data", "dblp");

/**
 * 删除指定的 DBLP 文件
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json({ error: "文件名是必需的" }, { status: 400 });
    }

    // 验证文件名（防止路径遍历攻击）
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "无效的文件名" }, { status: 400 });
    }

    // 验证文件类型
    if (!filename.match(/\.txt$/i)) {
      return NextResponse.json(
        { error: "只能删除 .txt 格式的 DBLP 文件" },
        { status: 400 }
      );
    }

    const filePath = path.join(DBLP_DIR, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `文件 "${filename}" 不存在` },
        { status: 404 }
      );
    }

    // 删除文件
    fs.unlinkSync(filePath);

    console.log(`Successfully deleted DBLP file: ${filename}`);

    return NextResponse.json({
      success: true,
      message: `文件 "${filename}" 删除成功`,
    });
  } catch (error) {
    console.error("Error deleting DBLP file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `删除失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
