import { PrismaClient, MemberStatus, PublicationType, ArtefactType } from '@prisma/client';

// 实例化 Prisma Client
const prisma = new PrismaClient();

// 定义要插入的测试数据
async function main() {
  console.log(`开始填充测试数据...`);

  // --- 1. 创建核心成员 ---
  // (使用 upsert 可以在重复运行 seed 时更新数据，如果 id 已存在)
  // (如果每次 migrate dev 后都 seed，用 create 或 createMany 也可以)

  const professor = await prisma.member.upsert({
    where: { id: 'ZichenXu' },
    update: {}, // 如果存在，不更新任何字段 (也可以指定更新)
    create: {
      id: 'ZichenXu',
      name_en: 'Zichen Xu',
      name_zh: '徐子晨',
      status: MemberStatus.PROFESSOR, // 使用枚举
      enrollment_year: 2000, // 假设入职年份
      title_zh: '教授，博导，副院长',
      title_en: 'Professor, Vice Dean',
      major: 'Computer Science and Engineering',
      research_group: 'GOOD Lab',
      research_interests: 'Computational System Design, Sustainable Data Service, Unreliable/Unstable Systems, Database Optimization, AI System Optimization',
      skills: 'System Design, Database Kernels, Distributed Systems, Performance Optimization, C++, Python',
      bio_en: '1st selected Jiangxi Provincial Thousand Young Talents, Principal Investigator Multiple Funds, Best Paper Award, etc. Leading the GOOD Lab at Nanchang University.',
      avatar_url: '/avatars/zichenxu.jpg', // 使用你提供的路径
      email: 'xuz@ncu.edu.cn',
      personal_website: 'http://good.ncu.edu.cn/~xuz/',
      google_scholar_id: 'PLACEHOLDER_Prof_GS_ID', // 替换为真实 ID
      dblp_id: 'PLACEHOLDER_Prof_DBLP_ID',       // 替换为真实 ID
      orcid_id: 'PLACEHOLDER_Prof_ORCID_ID',      // 替换为真实 ID
      recruiting_status: 'Accepting applications for motivated PhD, Master, and Undergraduate students.',
      is_profile_public: true,
    },
  });
  console.log(`创建或找到成员: ${professor.name_en}`);

  const undergraduate = await prisma.member.upsert({
    where: { id: 'WeihanYi' },
    update: {},
    create: {
      id: 'WeihanYi',
      name_en: 'Weihan Yi',
      name_zh: '易为涵',
      status: MemberStatus.UNDERGRADUATE,
      enrollment_year: 2022,
      major: 'Computer Science',
      research_group: 'GOOD Lab',
      research_interests: 'High-Performance Computing, Distributed Computing, Parallel Computing, Operations and Maintenance Technology',
      skills: 'C++, Python, Linux, Docker, Git',
      bio_zh: '易炜涵是实验室的优秀本科生，积极参与软件工程项目，并对数据挖掘和Web开发有浓厚兴趣。',
      bio_en: 'Main Contributor of Goodlab Undergraduate Beginner\'s Guide, Member of GOG-NEXT Operations Team, Key Leader of NCUSCC.',
      avatar_url: '/avatars/placeholder.png', // 使用占位符或真实路径
      email: 'weihan-yi-teapo1de@email.ncu.edu.cn',
      github_url: 'https://github.com/ywh555hhh',
      personal_website: 'https://ywh555hhh.github.io',
      interests_hobbies: 'Basketball, Graphic Design',
      favorite_emojis: '💻,📊,🌐,YWH',
      is_profile_public: true,
      supervisor_id: professor.id, // 关联导师
    },
  });
  console.log(`创建或找到成员: ${undergraduate.name_en}`);

  const masterStudent = await prisma.member.upsert({
    where: { id: 'KeXu' }, // 假设 'KeXu' 是许可的 ID
    update: {},
    create: {
      id: 'KeXu',
      name_en: 'Ke Xu',
      name_zh: '徐珂',
      status: MemberStatus.MASTER_STUDENT,
      enrollment_year: 2022,
      major: 'Computer Science and Technology',
      research_group: 'GOOD Lab',
      research_interests: 'Distributed Microservice System',
      skills: 'Java, Spring Boot, Microservices, Go',
      avatar_url: '/avatars/placeholder.png',
      email: 'kxu30sky@outlook.com',
      interests_hobbies: 'Basketball, Japanese, Anime',
      is_profile_public: true,
      supervisor_id: professor.id, // 关联导师
    },
  });
  console.log(`创建或找到成员: ${masterStudent.name_en}`);


  // --- 2. 添加教育经历 ---
  await prisma.education.createMany({
    data: [
      // 徐子晨的示例教育经历
      { member_id: professor.id, degree: 'Ph.D.', field: 'Computer Science', school: 'The Ohio State University', end_year: 2015, display_order: 1 },
      { member_id: professor.id, degree: 'M.S.', field: 'Computer Science', school: 'University of South Florida', end_year: 2011, display_order: 2 },
      { member_id: professor.id, degree: 'B.Eng.', field: 'Computer Science', school: 'Beijing University of Posts and Telecommunications', end_year: 2007, display_order: 3 },
      // 易为涵的当前教育经历
      { member_id: undergraduate.id, degree: 'B.Eng. (Expected)', field: 'Computer Science', school: 'Nanchang University', start_year: 2022, display_order: 1 },
      // 许可的当前教育经历 + 假设的本科
      { member_id: masterStudent.id, degree: 'M.Eng. (Expected)', field: 'Computer Science and Technology', school: 'Nanchang University', start_year: 2022, display_order: 1 },
      { member_id: masterStudent.id, degree: 'B.Eng.', field: 'Computer Science', school: 'Some University', end_year: 2022, display_order: 2 }, // 假设本科
    ],
  });
  console.log(`添加了教育经历测试数据`);

  // --- 3. 添加奖项荣誉 ---
  await prisma.award.createMany({
    data: [
      // 徐子晨的示例奖项
      { member_id: professor.id, title: 'Jiangxi Provincial Thousand Young Talents', year: 2018, organization: 'Jiangxi Province', display_order: 1 },
      { member_id: professor.id, title: 'Best Paper Award', year: 2010, organization: 'Florida Emerging Paradigms', display_order: 2 },
      // 易为涵/许可的示例奖项
      { member_id: undergraduate.id, title: 'Nanchang University Scholarship', year: 2023 },
      { member_id: masterStudent.id, title: 'Excellent Student Cadre', year: 2021, organization: 'Some University'},
    ],
  });
  console.log(`添加了奖项荣誉测试数据`);

  // --- 4. 添加项目和成员 ---
  const project1 = await prisma.project.create({
    data: {
      title: 'GOOD-DB: Next-Gen Database System Optimization',
      description: 'Researching and developing novel optimization techniques for database systems on modern hardware.',
      status: 'Ongoing',
      start_year: 2021,
      url: 'http://good.ncu.edu.cn/projects/good-db', // 示例 URL
      is_featured: true,
      // 添加项目成员 (使用 nested create)
      members: {
        create: [
          { member_id: professor.id, role: 'PI' }, // 徐子晨是 PI
          { member_id: masterStudent.id, role: 'Participant' }, // 许可是参与者
        ],
      },
    },
  });
  console.log(`创建了项目: ${project1.title}`);

  const project2 = await prisma.project.create({
      data: {
          title: 'AI System Efficiency and Sustainability',
          description: 'Optimizing AI model training and inference for better performance and lower energy consumption.',
          status: 'Ongoing',
          start_year: 2022,
           members: {
               create: [
                   { member_id: professor.id, role: 'PI'},
                   { member_id: undergraduate.id, role: 'Undergraduate Researcher'}, // 易为涵参与
               ]
           }
      }
  });
  console.log(`创建了项目: ${project2.title}`);


  // --- 5. 添加出版物和作者关系 ---
  const pub1 = await prisma.publication.create({
    data: {
      title: 'A Survey on Modern Database Optimization Techniques',
      venue: 'Journal of Database Systems (JDS)',
      year: 2024,
      ccf_rank: 'A', // 示例等级
      type: PublicationType.JOURNAL, // 使用枚举
      doi_url: '10.1234/jds.2024.001', // 示例 DOI
      pdf_url: '/pdfs/survey_db_opt.pdf', // 示例相对路径
      abstract: 'This paper surveys recent advances in database optimization...',
      // 添加作者 (使用 nested create，自动处理 PublicationAuthor 表)
      authors: {
        create: [
          { member_id: professor.id, author_order: 1, is_corresponding_author: true }, // 徐子晨，第一作者，通讯作者
          { member_id: masterStudent.id, author_order: 2 }, // 许可，第二作者
        ],
      },
    },
  });
  console.log(`创建了出版物: ${pub1.title}`);

  const pub2 = await prisma.publication.create({
      data: {
          title: 'Efficient Scheduling for Distributed AI Training',
          venue: 'International Conference on AI Systems (ICAIS)',
          year: 2023,
          ccf_rank: 'B',
          type: PublicationType.CONFERENCE,
          doi_url: '10.5678/icais.2023.015',
          pdf_url: 'https://arxiv.org/abs/2305.xxxx', // 示例 arXiv 链接
          authors: {
              create: [
                   { member_id: professor.id, author_order: 1},
                   { member_id: undergraduate.id, author_order: 2}, // 易为涵，第二作者
                   { member_id: masterStudent.id, author_order: 3}, // 许可，第三作者
              ]
          }
      }
  });
   console.log(`创建了出版物: ${pub2.title}`);

    // --- 6. 添加教学经历 ---
    await prisma.teaching.createMany({
        data: [
            // 徐子晨的课
            { member_id: professor.id, course_title: 'Introduction to Artificial Intelligence', semester: 'Fall 2024', role: 'Instructor' },
            { member_id: professor.id, course_title: 'Graduate Course Introduction to Combinatorics', semester: 'Fall 2024', role: 'Instructor' },
            // 许可的助教经历 (示例)
            { member_id: masterStudent.id, course_title: 'Data Structures', semester: 'Spring 2023', role: 'TA', university: 'Nanchang University'},
        ],
    });
    console.log(`添加了教学经历测试数据`);


     // --- 7. 添加学术服务 (示例) ---
     await prisma.academicService.createMany({
         data: [
             { member_id: professor.id, role: 'PC Member', event: 'Some Conference 2025', year: 2025},
             { member_id: professor.id, role: 'Reviewer', event: 'Some Journal', year: 2024},
         ],
     });
      console.log(`添加了学术服务测试数据`);

     // --- 其他表 (Presentations, Software/Datasets, Patents, News) 暂时留空 ---
     console.log(`跳过填充 Presentations, Software/Datasets, Patents, News 表 (无测试数据)`);


}

// --- 执行主函数并处理结果 ---
main()
  .then(async () => {
    console.log('测试数据填充成功！');
    await prisma.$disconnect(); // 断开数据库连接
  })
  .catch(async (e) => {
    console.error('填充测试数据时出错:', e);
    await prisma.$disconnect();
    process.exit(1); // 出错时退出
  });