import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'data/lab.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created directory: ${dbDir}`);
}

async function setup() {
  console.log(`Opening database at: ${dbPath}`);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Running migrations...');
  await db.exec('PRAGMA foreign_keys = ON;');

  console.log('Dropping existing tables...');
  await db.exec('DROP TABLE IF EXISTS publication_authors;');
  await db.exec('DROP TABLE IF EXISTS publications;');
  await db.exec('DROP TABLE IF EXISTS members;');
  console.log('Existing tables dropped.');

  console.log('Creating members table...');
  await db.exec(`
    CREATE TABLE members (
      id TEXT PRIMARY KEY, 
      name_en TEXT,
      name_zh TEXT NOT NULL,
      title_zh TEXT,
      title_en TEXT,
      status TEXT NOT NULL,
      enrollment_year INTEGER NOT NULL,
      bio_zh TEXT,
      bio_en TEXT,
      avatar_url TEXT,
      email TEXT UNIQUE,
      research_interests TEXT,
      favorite_emojis TEXT,
      github_url TEXT,
      blog_url TEXT,
      linkedin_url TEXT
    );
  `);
  console.log('Members table created.');

  console.log('Creating publications table...');
  await db.exec(`
    CREATE TABLE publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      title TEXT NOT NULL,
      venue TEXT,            
      year INTEGER NOT NULL,   
      ccf_rank TEXT,         
      doi_url TEXT UNIQUE,     
      pdf_url TEXT,          
      abstract TEXT,
      keywords TEXT
    );
  `);
  console.log('Publications table created.');

  console.log('Creating publication_authors table...');
  await db.exec(`
    CREATE TABLE publication_authors (
      publication_id INTEGER NOT NULL,
      member_id TEXT NOT NULL,     
      author_order INTEGER NOT NULL,
      PRIMARY KEY (publication_id, author_order),
      FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );
  `);
  console.log('Publication_authors table created.');

  console.log('Inserting initial data...');

  const membersData = [
    // Professor
    { id: 'ZichenXu', name_en: 'Zichen Xu', name_zh: '徐子晨', title_zh: '教授', title_en: 'Professor', status: '教师', enrollment_year: 2000, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'zichen.xu@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    // Doctoral Students
    { id: 'YanFu', name_en: 'Yan Fu', name_zh: 'Yan Fu', title_zh: null, title_en: null, status: '博士生', enrollment_year: 2021, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'yan.fu@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'HanxiaoYi', name_en: 'Hanxiao Yi', name_zh: 'Hanxiao Yi', title_zh: null, title_en: null, status: '博士生', enrollment_year: 2021, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'hanxiao.yi@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'JinhuiLai', name_en: 'Jinhui Lai', name_zh: 'Jinhui Lai', title_zh: null, title_en: null, status: '博士生', enrollment_year: 2022, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'jinhui.lai@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'AoGong', name_en: 'Ao Gong', name_zh: 'Ao Gong', title_zh: null, title_en: null, status: '博士生', enrollment_year: 2022, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'ao.gong@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    // Master Students
    { id: 'ChengLinLiang', name_en: 'ChengLin Liang', name_zh: 'ChengLin Liang', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'chenglin.liang@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'HanJianJiang', name_en: 'HanJian Jiang', name_zh: 'HanJian Jiang', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'hanjian.jiang@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'JiangBoLi', name_en: 'JiangBo Li', name_zh: 'JiangBo Li', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'jiangbo.li@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'ZhenLingSun', name_en: 'ZhenLing Sun', name_zh: 'ZhenLing Sun', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'zhenling.sun@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'BingYanLi', name_en: 'BingYan Li', name_zh: 'BingYan Li', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'bingyan.li@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'KeXu', name_en: 'Ke Xu', name_zh: 'Ke Xu', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'ke.xu@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'YueGong', name_en: 'Yue Gong', name_zh: 'Yue Gong', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'yue.gong@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'HaowenZhou', name_en: 'Haowen Zhou', name_zh: 'Haowen Zhou', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'haowen.zhou@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'WeiXu', name_en: 'Wei Xu', name_zh: 'Wei Xu', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'wei.xu@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'YucongDong', name_en: 'Yucong Dong', name_zh: 'Yucong Dong', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'yucong.dong@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'ZihanYu', name_en: 'Zihan Yu', name_zh: 'Zihan Yu', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'zihan.yu@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'HaoChen', name_en: 'Hao Chen', name_zh: 'Hao Chen', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'hao.chen@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'YingZhou', name_en: 'Ying Zhou', name_zh: 'Ying Zhou', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'ying.zhou@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'ZiqianCheng', name_en: 'Ziqian Cheng', name_zh: 'Ziqian Cheng', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'ziqian.cheng@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'JinZhao', name_en: 'Jin Zhao', name_zh: 'Jin Zhao', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'jin.zhao@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'LinxinWu', name_en: 'Linxin Wu', name_zh: 'Linxin Wu', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'linxin.wu@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'YongtaoZhong', name_en: 'Yongtao Zhong', name_zh: 'Yongtao Zhong', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'yongtao.zhong@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'HaonanZheng', name_en: 'Haonan Zheng', name_zh: 'Haonan Zheng', title_zh: null, title_en: null, status: '硕士生', enrollment_year: 2024, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'haonan.zheng@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    // Undergraduate Students
    { id: 'JingGao', name_en: 'Jing Gao', name_zh: 'Jing Gao', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2021, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'jing.gao@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'XinDai', name_en: 'Xin Dai', name_zh: 'Xin Dai', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2021, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'xin.dai@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'YifanZhang', name_en: 'Yifan Zhang', name_zh: 'Yifan Zhang', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2022, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'yifan.zhang@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'YuhanWang', name_en: 'Yuhan Wang', name_zh: 'Yuhan Wang', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2022, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'yuhan.wang@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'WeihanYi', name_en: 'Weihan Yi', name_zh: '易炜涵', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2022, bio_zh: '易炜涵是实验室的优秀本科生，积极参与软件工程项目，并对数据挖掘和Web开发有浓厚兴趣。', bio_en: 'Weihan Yi is an outstanding undergraduate student actively involved in software engineering projects, with strong interests in data mining and web development.', avatar_url: '/avatars/placeholder.png', email: 'weihan.yi@example.com', research_interests: '软件工程,数据挖掘,Web开发', favorite_emojis: '💻,📊,🌐', github_url: 'https://github.com/example-weihanyi', blog_url: 'https://blog.example.com/weihanyi', linkedin_url: null },
    { id: 'PinyeWang', name_en: 'Pinye Wang', name_zh: '王品烨', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2022, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'pinye.wang@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'ZiqiZhou', name_en: 'Ziqi Zhou', name_zh: 'Ziqi Zhou', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'ziqi.zhou@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'WenHaoHu', name_en: 'WenHao Hu', name_zh: 'WenHao Hu', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'wenhao.hu@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
    { id: 'FengHanLi', name_en: 'FengHan Li', name_zh: 'FengHan Li', title_zh: null, title_en: null, status: '本科生', enrollment_year: 2023, bio_zh: null, bio_en: null, avatar_url: '/avatars/placeholder.png', email: 'fenghan.li@example.com', research_interests: null, favorite_emojis: null, github_url: null, blog_url: null, linkedin_url: null },
  ];

  const memberStmt = await db.prepare(
    'INSERT OR REPLACE INTO members (id, name_en, name_zh, title_zh, title_en, status, enrollment_year, bio_zh, bio_en, avatar_url, email, research_interests, favorite_emojis, github_url, blog_url, linkedin_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const m of membersData) {
    try {
      await memberStmt.run(
        m.id, m.name_en, m.name_zh, m.title_zh, m.title_en, 
        m.status, m.enrollment_year, m.bio_zh, m.bio_en, 
        m.avatar_url, m.email, m.research_interests, m.favorite_emojis, 
        m.github_url, m.blog_url, m.linkedin_url
      );
      console.log(`Inserted member: ${m.name_en}`);
    } catch (e) {
      console.error(`Failed to insert member ${m.name_en}:`, e);
    }
  }
  await memberStmt.finalize();

  console.log('Inserting publications data...');
  const pubStmt = await db.prepare(
    'INSERT INTO publications (title, venue, year, ccf_rank, doi_url, pdf_url, abstract, keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const authorStmt = await db.prepare(
    'INSERT INTO publication_authors (publication_id, member_id, author_order) VALUES (?, ?, ?)'
  );

  const venues = ['IEEE TSE', 'ICSE', 'FSE', 'ASE', 'TOSEM', 'ESEC/FSE', 'ISSRE', 'MSR', 'SANER', 'ICPC', 'Journal of Software', 'Computer Science', 'Tech Report', 'NeurIPS', 'ICML', 'CVPR', 'ACL', 'SIGMOD', 'VLDB'];
  const ccfRanks = ['A', 'B', 'C', null];
  const keywordsList = [['SE', 'Mining'], ['AI', 'ML'], ['NLP', 'IR'], ['Testing', 'Debug'], ['Empirical SE'], ['CV', 'Vision'], ['DB', 'Systems'], ['Security', 'Privacy']];
  const studentIds = membersData.filter(m => m.status !== '教师').map(m => m.id);
  const teacherIds = membersData.filter(m => m.status === '教师').map(m => m.id);
  let totalPapers = 0;
  const papers = [];

  const targetPaperCount = 70;
  while (totalPapers < targetPaperCount) {
    const year = 2024 - Math.floor(Math.random() * 10); 
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const ccf = venue.startsWith('Tech') ? null : ccfRanks[Math.floor(Math.random() * ccfRanks.length)];
    const keywords = keywordsList[Math.floor(Math.random() * keywordsList.length)].join(', ');
    const title = `Paper ${totalPapers + 1}: Exploring ${keywords} in ${venue} (${year})`;
    const abstract = `This paper explores various aspects of ${keywords}. We propose a novel method and evaluate it extensively. Our findings suggest potential improvements in the field. (${Math.random().toString(36).substring(7)})`;
    const doi = `10.1109/EXAMPLE.${year}.${Math.floor(Math.random() * 10000)}`;
    const pdf = `/pdfs/paper_${totalPapers + 1}.pdf`;
    const numStudents = Math.max(1, Math.floor(Math.random() * 5));
    const selectedStudents = [...studentIds].sort(() => 0.5 - Math.random()).slice(0, numStudents);
    const selectedTeacher = teacherIds[Math.floor(Math.random() * teacherIds.length)];
    const authors = Math.random() > 0.3 ? [selectedTeacher, ...selectedStudents] : [...selectedStudents, selectedTeacher].sort(() => 0.5 - Math.random()); 
    papers.push({ title, venue, year, ccf_rank: ccf, doi, pdf, abs: abstract, keywords, authors });
    totalPapers++;
  }

  console.log(`Inserting ${papers.length} papers and authorships...`);
  for (const p of papers) {
      try {
          const result = await pubStmt.run(p.title, p.venue, p.year, p.ccf_rank, p.doi, p.pdf, p.abs, p.keywords);
          const publicationId = result.lastID;
          if (publicationId) {
              // console.log(`Inserted publication: ${p.title} (ID: ${publicationId})`);
              for (let i = 0; i < p.authors.length; i++) {
                  const memberId = p.authors[i];
                  const authorOrder = i + 1;
                  const memberExists = membersData.some(m => m.id === memberId);
                  if (memberExists) {
                      await authorStmt.run(publicationId, memberId, authorOrder);
                  } else {
                      console.warn(`  Skipping author link: Member ID "${memberId}" not found.`);
                  }
              }
          } else {
              console.error(`Failed to insert publication, skipping authors: ${p.title}`);
          }
      } catch (e) {
          if (e.message.includes('UNIQUE constraint failed: publications.doi_url')) {
              console.warn(`Skipped inserting duplicate DOI for paper: ${p.title}`)
          } else {
              console.error(`Failed to insert publication or authors for: ${p.title}`, e);
          }
      }
  }
  await pubStmt.finalize();
  await authorStmt.finalize();

  await db.close();
  console.log('Database setup complete with new schema and extensive data.');
}

setup().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
}); 