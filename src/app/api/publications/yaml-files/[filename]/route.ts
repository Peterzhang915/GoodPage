import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const YAML_DIR = path.join(process.cwd(), "data", "yaml");

/**
 * 删除指定的 YAML 文件
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // 验证文件名（防止路径遍历攻击）
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // 验证文件类型
    if (!filename.match(/\.(yml|yaml)$/i)) {
      return NextResponse.json(
        { error: "Only .yml and .yaml files can be deleted" },
        { status: 400 }
      );
    }

    const filePath = path.join(YAML_DIR, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File "${filename}" not found` },
        { status: 404 }
      );
    }

    // 删除文件
    fs.unlinkSync(filePath);

    console.log(`Successfully deleted YAML file: ${filename}`);

    return NextResponse.json({
      success: true,
      message: `File "${filename}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting YAML file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete file: ${errorMessage}` },
      { status: 500 }
    );
  }
}
