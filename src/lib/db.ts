import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// 数据库文件路径
const dbPath = path.resolve(process.cwd(), 'data/lab.db');

// 异步函数：连接数据库
async function connectDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

// 成员接口定义 (添加新字段)
export interface Member {
  id: string;
  name_en: string | null;
  name_zh: string;
  title_zh: string | null;
  title_en: string | null;
  status: string;
  enrollment_year: number;
  bio_zh: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  email: string | null;
  research_interests: string | null;
  favorite_emojis: string | null;
  // 新增字段
  github_url: string | null; 
  blog_url: string | null;
  linkedin_url: string | null;
}

// 新增接口：包含显示状态的成员信息
export interface MemberWithDisplayStatus extends Member {
  displayStatus: string;
}

// 论文接口定义 (添加)
export interface Publication {
  id: number;
  title: string;
  venue: string | null;
  year: number;
  ccf_rank: string | null;
  doi_url: string | null;
  pdf_url: string | null;
  abstract: string | null;
  keywords: string | null;
  // 添加 authors 字段，用于存储关联的作者信息
  authors?: { id: string; name_zh: string }[]; 
}

// 定义分组的顺序 (用于排序)
const statusOrder: Record<string, number> = {
  '教师': 1,
  '博士后': 2,
  '博士生': 3,
  '硕士生': 4,
  '本科生': 5,
  '访问学者': 6,
  '校友': 7,
};

// 辅助函数：计算成员的显示状态 (例如年级)
export function calculateMemberGradeStatus(member: Member): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 月份从 0 开始

  // 通常9月之后算新学年
  const academicYearStartMonth = 9;
  const academicYearAdjustment = currentMonth >= academicYearStartMonth ? 0 : -1;
  const currentAcademicYear = currentYear + academicYearAdjustment;

  switch (member.status) {
    case '教师':
      return member.title_zh || '教师';
    case '博士后':
      return '博士后';
    case '博士生':
      // return `博士生 (${member.enrollment_year}级)`;
      return `${member.enrollment_year}级博士生`;
    case '硕士生':
      // return `硕士生 (${member.enrollment_year}级)`;
      return `${member.enrollment_year}级硕士生`;
    case '本科生':
      const grade = currentAcademicYear - member.enrollment_year + 1;
      if (grade <= 4 && grade >= 1) {
        // return `本科${['一', '二', '三', '四'][grade - 1]}年级`;
        return `${member.enrollment_year}级本科生`;
      } else {
        return '本科生 (已毕业)'; // 或其他状态
      }
    case '访问学者':
      return '访问学者';
    case '校友':
      return '校友';
    default:
      return member.status; // 其他情况直接显示状态
  }
}

// 异步函数：获取所有成员，计算状态并排序
export async function getAllMembers(): Promise<MemberWithDisplayStatus[]> {
  const db = await connectDb();
  try {
    const members = await db.all<Member[]>('SELECT * FROM members');
    const membersWithStatus = members.map(member => ({
      ...member,
      displayStatus: calculateMemberGradeStatus(member),
    }));

    // 按身份状态和入学年份排序
    membersWithStatus.sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // 同一身份按入学年份降序 (教师/博士后等不入学年的按默认顺序)
      if (['博士生', '硕士生', '本科生'].includes(a.status)) {
        return b.enrollment_year - a.enrollment_year; 
      }
      // 否则保持原相对顺序或按ID排序
      return a.id.localeCompare(b.id);
    });

    return membersWithStatus;
  } finally {
    await db.close();
  }
}

// 异步函数：获取所有论文，并关联作者信息 (添加)
export async function getAllPublications(): Promise<Publication[]> {
  const db = await connectDb();
  try {
    // 获取所有论文
    const publications = await db.all<Publication[]>(
      'SELECT id, title, venue, year, ccf_rank, doi_url, pdf_url, abstract, keywords FROM publications ORDER BY year DESC, id DESC'
    );

    // 为每篇论文查询作者信息
    const authorStmt = await db.prepare(
      'SELECT m.id, m.name_zh FROM members m JOIN publication_authors pa ON m.id = pa.member_id WHERE pa.publication_id = ? ORDER BY pa.author_order ASC'
    );

    for (const pub of publications) {
      // 移除 all() 上的泛型，显式声明 authors 类型
      const authors: { id: string; name_zh: string }[] = await authorStmt.all(pub.id);
      pub.authors = authors;
    }
    
    await authorStmt.finalize();

    return publications;
  } finally {
    await db.close();
  }
}

// 异步函数：根据成员 ID 获取其发表的论文 (添加)
export async function getPublicationsByMemberId(memberId: string): Promise<Publication[]> {
  const db = await connectDb();
  try {
    // 1. 获取该成员参与的所有论文 ID
    // 显式声明 publicationIdsResult 的类型为数组
    const publicationIdsResult: { publication_id: number }[] | undefined = await db.all(
      'SELECT publication_id FROM publication_authors WHERE member_id = ?',
      memberId
    );
    // 添加检查确保 publicationIdsResult 是数组
    const publicationIds = Array.isArray(publicationIdsResult) ? publicationIdsResult.map((row: { publication_id: number }) => row.publication_id) : [];

    if (publicationIds.length === 0) {
      return []; // 如果成员没有发表论文，返回空数组
    }

    // 2. 根据论文 ID 获取论文信息
    // 构建 IN 子句的占位符 (?, ?, ?)
    const placeholders = publicationIds.map(() => '?').join(',');
    const publications = await db.all<Publication[]>(
      `SELECT id, title, venue, year, ccf_rank, doi_url, pdf_url, abstract, keywords 
       FROM publications 
       WHERE id IN (${placeholders}) 
       ORDER BY year DESC, id DESC`,
      ...publicationIds // 将 ID 数组展开作为参数
    );

    // 3. 为每篇论文查询并关联所有作者信息 (与 getAllPublications 类似)
    const authorStmt = await db.prepare(
      'SELECT m.id, m.name_zh FROM members m JOIN publication_authors pa ON m.id = pa.member_id WHERE pa.publication_id = ? ORDER BY pa.author_order ASC'
    );

    for (const pub of publications) {
      const authors: { id: string; name_zh: string }[] = await authorStmt.all(pub.id);
      pub.authors = authors;
    }

    await authorStmt.finalize();

    return publications;
  } finally {
    await db.close();
  }
}

// 异步函数：根据 ID 获取单个成员信息
export async function getMemberById(id: string): Promise<MemberWithDisplayStatus | null> {
  const db = await connectDb();
  try {
    const member = await db.get<Member>('SELECT * FROM members WHERE id = ?', id);
    if (!member) {
      return null;
    }
    return {
      ...member,
      displayStatus: calculateMemberGradeStatus(member),
    };
  } finally {
    await db.close();
  }
} 