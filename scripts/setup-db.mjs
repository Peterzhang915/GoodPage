import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const dbPath = path.resolve(process.cwd(), 'data/lab.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created directory: ${dbDir}`);
}

const membersCsvPath = path.resolve(process.cwd(), 'data/member.csv');
let membersData = [];

try {
  const csvString = fs.readFileSync(membersCsvPath, 'utf8');
  membersData = parse(csvString, {
    columns: true,  // 使用第一行作为标题
    skip_empty_lines: true,
    bom: true  // 处理可能的 BOM 字符
  });
  // membersData 现在是一个对象数组
} catch (err) {
  console.error('Error reading members.csv:', err);
  process.exit(1);
}

const publicationCsvPath = path.resolve(process.cwd(), 'data/publication.csv');
let publicationsData = [];
let papers = [];

try {
  const csvString = fs.readFileSync(publicationCsvPath, 'utf8');
  publicationsData = parse(csvString, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });
  const studentIds = membersData.filter(m => m.status !== '教师').map(m => m.id);
  const teacherIds = membersData.filter(m => m.status === '教师').map(m => m.id);
  papers = publicationsData.map(p => {
    const numStudents = Math.max(1, Math.floor(Math.random() * 5));
    const selectedStudents = [...studentIds].sort(() => 0.5 - Math.random()).slice(0, numStudents);
    const selectedTeacher = teacherIds[Math.floor(Math.random() * teacherIds.length)];
    return { ...p, authors: Math.random() > 0.3 ? [selectedTeacher, ...selectedStudents] : [...selectedStudents, selectedTeacher].sort(() => 0.5 - Math.random()) };
  });
} catch (err) {
  console.error('Error reading publication.csv:', err);
  process.exit(1);
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

  console.log(`Inserting ${papers.length} papers and authorships...`);
  for (const p of papers) {
      try {
          const result = await pubStmt.run(p.title, p.venue, p.year, p.ccf_rank, p.doi_url, p.pdf_url, p.abstract, p.keywords);
          const publicationId = result.lastID;
          if (publicationId) {
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