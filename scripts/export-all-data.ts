const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

async function exportToCSV(data: any[], filename: string, outputDir: string) {
  if (data.length === 0) {
    console.log(`No data to export for ${filename}`);
    return;
  }

  // 获取所有字段名
  const fields = Object.keys(data[0]);
  
  // 创建 CSV 头
  const csvHeader = fields.join(',') + '\n';
  
  // 创建 CSV 行
  const csvRows = data.map(item => {
    return fields.map(field => {
      const value = item[field];
      if (value === null || value === undefined) return '""';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (value instanceof Date) return `"${value.toISOString()}"`;
      return `"${String(value)}"`;
    }).join(',');
  }).join('\n');

  const csvContent = csvHeader + csvRows;
  const outputPath = path.join(outputDir, filename);
  await fs.writeFile(outputPath, csvContent, 'utf-8');
  console.log(`Exported ${data.length} records to ${outputPath}`);
}

async function main() {
  try {
    // 1. 检查数据库连接
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }

    // 2. 创建输出目录
    const outputDir = path.join(process.cwd(), 'prisma', 'initcsv');
    await fs.mkdir(outputDir, { recursive: true });

    // 3. 导出所有模型数据
    console.log('Starting data export...\n');

    // Member 数据
    const members = await prisma.member.findMany();
    await exportToCSV(members, 'Member.csv', outputDir);

    // Education 数据
    const education = await prisma.education.findMany();
    await exportToCSV(education, 'Education.csv', outputDir);

    // Award 数据
    const awards = await prisma.award.findMany();
    await exportToCSV(awards, 'Award.csv', outputDir);

    // Project 数据
    const projects = await prisma.project.findMany();
    await exportToCSV(projects, 'Project.csv', outputDir);

    // ProjectMember 数据
    const projectMembers = await prisma.projectMember.findMany();
    await exportToCSV(projectMembers, 'ProjectMember.csv', outputDir);

    // Teaching 数据
    const teaching = await prisma.teaching.findMany();
    await exportToCSV(teaching, 'Teaching.csv', outputDir);

    // Presentation 数据
    const presentations = await prisma.presentation.findMany();
    await exportToCSV(presentations, 'Presentation.csv', outputDir);

    // SoftwareDataset 数据
    const softwareDatasets = await prisma.softwareDataset.findMany();
    await exportToCSV(softwareDatasets, 'SoftwareDataset.csv', outputDir);

    // Patent 数据
    const patents = await prisma.patent.findMany();
    await exportToCSV(patents, 'Patent.csv', outputDir);

    // AcademicService 数据
    const academicServices = await prisma.academicService.findMany();
    await exportToCSV(academicServices, 'AcademicService.csv', outputDir);

    // News 数据
    const news = await prisma.news.findMany();
    await exportToCSV(news, 'News.csv', outputDir);

    // Publication 数据
    const publications = await prisma.publication.findMany();
    await exportToCSV(publications, 'Publication.csv', outputDir);

    // PublicationAuthor 数据
    const publicationAuthors = await prisma.publicationAuthor.findMany();
    await exportToCSV(publicationAuthors, 'PublicationAuthor.csv', outputDir);

    // PhotoTag 数据
    const photoTags = await prisma.photoTag.findMany();
    await exportToCSV(photoTags, 'PhotoTag.csv', outputDir);

    // LabPhoto 数据
    const labPhotos = await prisma.labPhoto.findMany();
    await exportToCSV(labPhotos, 'LabPhoto.csv', outputDir);

    // LabPhotoTag 数据
    const labPhotoTags = await prisma.labPhotoTag.findMany();
    await exportToCSV(labPhotoTags, 'LabPhotoTag.csv', outputDir);

    // Sponsorship 数据
    const sponsorships = await prisma.sponsorship.findMany();
    await exportToCSV(sponsorships, 'Sponsorship.csv', outputDir);

    // HomepageSectionMeta 数据
    const homepageSectionMeta = await prisma.homepageSectionMeta.findMany();
    await exportToCSV(homepageSectionMeta, 'HomepageSectionMeta.csv', outputDir);

    // HomepageNews 数据
    const homepageNews = await prisma.homepageNews.findMany();
    await exportToCSV(homepageNews, 'HomepageNews.csv', outputDir);

    // InterestPoint 数据
    const interestPoints = await prisma.interestPoint.findMany();
    await exportToCSV(interestPoints, 'InterestPoint.csv', outputDir);

    // HomepageProject 数据
    const homepageProjects = await prisma.homepageProject.findMany();
    await exportToCSV(homepageProjects, 'HomepageProject.csv', outputDir);

    // HomepageTeaching 数据
    const homepageTeaching = await prisma.homepageTeaching.findMany();
    await exportToCSV(homepageTeaching, 'HomepageTeaching.csv', outputDir);

    console.log('\nData export completed successfully!');

  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 