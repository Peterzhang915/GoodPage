import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";
import { parse } from "csv-parse/sync";

// --- 配置路径 ---
const dbPath = path.resolve(process.cwd(), "data/lab.db"); // 数据库文件路径
const dbDir = path.dirname(dbPath); // 数据库所在目录
const membersCsvPath = path.resolve(process.cwd(), "data/member.csv"); // 成员 CSV 文件路径 (应包含新字段)
const publicationCsvPath = path.resolve(process.cwd(), "data/publication.csv"); // 出版物 CSV 文件路径

// --- 确保数据目录存在 ---
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`创建目录: ${dbDir}`);
}

// --- 读取数据函数 ---
function readCsvData(filePath, required = true) {
  try {
    if (!fs.existsSync(filePath)) {
      if (required) {
        console.error(`错误: 必需的 CSV 文件未找到: ${filePath}`);
        process.exit(1);
      } else {
        console.warn(`警告: 文件未找到，跳过: ${filePath}`);
        return [];
      }
    }
    const csvString = fs.readFileSync(filePath, "utf8");
    const data = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    });
    console.log(`成功读取 ${data.length} 条数据从 ${path.basename(filePath)}`);
    return data;
  } catch (err) {
    console.error(`读取 ${filePath} 时出错: ${err.message}`);
    if (required) process.exit(1);
    return [];
  }
}

// --- 读取必要数据 ---
// 假设 member.csv 现在包含了所有新字段的列，即使大部分值为空
const membersData = readCsvData(membersCsvPath, true);
const publicationsData = readCsvData(publicationCsvPath, true);

// --- !!! 警告：随机生成作者用于测试，必须替换 !!! ---
console.warn("!!! 警告：正在为出版物随机生成作者信息，仅用于【测试目的】 !!!");
console.warn(
  "!!! 真实应用前【必须】修改此脚本以解析 publication.csv 中的真实作者信息 !!!",
);
let papers = []; // 用于存储带有合成作者信息的论文
if (publicationsData.length > 0 && membersData.length > 0) {
  const memberIds = membersData.map((m) => m.id); // 获取所有成员 ID 用于检查
  const studentIds = membersData
    .filter((m) => m.status !== "教师")
    .map((m) => m.id);
  const teacherIds = membersData
    .filter((m) => m.status === "教师")
    .map((m) => m.id);

  if (teacherIds.length === 0)
    console.warn("!!! 测试警告：成员数据中未找到 '教师' 身份的成员 !!!");
  if (studentIds.length === 0)
    console.warn("!!! 测试警告：成员数据中未找到非 '教师' 身份的成员 !!!");

  papers = publicationsData.map((p) => {
    let combinedAuthors = [];
    // 确保至少有一个作者（如果可能）
    if (studentIds.length > 0 || teacherIds.length > 0) {
      const numStudents =
        studentIds.length > 0
          ? Math.max(
              1,
              Math.floor(Math.random() * Math.min(5, studentIds.length + 1)),
            )
          : 0;
      const selectedStudents = [...studentIds]
        .sort(() => 0.5 - Math.random())
        .slice(0, numStudents);
      const selectedTeacher =
        teacherIds.length > 0
          ? teacherIds[Math.floor(Math.random() * teacherIds.length)]
          : null;

      combinedAuthors = [...selectedStudents];
      if (selectedTeacher) {
        if (Math.random() > 0.3) {
          combinedAuthors.unshift(selectedTeacher);
        } else {
          const insertPos = Math.floor(
            Math.random() * (combinedAuthors.length + 1),
          );
          combinedAuthors.splice(insertPos, 0, selectedTeacher);
        }
      }
      // 确保徐子晨和易为涵有一定概率出现（如果他们在成员列表中）
      if (
        memberIds.includes("ZichenXu") &&
        !combinedAuthors.includes("ZichenXu") &&
        Math.random() < 0.8
      ) {
        combinedAuthors.unshift("ZichenXu");
      }
      if (
        memberIds.includes("WeihanYi") &&
        !combinedAuthors.includes("WeihanYi") &&
        Math.random() < 0.5
      ) {
        const insertPos = Math.floor(
          Math.random() * (combinedAuthors.length + 1),
        );
        combinedAuthors.splice(insertPos, 0, "WeihanYi");
      }

      // 去重，以防万一重复添加
      combinedAuthors = [...new Set(combinedAuthors)];
    }

    if (combinedAuthors.length === 0)
      console.warn(`!!! 测试警告: 出版物 "${p.title}" 未能分配任何作者 !!!`);

    return { ...p, authors: combinedAuthors }; // 返回带有合成作者ID列表的论文对象
  });
} else {
  console.warn("!!! 测试警告：出版物或成员数据为空，无法生成作者信息 !!!");
}
// --- !!! 随机作者生成逻辑结束 !!! ---

// --- 数据库设置异步函数 ---
async function setup() {
  console.log(`正在打开数据库: ${dbPath}`);
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  console.log("运行数据库迁移 (设置外键)...");
  await db.exec("PRAGMA foreign_keys = ON;");

  console.log("删除现有表格 (如果存在)...");
  // --- 注意：每次运行此脚本都会清空数据库！---
  // --- 删除所有相关表 ---
  await db.exec("DROP TABLE IF EXISTS publication_authors;");
  await db.exec("DROP TABLE IF EXISTS software_datasets;");
  await db.exec("DROP TABLE IF EXISTS presentations;");
  await db.exec("DROP TABLE IF EXISTS teaching;");
  await db.exec("DROP TABLE IF EXISTS patents;");
  await db.exec("DROP TABLE IF EXISTS awards;");
  await db.exec("DROP TABLE IF EXISTS project_members;");
  await db.exec("DROP TABLE IF EXISTS projects;");
  await db.exec("DROP TABLE IF EXISTS education;");
  await db.exec("DROP TABLE IF EXISTS publications;");
  await db.exec("DROP TABLE IF EXISTS members;");
  console.log("现有表格已删除。");

  // --- 创建所有表格 (包括新增的) ---
  console.log("正在创建所有表格结构...");
  await db.exec(`
    CREATE TABLE members (
      id TEXT PRIMARY KEY, name_en TEXT, name_zh TEXT NOT NULL, title_zh TEXT, title_en TEXT,
      status TEXT NOT NULL, enrollment_year INTEGER, bio_zh TEXT, bio_en TEXT, avatar_url TEXT,
      email TEXT UNIQUE, research_interests TEXT, skills TEXT, favorite_emojis TEXT, github_url TEXT,
      blog_url TEXT, linkedin_url TEXT, google_scholar_id TEXT, dblp_id TEXT,
      semantic_scholar_id TEXT, orcid_id TEXT, more_about_me TEXT, recruiting_status TEXT
    );`);
  await db.exec(
    `CREATE TABLE education (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, degree TEXT NOT NULL, field TEXT, school TEXT NOT NULL, start_year INTEGER, end_year INTEGER, display_order INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  await db.exec(
    `CREATE TABLE awards (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, title TEXT NOT NULL, organization TEXT, year INTEGER, description TEXT, display_order INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  await db.exec(
    `CREATE TABLE projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, status TEXT, start_year INTEGER, end_year INTEGER, url TEXT, funding_source TEXT);`,
  );
  await db.exec(
    `CREATE TABLE project_members (project_id INTEGER NOT NULL, member_id TEXT NOT NULL, role TEXT, PRIMARY KEY (project_id, member_id), FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  await db.exec(
    `CREATE TABLE teaching (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, course_code TEXT, course_title TEXT NOT NULL, semester TEXT, year INTEGER, role TEXT DEFAULT 'Instructor', description_url TEXT, display_order INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  await db.exec(
    `CREATE TABLE presentations (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, title TEXT NOT NULL, event_name TEXT, location TEXT, year INTEGER, url TEXT, display_order INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  await db.exec(
    `CREATE TABLE software_datasets (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT, type TEXT DEFAULT 'software', repository_url TEXT, project_url TEXT, display_order INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  await db.exec(
    `CREATE TABLE patents (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, title TEXT NOT NULL, patent_number TEXT UNIQUE, issue_date TEXT, url TEXT, display_order INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  await db.exec(
    `CREATE TABLE publications (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, venue TEXT, year INTEGER NOT NULL, ccf_rank TEXT, doi_url TEXT UNIQUE, pdf_url TEXT, abstract TEXT, keywords TEXT);`,
  );
  await db.exec(
    `CREATE TABLE publication_authors (publication_id INTEGER NOT NULL, member_id TEXT NOT NULL, author_order INTEGER NOT NULL, PRIMARY KEY (publication_id, author_order), FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE, FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE);`,
  );
  console.log("所有表格结构已创建。");

  // --- 插入数据 ---
  console.log("正在插入成员数据 (来自 member.csv)...");
  // 准备语句包含所有新旧字段
  const memberStmt = await db.prepare(
    `INSERT OR REPLACE INTO members (
       id, name_en, name_zh, title_zh, title_en, status, enrollment_year, bio_zh, bio_en,
       avatar_url, email, research_interests, skills, favorite_emojis, github_url, blog_url, linkedin_url,
       google_scholar_id, dblp_id, semantic_scholar_id, orcid_id, more_about_me, recruiting_status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  await db.run("BEGIN TRANSACTION;");
  for (const m of membersData) {
    try {
      const enrollmentYear =
        m.enrollment_year && !isNaN(parseInt(m.enrollment_year))
          ? parseInt(m.enrollment_year)
          : null;
      // 直接从 CSV 对象插入，如果 CSV 中某列不存在或为空，对应值将是 undefined 或空字符串，数据库会处理为 NULL 或空
      await memberStmt.run(
        m.id || null,
        m.name_en || null,
        m.name_zh || null,
        m.title_zh || null,
        m.title_en || null,
        m.status || null,
        enrollmentYear,
        m.bio_zh || null,
        m.bio_en || null,
        m.avatar_url || null,
        m.email || null,
        m.research_interests || null,
        m.skills || null, // 新字段从CSV读取
        m.favorite_emojis || null,
        m.github_url || null,
        m.blog_url || null,
        m.linkedin_url || null,
        m.google_scholar_id || null,
        m.dblp_id || null,
        m.semantic_scholar_id || null,
        m.orcid_id || null, // 新字段从CSV读取
        m.more_about_me || null,
        m.recruiting_status || null, // 新字段从CSV读取
      );
    } catch (e) {
      console.error(`插入成员 ${m.name_zh || m.id} 失败:`, e.message);
    }
  }
  await db.run("COMMIT;");
  await memberStmt.finalize();
  console.log("成员数据插入完成。");

  // --- 跳过新表格的数据插入 ---
  console.log(
    "--- 跳过向 education, awards, projects, teaching 等新表格插入数据 ---",
  );
  console.log("--- 原因: 测试设置仅使用 member.csv 和 publication.csv ---");

  // --- 插入出版物及作者关系 (使用随机作者进行测试) ---
  console.log("正在插入出版物及作者关系数据 (作者随机生成!)...");
  const pubStmt = await db.prepare(
    "INSERT INTO publications (title, venue, year, ccf_rank, doi_url, pdf_url, abstract, keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const authorStmt = await db.prepare(
    "INSERT INTO publication_authors (publication_id, member_id, author_order) VALUES (?, ?, ?)",
  );
  console.log(`准备插入 ${papers.length} 篇论文及其作者关系...`);
  await db.run("BEGIN TRANSACTION;");
  for (const p of papers) {
    try {
      // 确保年份是数字或 null
      const publicationYear =
        p.year && !isNaN(parseInt(p.year)) ? parseInt(p.year) : null;
      if (!publicationYear) {
        console.warn(`警告: 论文 "${p.title}" 年份无效或缺失，跳过插入。`);
        continue; // 跳过这篇论文
      }
      const result = await pubStmt.run(
        p.title || "Untitled", // 提供默认值
        p.venue || null,
        publicationYear, // 使用处理后的年份
        p.ccf_rank || null,
        p.doi_url || null,
        p.pdf_url || null,
        p.abstract || null,
        p.keywords || null,
      );
      const publicationId = result.lastID;
      if (publicationId && p.authors && p.authors.length > 0) {
        for (let i = 0; i < p.authors.length; i++) {
          const memberId = p.authors[i];
          const authorOrder = i + 1;
          // 检查成员 ID 是否有效 (存在于 membersData 中)
          const memberExists = membersData.some((m) => m.id === memberId);
          if (memberExists) {
            await authorStmt.run(publicationId, memberId, authorOrder);
          } else {
            // 这个警告理论上不应触发，因为随机作者是从 membersData 中选的
            console.warn(
              `  跳过作者链接：成员 ID "${memberId}" 无效 (论文: ${p.title})。`,
            );
          }
        }
      } else if (!publicationId) {
        console.error(`插入论文失败，跳过作者链接: ${p.title}`);
      }
    } catch (e) {
      if (e.message.includes("UNIQUE constraint failed")) {
        console.warn(
          `跳过插入：唯一约束冲突 (论文/专利: ${p.title}) - ${e.message}`,
        );
      } else {
        console.error(`插入论文或作者关系失败: ${p.title}`, e.message);
      }
    }
  }
  await db.run("COMMIT;");
  await pubStmt.finalize();
  await authorStmt.finalize();
  console.log("出版物及作者关系数据插入完成。");

  // --- 关闭数据库连接 ---
  await db.close();
  console.log(
    "数据库设置完成 (创建了所有表结构，仅填充了 members/publications/authors [随机])，连接已关闭。",
  );
}

// --- 执行设置函数 ---
setup().catch((err) => {
  console.error("数据库设置过程中发生严重错误:", err);
  process.exit(1);
});
