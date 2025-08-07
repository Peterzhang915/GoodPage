import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'dblp', 'professors.json');

/**
 * 获取教授配置
 */
export async function GET() {
  try {
    // 确保目录存在
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 默认配置
    const defaultConfig = {
      professors: ['Jiahui Hu', 'Zichen Xu 0001']
    };

    // 读取配置文件
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(configData);
      return NextResponse.json({
        success: true,
        data: config
      });
    } else {
      // 创建默认配置文件
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      return NextResponse.json({
        success: true,
        data: defaultConfig
      });
    }
  } catch (error) {
    console.error("Error reading professors config:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to read professors config: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 更新教授配置
 */
export async function POST(request: NextRequest) {
  try {
    const { professors } = await request.json();

    if (!Array.isArray(professors)) {
      return NextResponse.json(
        { error: "Professors must be an array" },
        { status: 400 }
      );
    }

    // 验证教授名称格式
    const validProfessors = professors.filter(prof => 
      typeof prof === 'string' && prof.trim().length > 0
    );

    if (validProfessors.length === 0) {
      return NextResponse.json(
        { error: "At least one valid professor name is required" },
        { status: 400 }
      );
    }

    // 确保目录存在
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 保存配置
    const config = {
      professors: validProfessors,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');

    console.log(`Updated professors config with ${validProfessors.length} professors`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${validProfessors.length} professors`,
      data: config
    });

  } catch (error) {
    console.error("Error updating professors config:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update professors config: ${errorMessage}` },
      { status: 500 }
    );
  }
}
