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
      favorite_emojis TEXT
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

  const memberStmt = await db.prepare(
    'INSERT INTO members (id, name_en, name_zh, title_zh, title_en, status, enrollment_year, bio_zh, bio_en, avatar_url, email, research_interests, favorite_emojis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const membersData = [
    { id: 'ProfXu', name_en: 'Zichen Xu', name_zh: '徐子晨', title_zh: '教授', title_en: 'Professor', status: '教师', enrollment_year: 2015, bio_zh: '徐子晨教授是GOOD实验室的负责人，研究方向为泛在数据分析与优化。', bio_en: 'Professor Zichen Xu is the director of GOOD Lab, focusing on generic operational and optimal data.', avatar_url: '/avatars/prof_xu.jpg', email: 'zcxu@ncu.edu.cn', research_interests: '软件工程,智能计算,数据优化', favorite_emojis: '🎓,📚,💡' },
    { id: 'AssocProfZhang', name_en: 'Ming Zhang', name_zh: '张明', title_zh: '副教授', title_en: 'Associate Professor', status: '教师', enrollment_year: 2018, bio_zh: '张明副教授专注于分布式系统与数据管理。', bio_en: 'Associate Professor Ming Zhang focuses on distributed systems and data management.', avatar_url: '/avatars/placeholder.png', email: 'ming.zhang@ncu.edu.cn', research_interests: '分布式系统,数据库,云计算', favorite_emojis: '☁️,💾,🔗' },
    { id: 'PostdocLi', name_en: 'Jian Li', name_zh: '李健', title_zh: '博士后', title_en: 'Postdoc', status: '博士后', enrollment_year: 2023, bio_zh: '李健博士后研究大语言模型优化。', bio_en: 'Dr. Jian Li is a postdoc researcher focusing on LLM optimization.', avatar_url: '/avatars/placeholder.png', email: 'jian.li.postdoc@ncu.edu.cn', research_interests: '大语言模型,性能优化,AI系统', favorite_emojis: '🚀,🧠,⚙️' },
    { id: 'DoctorA', name_en: 'Alice Chen', name_zh: '陈爱丽', title_zh: '', title_en: '', status: '博士生', enrollment_year: 2021, bio_zh: '陈爱丽专注于深度学习及其在计算机视觉中的应用。', bio_en: 'Alice Chen focuses on Deep Learning and its applications in Computer Vision.', avatar_url: '/avatars/doctor_a.png', email: 'alice.chen.phd@example.com', research_interests: '深度学习,计算机视觉,图像识别', favorite_emojis: '🤖,👀,🖼️' },
    { id: 'DoctorB', name_en: 'Ben Wang', name_zh: '王斌', title_zh: '', title_en: '', status: '博士生', enrollment_year: 2022, bio_zh: '王斌的研究方向是可信人工智能与隐私保护。', bio_en: 'Ben Wang researches trustworthy AI and privacy protection.', avatar_url: '/avatars/placeholder.png', email: 'ben.wang.phd@example.com', research_interests: '可信AI,隐私计算,联邦学习', favorite_emojis: '🔒,🛡️,🤝' },
    { id: 'BobStudent', name_en: 'Bob Ma', name_zh: '马波', title_zh: '', title_en: '', status: '硕士生', enrollment_year: 2023, bio_zh: '马波的研究兴趣是推荐系统与用户行为分析。', bio_en: 'Bob Ma is interested in Recommendation Systems and user behavior analysis.', avatar_url: '/avatars/bob.png', email: 'bob.ma@example.com', research_interests: '推荐系统,大数据,用户建模', favorite_emojis: '📊,🔍,🎯' },
    { id: 'CharlieSun', name_en: 'Charlie Sun', name_zh: '孙查理', title_zh: '', title_en: '', status: '硕士生', enrollment_year: 2023, bio_zh: '孙查理探索自然语言处理技术。', bio_en: 'Charlie Sun explores Natural Language Processing techniques.', avatar_url: '/avatars/placeholder.png', email: 'charlie.sun@example.com', research_interests: '自然语言处理,文本挖掘,信息抽取', favorite_emojis: '💬,✍️,📚' },
    { id: 'DavidLiu', name_en: 'David Liu', name_zh: '刘大卫', title_zh: '', title_en: '', status: '硕士生', enrollment_year: 2024, bio_zh: '刘大卫刚刚加入实验室，对软件测试和质量保证感兴趣。', bio_en: 'David Liu just joined the lab and is interested in software testing and QA.', avatar_url: '/avatars/placeholder.png', email: 'david.liu@example.com', research_interests: '软件测试,质量保证,自动化', favorite_emojis: '🧪,✔️,🤖' },
    { id: 'YiWeiHan', name_en: 'WeiHan Yi', name_zh: '易炜涵', title_zh: '', title_en: '', status: '本科生', enrollment_year: 2022, bio_zh: '易炜涵是实验室的优秀本科生，参与软件工程项目。', bio_en: 'Yi WeiHan is an outstanding undergraduate involved in software engineering projects.', avatar_url: '/avatars/yiweihan.jpg', email: 'yiwh@email.ncu.edu.cn', research_interests: '软件工程,数据挖掘,Web开发', favorite_emojis: '⚡,🔮,💻' },
    { id: 'WangPinYe', name_en: 'PinYe Wang', name_zh: '王品烨', title_zh: '', title_en: '', status: '本科生', enrollment_year: 2022, bio_zh: '王品烨主要学习人工智能基础与实践。', bio_en: 'PinYe Wang primarily studies AI fundamentals and practices.', avatar_url: '/avatars/wangpinye.jpg', email: 'wangpy@email.ncu.edu.cn', research_interests: '人工智能,机器学习,Python', favorite_emojis: '🎨,🎮,🐍' },
    { id: 'LiZhengYang', name_en: 'ZhengYang Li', name_zh: '李政阳', title_zh: '', title_en: '', status: '本科生', enrollment_year: 2023, bio_zh: '李政阳对自然语言处理和Web前端技术感兴趣。', bio_en: 'ZhengYang Li is interested in NLP and front-end web technologies.', avatar_url: '/avatars/lizhengyang.jpg', email: 'lizy@email.ncu.edu.cn', research_interests: '自然语言处理,前端开发,React', favorite_emojis: '🗣️,💻,⚛️' },
    { id: 'EvaGao', name_en: 'Eva Gao', name_zh: '高伊娃', title_zh: '', title_en: '', status: '本科生', enrollment_year: 2023, bio_zh: '高伊娃正在学习数据结构与算法。', bio_en: 'Eva Gao is currently learning data structures and algorithms.', avatar_url: '/avatars/placeholder.png', email: 'eva.gao@example.com', research_interests: '算法,数据结构,C++', favorite_emojis: '🧠,📈,💡' },
    { id: 'FrankHe', name_en: 'Frank He', name_zh: '何坦率', title_zh: '', title_en: '', status: '本科生', enrollment_year: 2024, bio_zh: '何坦率是实验室的新成员，对网络安全充满好奇。', bio_en: 'Frank He is a new member, curious about cybersecurity.', avatar_url: '/avatars/placeholder.png', email: 'frank.he@example.com', research_interests: '网络安全,密码学', favorite_emojis: '🔑,🔒,🌐' },
  ];
  for (const m of membersData) {
    try {
      await memberStmt.run(m.id, m.name_en, m.name_zh, m.title_zh, m.title_en, m.status, m.enrollment_year, m.bio_zh, m.bio_en, m.avatar_url, m.email, m.research_interests, m.favorite_emojis);
      console.log(`Inserted member: ${m.name_zh}`);
    } catch (e) {
      console.error(`Failed to insert member ${m.name_zh}`, e);
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