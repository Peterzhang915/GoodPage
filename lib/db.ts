import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

// 声明全局变量以缓存数据库连接
declare global {
  var dbInstance: Database | null;
}

// 数据库文件路径
const dbPath = path.resolve(process.cwd(), "data/lab.db");

// 成员数据类型定义
export interface Member {
  id: string;
  name_en: string | null;
  name_zh: string;
  title_zh: string | null;
  title_en: string | null;
  bio_zh: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  email: string | null;
  research_interests: string | null;
}

// 获取数据库实例（带缓存）
async function getDb(): Promise<Database> {
  if (global.dbInstance) {
    return global.dbInstance;
  }

  const db = await open<sqlite3.Database, sqlite3.Statement>({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // 在开发环境中缓存实例，避免每次请求都重新连接
  if (process.env.NODE_ENV !== "production") {
    global.dbInstance = db;
  }

  return db;
}

// 获取所有成员
export async function getAllMembers(): Promise<Member[]> {
  const db = await getDb();
  // 选择关键字段用于列表显示
  const members = await db.all<Member[]>(
    "SELECT id, name_zh, name_en, title_zh, title_en, avatar_url FROM members ORDER BY title_zh DESC, name_en ASC",
  );
  return members;
}

// 根据 ID 获取单个成员的完整信息
export async function getMemberById(id: string): Promise<Member | null> {
  const db = await getDb();
  const member = await db.get<Member>("SELECT * FROM members WHERE id = ?", id);
  return member || null; // 如果找不到则返回 null
}
