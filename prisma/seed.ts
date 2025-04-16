import { PrismaClient, MemberStatus, PublicationType, Prisma, AwardLevel } from '@prisma/client';
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

            // Special handling for ZichenXu's research interests if needed during CSV processing
            let researchInterests = record.research_interests || null;
            if (memberId === 'ZichenXu') {
              researchInterests = 'My research interests are primarily in the area of computing system design in the development of providing sustainable data services in any system. A common thread in my research is in understanding and rebuilding the traditional computing systems to meet the new design goals, such as sustainability, and constraints, like resource limitation, reliability, and scalability. Broadly speaking, I am a system researcher with a focus on (the design and implementation of) generic optimal and operational data-oriented (GOOD) computing systems.';
            }

            const dataToUpsert: Prisma.MemberUncheckedCreateInput = {
                id: memberId,
                name_en: record.name_en || '',
                status: memberStatus,
                name_zh: record.name_zh || null,
                enrollment_year: parseIntSafe(record.enrollment_year),
                graduation_year: parseIntSafe(record.graduation_year),
                title_zh: record.title_zh || null,
                title_en: record.title_en || null,
                major: record.major || null,
                research_group: record.research_group || null,
                research_interests: researchInterests,
                skills: record.skills || null,
                bio_zh: record.bio_zh || null,
                bio_en: record.bio_en || null,
                more_about_me: record.more_about_me || null,
                interests_hobbies: record.interests_hobbies || null,
                avatar_url: record.avatar_url || null,
                office_location: record.office_location || null,
                office_hours: record.office_hours || null,
                pronouns: record.pronouns || null,
                position: record.position || null,
                email: record.email || null,
                phone_number: record.phone_number || null,
                personal_website: record.personal_website || null,
                cv_url: record.cv_url || null,
                github_username: record.github_username || null,
                linkedin_url: record.linkedin_url || null,
                google_scholar_id: record.google_scholar_id || null,
                favorite_emojis: record.favorite_emojis || null,
                display_order: parseIntSafe(record.display_order) ?? 0,
                is_active: parseBoolSafe(record.is_active, true),
                role_name: record.role_name || null,
                username: record.username || null,
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


    // --- 2. 添加教育经历 (Keep or remove based on your needs) ---
    if (professor /* && other needed members */) {
        console.log("正在清空并重新填充 Education 表 for relevant members...");
        // await prisma.education.deleteMany({ where: { member_id: { in: [professor.id, ...] } } });
        // await prisma.education.createMany({ data: [...] });
        console.log(`Skipping Education seeding for now.`); // Temporarily skip if unsure
    }

    // --- 3. 新增: 填充 ZichenXu 的 服务/奖项/赞助 (Using the new models/data) ---
    if (professor) {
        const memberId = professor.id;
        console.log(`Seeding new data for member: ${memberId}...`);

        // --- Data Parsing (Using full lists provided by user) ---
        const academicServicesRaw = [
          'Artifact Chair, APPT 2025',
          'Local Chair, SiftDB 2025',
          'PC, SenSys 2024',
          'Publicity Chair, CCFSys 2024',
          'Organization Committee, CCF Computility 2024',
          'Organization Committee, CCF Chips 2024',
          'Program Chair, GreenCom 2022', // Kept one instance
          'Guest Associate Editor, SI in IEEE Transactions on Sustainable Computing',
          'Local Chair/PC, CCFsys 2022',
          'PC, CCFsys 2020, CCFChips, 2021',
          '教育部学位中心，评审专家，2020-2025',
          'PC, SoCC, 2022',
          'PC, SSDBM, 2022',
          'PC, NDBC, 2021, 2022',
          'PC, ICPADS, 2021, 2022',
          'Track Chair, IEEE BigData, 2021',
          'Publicity Chair, SSDBM, 2021',
          'PC, HPCChina, 2021',
          'PC, ACM SIGCSE 2020, 2021',
          'Publicity Chair, ICAC (Now ACSOS) 2019, 2020, 2021',
          'PC, ICAC (Now ACSOS) 2015, 2017, 2019, 2020, 2021',
          'Chair, Workshop on Cloud-edge Computing Enabling Novel Computing Architecture, colocated with CTC China 2020',
          'Workshop Chair, ACA 2020',
          'PC, ACM TUR-C 2020',
          'PC, HPBD&IS 2020',
          'PC, NAS 2019',
          'Publicity Chair, IWQoS 2016',
          'Session Chair, INFOCOM 2016',
          'Session Chair, ICDCS 2015',
          'PC, ICDCS 2013, 2020'
        ];
        const awardsAndSponsorshipsRaw = [
          'First Awardee, Provincial Technology Advanced Award, Government of JiangXi, 2024',
          'Co-PI, National R/D Key Project, Ministry of Science and Technology, 2023 - 2025',
          'PI, Provincial R/D Key Project, Department of Technology JiangXi, 2022 - 2024',
          'Principal Investigator, Cambodian Funding, 2021',
          'Co-PI, National R/D Key Project, Ministry of Science and Technology, 2019 - 2022',
          'Principal Investigator, Education Major Grant, Department of Education JiangXi, 2019 - 2021',
          'Co-PI, National KHF Key Project, Ministry of Science and Technology, 2018 - 2020',
          'The 1st selected Jiangxi Provincial Thousand Young Talents, 2018',
          'PI, NSFC Youth Grant, NSFC, 2018 - 2020',
          'PI, Tencent Rhino Bird Grant, Tencent, 2017 - 2018',
          'Principal Investigator, AWS Research Education Grant, Amazon, 2015 - 2017', // Kept one instance
          'PI, Microsoft Azure Research Grant, Microsoft, 2017 - 2018',
          'Finalist in Edward F. Hayes Graduate Research Forum, OSU, February 2015',
          'Student Travel Grant, USENIX Association, June 2013',
          'Principal Investigator, USF Student Challenge Grant, USF, 2010 - 2011',
          'Best Paper Award, Florida Emerging Paradigms conference, April 2010',
          'Student Travel Grant, SIGMOD, June 2010',
          'Conference Presentation Grant, USF, March 2010',
          'Best Research Poster Award, USF, October 2009',
          'Best Undergraduate Thesis, Beijing University of Posts and Telecommunications, July 2007',
          'Finalist in Windows Embedded Student Challenge (WESC), Microsoft, May 2006',
          'Honored Graduate, BUPT, 2007 (Top 8%)'
        ];

        // Define checkIsFeatured function BEFORE its first use
        const checkIsFeatured = (yearOrPeriod: number | string | undefined | null): boolean => {
          if (!yearOrPeriod) return false;
          const currentYear = new Date().getFullYear();
          const checkYear = (y: number) => y >= currentYear - 3; // Last 3 years + current year

          if (typeof yearOrPeriod === 'number') {
            return checkYear(yearOrPeriod);
          } else if (typeof yearOrPeriod === 'string') {
            const match = yearOrPeriod.match(/\b(\d{4})\b/g); // Find all years
            if (match) {
              const lastYear = parseInt(match[match.length - 1], 10);
              return checkYear(lastYear);
            }
          }
          return false;
        };

        // Now use checkIsFeatured
        const academicServicesData: Prisma.AcademicServiceCreateManyInput[] = academicServicesRaw.map((content, index) => {
             const yearMatch = content.match(/\b\d{4}\b/g);
             const period = yearMatch ? yearMatch.join(', ') : null;
             return {
               member_id: memberId,
               content: content,
               display_order: index,
               isFeatured: checkIsFeatured(period), // Now this should work
             };
        });

        const awardsData: Prisma.AwardCreateManyInput[] = [];
        const sponsorshipsData: Prisma.SponsorshipCreateManyInput[] = [];

        let awardOrder = 0;
        let sponsorshipOrder = 0;

        awardsAndSponsorshipsRaw.forEach(item => {
          const lowerCaseItem = item.toLowerCase();

          // Try to extract the last year or period for isFeatured check
          let year: number | undefined = undefined;
          let period: string | undefined = undefined;

          const periodMatch = item.match(/\b(\d{4}\s*-\s*\d{4})\b\s*$/); // YYYY-YYYY at the end
          const yearMatch = item.match(/\(?\b(\d{4})\b\)?\s*$/); // YYYY at the end, optional parentheses

          if (periodMatch) {
            period = periodMatch[1];
          } else if (yearMatch) {
            year = parseInt(yearMatch[1], 10);
          }

          // Differentiate based on keywords - Simplified: just assign to Award or Sponsorship
          if (lowerCaseItem.includes('grant') || lowerCaseItem.includes('funding') || lowerCaseItem.includes('project') || lowerCaseItem.includes(' pi,') || lowerCaseItem.includes('co-pi,')) {
            // Sponsorship/Grant/Project
            sponsorshipsData.push({
              member_id: memberId,
              content: item, // Store the full original string
              period: period ?? (year?.toString()), // Use period if found, else year string
              link_url: null, // Add logic later if needed
              display_order: sponsorshipOrder++,
              isFeatured: checkIsFeatured(period ?? year),
            });
          } else {
            // Award/Honor
            let level: AwardLevel = AwardLevel.OTHER;
            if (lowerCaseItem.includes('best paper') || lowerCaseItem.includes('best poster') || lowerCaseItem.includes('best thesis')) level = AwardLevel.GOLD;
            else if (lowerCaseItem.includes('thousand talents') || lowerCaseItem.includes('provincial technology advanced') || lowerCaseItem.includes('excellent')) level = AwardLevel.SILVER;
            else if (lowerCaseItem.includes('finalist') || lowerCaseItem.includes('honored graduate') || lowerCaseItem.includes('nomination')) level = AwardLevel.BRONZE;

            awardsData.push({
              member_id: memberId,
              content: item, // Store the full original string
              year: year, // Use extracted year (if any)
              level: level,
              link_url: null, // Add logic later if needed
              display_order: awardOrder++,
              isFeatured: checkIsFeatured(year),
            });
          }
        });

        // Clear existing related data for the member
        console.log(`Deleting existing data for ${memberId}...`);
        await prisma.academicService.deleteMany({ where: { member_id: memberId } });
        await prisma.award.deleteMany({ where: { member_id: memberId } });
        await prisma.sponsorship.deleteMany({ where: { member_id: memberId } });
        console.log(`Existing data deleted.`);

        // Create new data using the parsed arrays
        console.log(`Creating ${academicServicesData.length} Academic Service records...`);
        await prisma.academicService.createMany({
            data: academicServicesData,
            // skipDuplicates: true, // Temporarily comment out
        });

        console.log(`Creating ${awardsData.length} Award records...`);
        await prisma.award.createMany({
            data: awardsData,
            // skipDuplicates: true, // Temporarily comment out
        });

        console.log(`Creating ${sponsorshipsData.length} Sponsorship records...`);
        await prisma.sponsorship.createMany({
            data: sponsorshipsData,
            // skipDuplicates: true, // Temporarily comment out
        });

        console.log(`Seeding finished for member: ${memberId}.`);

    } else {
        console.warn("Professor (ZichenXu) not found, skipping Service/Award/Sponsorship seeding.");
    }

    // --- 4. 添加项目和成员 (Keep or remove/comment out based on needs) ---
    // console.log("正在清空并重新填充 Project 表及关系...");
    // await prisma.project.deleteMany({ where: { ... } });
    // ... (project creation logic) ...
    console.log("Skipping Project seeding for now.");

    // --- 5. 添加出版物和作者关系 (Keep or remove/comment out based on needs) ---
    // console.log("正在创建/更新 Publication 表及关系...");
    // ... (publication upsert logic) ...
    console.log("Skipping Publication seeding for now.");

    // --- 6. 添加教学经历 (Keep or remove/comment out based on needs) ---
    // console.log("正在清空并重新填充 Teaching 表...");
    // ... (teaching creation logic) ...
    console.log("Skipping Teaching seeding for now.");

    // --- 7. 添加学术服务 (!!! REMOVE / COMMENT OUT THIS OLD SECTION !!!) ---
    /*
    if (professor) {
         console.log("正在清空并重新填充 AcademicService 表..."); // This is the OLD section
         await prisma.academicService.deleteMany({ where: { member_id: professor.id } });
         await prisma.academicService.createMany({
            data: [
                // THIS USES THE OLD SCHEMA (role, event, year as number)
                { member_id: professor.id, role: 'PC Member', event: 'Some Conference 2025', year: 2025},
                { member_id: professor.id, role: 'Reviewer', event: 'Some Journal', year: 2024},
            ],
        });
        console.log(`添加了学术服务测试数据`);
    } else {
        console.warn("跳过添加学术服务，因为教授未找到。");
    }
    */
    console.log("Removed/Commented out old AcademicService test data section.")


    // --- 其他表 ---
    console.log(`跳过填充其他表 (无测试数据)`);

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