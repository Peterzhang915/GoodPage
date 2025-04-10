import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// 数据库文件路径（相对于项目根目录）
const DB_PATH = path.join(process.cwd(), 'visits.db');

// 全局数据库连接实例（惰性初始化）
let dbInstance: Awaited<ReturnType<typeof open>> | null = null;

async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }
  // 如果实例不存在，打开数据库连接
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  // 检查表是否存在，如果不存在则创建
  await db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);

  // 检查是否已有计数记录，如果没有则插入初始值 0
  const existingCount = await db.get('SELECT count FROM visits WHERE id = 1');
  if (!existingCount) {
    await db.run('INSERT INTO visits (id, count) VALUES (?, ?)', 1, 0);
  }

  dbInstance = db; // 缓存实例
  return db;
}

export async function GET(request: Request) {
  try {
    const db = await getDb();

    // 原子性地增加计数值
    await db.run('UPDATE visits SET count = count + 1 WHERE id = 1');

    // 获取更新后的计数值
    const result = await db.get('SELECT count FROM visits WHERE id = 1');
    const visitCount = result?.count ?? 0;

    // 返回 JSON 响应
    return NextResponse.json({ count: visitCount }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process visit count' }, { status: 500 });
  }
  // 注意：在 serverless 环境中，数据库连接管理可能需要更细致的处理，
  // 例如在函数执行完毕后关闭连接，或者使用连接池。
  // 但对于简单场景和本地部署，缓存实例通常可行。
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: Request) {
    return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}