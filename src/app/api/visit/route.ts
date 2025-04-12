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
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY NOT NULL, -- Removed AUTOINCREMENT for specific IDs
      count INTEGER NOT NULL DEFAULT 0
    );
  `);

  // 检查并初始化 ID=1 (total) - 保持为 0
  let row = await db.get('SELECT count FROM visits WHERE id = 1');
  if (!row) {
    await db.run('INSERT INTO visits (id, count) VALUES (?, ?)', 1, 0);
    console.log('Initialized total visit count (ID 1) to 0');
  }
  // 检查并初始化 ID=2 (developer) - 设置初始值为 1
  row = await db.get('SELECT count FROM visits WHERE id = 2');
  if (!row) {
    await db.run('INSERT INTO visits (id, count) VALUES (?, ?)', 2, 1); // Set initial count to 1
    console.log('Initialized developer visit count (ID 2) to 1');
  }

  dbInstance = db;
  return db;
}

export async function GET() {
  try {
    const db = await getDb();
    // 使用 await 获取语句，并 await get() 的结果
    const totalStmt = await db.prepare('SELECT count FROM visits WHERE id = 1');
    const devStmt = await db.prepare('SELECT count FROM visits WHERE id = 2');
    const totalRow = await totalStmt.get(); // await the get() call
    const devRow = await devStmt.get();     // await the get() call
    const totalCount = totalRow?.count ?? 0;
    const devCount = devRow?.count ?? 0;

    // 清理语句资源 (可选但推荐)
    await totalStmt.finalize();
    await devStmt.finalize();

    return NextResponse.json({ total: totalCount, developer: devCount });
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch visit counts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');

    // **总是增加总访问次数**
    const incrementTotalStmt = await db.prepare('UPDATE visits SET count = count + 1 WHERE id = 1');
    await incrementTotalStmt.run();
    await incrementTotalStmt.finalize();

    // 如果是开发者访问，额外增加开发者访问次数
    if (source === 'developer') {
      const incrementDevStmt = await db.prepare('UPDATE visits SET count = count + 1 WHERE id = 2');
      await incrementDevStmt.run();
      await incrementDevStmt.finalize();
      console.log('Incremented developer and total visits.');
    } else {
      console.log('Incremented total visits.');
    }
    
    // 返回最新的计数值
    const totalStmt = await db.prepare('SELECT count FROM visits WHERE id = 1');
    const devStmt = await db.prepare('SELECT count FROM visits WHERE id = 2');
    const totalRow = await totalStmt.get();
    const devRow = await devStmt.get();
    const totalCount = totalRow?.count ?? 0;
    const devCount = devRow?.count ?? 0;

    await totalStmt.finalize();
    await devStmt.finalize();

    return NextResponse.json({ total: totalCount, developer: devCount }, { status: 200 });

  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: 'Failed to update visit counts' }, { status: 500 });
  }
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(_request: Request) {
    return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}