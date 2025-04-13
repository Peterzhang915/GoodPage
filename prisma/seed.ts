import { PrismaClient, MemberStatus, PublicationType, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
// 移除无效导入: import { datetime } from 'prisma/prisma-client/runtime/library';

// 实例化 Prisma Client
const prisma = new PrismaClient();

// --- 辅助函数 (保持不变) ---
function parseIntSafe(value: string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
}

function parseBoolSafe(value: string | null | undefined, defaultValue: boolean = true): boolean {
    if (value === null || value === undefined || value === '') return defaultValue;
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1') return true;
    if (lowerValue === 'false' || lowerValue === '0') return false;
    return defaultValue;
}

function parseDateSafe(value: string | null | undefined): Date | null {
    if (value === null || value === undefined || value === '') return null;
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            console.warn(`无法解析日期: ${value}, 将使用 null`);
            return null;
        }
        return date;
    } catch (e) {
        console.warn(`解析日期时出错: ${value}, 将使用 null`, e);
        return null;
    }
}

function isValidMemberStatus(value: string): value is keyof typeof MemberStatus {
    return Object.keys(MemberStatus).includes(value);
}

// --- 主函数 ---
async function main() {
    console.log(`开始填充测试数据...`);

    // --- 1. 从 CSV 创建或更新成员 (使用 upsert) ---
    const csvFilePath = path.join(__dirname, 'initcsv', 'Member.csv');
    console.log(`正在读取成员 CSV 文件: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
        console.error(`错误：找不到 CSV 文件：${csvFilePath}`);
        process.exit(1);
    }

    const csvContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    console.log(`从 CSV 读取到 ${records.length} 条成员记录，开始处理...`);

    let skippedCount = 0;

    for (const record of records) {
        const memberId = record.id;
        if (!memberId) {
            console.warn('跳过一行，因为缺少 ID:', record);
            skippedCount++;
            continue;
        }

        try {
            const statusValue = record.status;
            let memberStatus: MemberStatus;

            if (statusValue && isValidMemberStatus(statusValue)) {
                memberStatus = MemberStatus[statusValue];
            } else {
                 console.error(`错误：成员 ID ${memberId} 的 status 值 '${statusValue}' 无效或缺失。跳过此记录。`);
                 skippedCount++;
                 continue;
            }

            const dataToUpsert: Prisma.MemberUncheckedCreateInput = {
                id: memberId,
                name_en: record.name_en || '',
                status: memberStatus,
                name_zh: record.name_zh || null,
                enrollment_year: parseIntSafe(record.enrollment_year),
                title_zh: record.title_zh || null,
                title_en: record.title_en || null,
                major: record.major || null,
                research_group: record.research_group || null,
                research_interests: record.research_interests || null,
                skills: record.skills || null,
                bio_zh: record.bio_zh || null,
                bio_en: record.bio_en || null,
                more_about_me: record.more_about_me || null,
                interests_hobbies: record.interests_hobbies || null,
                avatar_url: record.avatar_url || null,
                office_location: record.office_location || null,
                office_hours: record.office_hours || null,
                pronouns: record.pronouns || null,
                email: record.email || null,
                phone_number: record.phone_number || null,
                personal_website: record.personal_website || null,
                cv_url: record.cv_url || null,
                github_url: record.github_url || null,
                linkedin_url: record.linkedin_url || null,
                google_scholar_id: record.google_scholar_id || null,
                dblp_id: record.dblp_id || null,
                semantic_scholar_id: record.semantic_scholar_id || null,
                orcid_id: record.orcid_id || null,
                favorite_emojis: record.favorite_emojis || null,
                start_date: parseDateSafe(record.start_date),
                graduation_details: record.graduation_details || null,
                recruiting_status: record.recruiting_status || null,
                is_profile_public: parseBoolSafe(record.is_profile_public, true),
                supervisor_id: record.supervisor_id || null,
            };

            await prisma.member.upsert({
                where: { id: memberId },
                update: dataToUpsert,
                create: dataToUpsert,
            });

            console.log(`处理成员 ID: ${memberId}`);

        } catch (error) {
            // 增加对唯一约束错误的特定处理（可选）
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                 console.warn(`处理成员 ID ${memberId} 时出现唯一约束冲突 (可能 email 重复)，跳过更新: ${error.message}`);
            } else {
                console.error(`处理成员 ID ${memberId} 时出错:`, error);
            }
            skippedCount++;
        }
    }
    console.log(`成员数据处理完成。插入/更新: ${records.length - skippedCount}, 跳过: ${skippedCount}`);


    // --- 获取关键成员 ID ---
    const professor = await prisma.member.findUnique({ where: { id: 'ZichenXu' } });
    const undergraduate = await prisma.member.findUnique({ where: { id: 'WeihanYi' } });
    const masterStudent = await prisma.member.findUnique({ where: { id: 'KeXu' } });

    if (!professor) console.warn("警告: 未能在数据库中找到 ZichenXu");
    if (!undergraduate) console.warn("警告: 未能在数据库中找到 WeihanYi");
    if (!masterStudent) console.warn("警告: 未能在数据库中找到 KeXu");


    // --- 2. 添加教育经历 (Idempotent via deleteMany + createMany) ---
    if (professor && undergraduate && masterStudent) {
        console.log("正在清空并重新填充 Education 表...");
        await prisma.education.deleteMany({ where: { member_id: { in: [professor.id, undergraduate.id, masterStudent.id] } } });
        await prisma.education.createMany({
             data: [
                 { member_id: professor.id, degree: 'Ph.D.', field: 'Computer Science', school: 'The Ohio State University', end_year: 2015, display_order: 1 },
                 { member_id: professor.id, degree: 'M.S.', field: 'Computer Science', school: 'University of South Florida', end_year: 2011, display_order: 2 },
                 { member_id: professor.id, degree: 'B.Eng.', field: 'Computer Science', school: 'Beijing University of Posts and Telecommunications', end_year: 2007, display_order: 3 },
                 { member_id: undergraduate.id, degree: 'B.Eng. (Expected)', field: 'Computer Science', school: 'Nanchang University', start_year: 2022, display_order: 1 },
                 { member_id: masterStudent.id, degree: 'M.Eng. (Expected)', field: 'Computer Science and Technology', school: 'Nanchang University', start_year: 2022, display_order: 1 },
                 { member_id: masterStudent.id, degree: 'B.Eng.', field: 'Computer Science', school: 'Some University', end_year: 2022, display_order: 2 },
             ],
         });
        console.log(`添加了教育经历测试数据`);
    } else {
        console.warn("跳过添加教育经历，因为一个或多个关键成员未找到。");
    }


    // --- 3. 添加奖项荣誉 (Idempotent via deleteMany + createMany) ---
    if (professor && undergraduate && masterStudent) {
         console.log("正在清空并重新填充 Award 表...");
         await prisma.award.deleteMany({ where: { member_id: { in: [professor.id, undergraduate.id, masterStudent.id] } } });
         await prisma.award.createMany({
             data: [
                 { member_id: professor.id, title: 'Jiangxi Provincial Thousand Young Talents', year: 2018, organization: 'Jiangxi Province', display_order: 1 },
                 { member_id: professor.id, title: 'Best Paper Award', year: 2010, organization: 'Florida Emerging Paradigms', display_order: 2 },
                 { member_id: undergraduate.id, title: 'Nanchang University Scholarship', year: 2023 },
                 { member_id: masterStudent.id, title: 'Excellent Student Cadre', year: 2021, organization: 'Some University'},
             ],
         });
        console.log(`添加了奖项荣誉测试数据`);
    } else {
         console.warn("跳过添加奖项荣誉，因为一个或多个关键成员未找到。");
     }

    // --- 4. 添加项目和成员 (恢复为 deleteMany + create) ---
    console.log("正在清空并重新填充 Project 表及关系...");
    await prisma.project.deleteMany({ where: { title: { in: [ // 删除特定的种子项目
        'GOOD-DB: Next-Gen Database System Optimization',
        'AI System Efficiency and Sustainability'
    ]}}});
    // 注意：上面的 deleteMany 只删除了项目本身，关联的 ProjectMember 会因级联删除(如果设置了)或保持不变。
    // 为确保关系也被清除，最好也删除 ProjectMember (如果需要绝对干净的状态)
    // await prisma.projectMember.deleteMany({ where: { projectId: { in: [/* 获取旧项目ID列表 */] } }});
    // 这里简化处理，假设 Project 删除即可

    const project1Data: Prisma.ProjectCreateInput = {
        title: 'GOOD-DB: Next-Gen Database System Optimization',
        description: 'Researching and developing novel optimization techniques for database systems on modern hardware.',
        status: 'Ongoing',
        start_year: 2021,
        url: 'http://good.ncu.edu.cn/projects/good-db',
        is_featured: true,
        members: {
            create: [
                { member_id: 'ZichenXu', role: 'PI' },
                { member_id: 'KeXu', role: 'Participant' },
            ],
        },
    };
    const project1 = await prisma.project.create({ data: project1Data });
    console.log(`创建了项目: ${project1.title}`);

    const project2Data: Prisma.ProjectCreateInput = {
        title: 'AI System Efficiency and Sustainability',
        description: 'Optimizing AI model training and inference for better performance and lower energy consumption.',
        status: 'Ongoing',
        start_year: 2022,
        members: {
            create: [
                { member_id: 'ZichenXu', role: 'PI'},
                { member_id: 'WeihanYi', role: 'Undergraduate Researcher'},
            ]
        }
    };
    const project2 = await prisma.project.create({ data: project2Data });
    console.log(`创建了项目: ${project2.title}`);


    // --- 5. 添加出版物和作者关系 (使用 upsert 和修正后的 update 块) ---
    console.log("正在创建/更新 Publication 表及关系...");
    const pub1DOI = '10.1234/jds.2024.001';
    const pub1Data: Prisma.PublicationCreateInput = {
        title: 'A Survey on Modern Database Optimization Techniques',
        venue: 'Journal of Database Systems (JDS)',
        year: 2024,
        ccf_rank: 'A',
        type: PublicationType.JOURNAL,
        doi_url: pub1DOI,
        pdf_url: '/pdfs/survey_db_opt.pdf',
        abstract: 'This paper surveys recent advances in database optimization...',
        authors: {
            create: [
                { member_id: 'ZichenXu', author_order: 1, is_corresponding_author: true },
                { member_id: 'KeXu', author_order: 2 },
            ],
        },
    };
    await prisma.publication.upsert({
        where: { doi_url: pub1DOI }, // 使用 unique doi_url
        update: {
            title: pub1Data.title,
            venue: pub1Data.venue,
            year: pub1Data.year,
            ccf_rank: pub1Data.ccf_rank,
            type: pub1Data.type,
            pdf_url: pub1Data.pdf_url,
            abstract: pub1Data.abstract,
            authors: {
                deleteMany: {},
                // 安全访问: 使用可选链 ?. 和空值合并 ??
                create: pub1Data.authors?.create ?? [],
            }
        },
        create: pub1Data,
    });
    console.log(`创建/更新了出版物: ${pub1Data.title}`);

    const pub2DOI = '10.5678/icais.2023.015';
    const pub2Data: Prisma.PublicationCreateInput = {
        title: 'Efficient Scheduling for Distributed AI Training',
        venue: 'International Conference on AI Systems (ICAIS)',
        year: 2023,
        ccf_rank: 'B',
        type: PublicationType.CONFERENCE,
        doi_url: pub2DOI,
        pdf_url: 'https://arxiv.org/abs/2305.xxxx',
        authors: {
            create: [
                { member_id: 'ZichenXu', author_order: 1},
                { member_id: 'WeihanYi', author_order: 2},
                { member_id: 'KeXu', author_order: 3},
            ]
        }
    };
    await prisma.publication.upsert({
        where: { doi_url: pub2DOI }, // 使用 unique doi_url
        update: {
             title: pub2Data.title,
             venue: pub2Data.venue,
             year: pub2Data.year,
             ccf_rank: pub2Data.ccf_rank,
             type: pub2Data.type,
             pdf_url: pub2Data.pdf_url,
             authors: {
                deleteMany: {},
                 // 安全访问: 使用可选链 ?. 和空值合并 ??
                create: pub2Data.authors?.create ?? [],
            }
        },
        create: pub2Data,
    });
    console.log(`创建/更新了出版物: ${pub2Data.title}`);


    // --- 6. 添加教学经历 (Idempotent via deleteMany + createMany) ---
    if (professor && masterStudent) {
         console.log("正在清空并重新填充 Teaching 表...");
         await prisma.teaching.deleteMany({ where: { member_id: { in: [professor.id, masterStudent.id] } } });
         await prisma.teaching.createMany({
            data: [
                { member_id: professor.id, course_title: 'Introduction to Artificial Intelligence', semester: 'Fall 2024', role: 'Instructor' },
                { member_id: professor.id, course_title: 'Graduate Course Introduction to Combinatorics', semester: 'Fall 2024', role: 'Instructor' },
                { member_id: masterStudent.id, course_title: 'Data Structures', semester: 'Spring 2023', role: 'TA', university: 'Nanchang University'},
            ],
        });
        console.log(`添加了教学经历测试数据`);
    } else {
        console.warn("跳过添加教学经历，因为一个或多个关键成员未找到。");
    }

    // --- 7. 添加学术服务 (Idempotent via deleteMany + createMany) ---
    if (professor) {
         console.log("正在清空并重新填充 AcademicService 表...");
         await prisma.academicService.deleteMany({ where: { member_id: professor.id } });
         await prisma.academicService.createMany({
            data: [
                { member_id: professor.id, role: 'PC Member', event: 'Some Conference 2025', year: 2025},
                { member_id: professor.id, role: 'Reviewer', event: 'Some Journal', year: 2024},
            ],
        });
        console.log(`添加了学术服务测试数据`);
    } else {
        console.warn("跳过添加学术服务，因为教授未找到。");
    }


    // --- 其他表 ---
    console.log(`跳过填充 Presentations, Software/Datasets, Patents, News 表 (无测试数据)`);

}

// --- 执行主函数并处理结果 ---
main()
    .then(async () => {
        console.log('测试数据填充成功！');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('填充测试数据时出错:', e);
        await prisma.$disconnect();
        process.exit(1);
    });