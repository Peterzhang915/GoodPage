// src/lib/members.ts
import prisma from "@/lib/prisma"; // 导入 Prisma Client 单例实例
// 从 @prisma/client 导入 Prisma 命名空间和所有 Enum 值
import { Prisma, MemberStatus, Education } from "@prisma/client"; // Import Enums like MemberStatus and Models like Education as values
import type {
  // 从 @prisma/client 导入所有模型类型
  Member,
  Publication,
  Award,
  Project,
  ProjectMember,
  Teaching,
  Presentation,
  SoftwareDataset, // Import Model types using 'import type'
  Patent,
  AcademicService,
  News,
  // Education type is already imported as a value above, which also provides the type
} from "@prisma/client";
// 导入在新文件中定义的复合类型
import type {
  MemberForCard,
  MemberProfileData,
  PublicationInfo,
  DisplayAuthor,
} from "@/lib/types";
// 注意：不再需要 memberProfileIncludeArgs 和其他 Payload 类型，因为我们简化了查询

/**
 * Calculates a display-friendly status string for a member based on their status and enrollment year.
 * Example: "21 Grade Ph.D. Student", "Professor", "Alumni".
 * @param member - A member object containing at least status, enrollment_year, and title_zh.
 * @returns A display string or null.
 */
export function calculateMemberGradeStatus(
  member: Pick<Member, "status" | "enrollment_year" | "title_zh">
): string {
  const currentYear = new Date().getFullYear();
  const yearSuffix = member.enrollment_year ? String(member.enrollment_year).slice(-2) : null;

  switch (member.status) {
    case MemberStatus.PROFESSOR:
      return member.title_zh || "Professor";
    case MemberStatus.POSTDOC:
      return "Postdoc";
    case MemberStatus.PHD_STUDENT:
      return yearSuffix ? `${yearSuffix} Grade Ph.D. Student` : "Ph.D. Student";
    case MemberStatus.MASTER_STUDENT:
      return yearSuffix ? `${yearSuffix} Grade Master Student` : "Master Student";
    case MemberStatus.UNDERGRADUATE:
       if (member.enrollment_year) {
         const grade = currentYear - member.enrollment_year + 1;
         if (grade >= 1 && grade <= 4) {
           return `${yearSuffix} Grade Undergraduate (Year ${grade})`;
         } else {
           return `${yearSuffix} Grade Undergraduate`; // Graduated or special case
         }
       } else {
           return "Undergraduate";
       }
    case MemberStatus.VISITING_SCHOLAR:
      return "Visiting Scholar";
    case MemberStatus.RESEARCH_STAFF:
      return "Research Staff";
    case MemberStatus.ALUMNI:
      return "Alumni";
    case MemberStatus.OTHER:
    default:
      // Ensure a non-null string is always returned
      const statusString = member.status
          ? member.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : "Member"; // Default if status is somehow null/undefined
      return statusString || "Unknown Status"; // Final fallback
  }
}

type EducationFormData = Partial<Omit<Education, 'id' | 'member_id' | 'member'>>;

// --- 数据获取函数 ---

/**
 * 获取所有公开成员信息，用于成员列表页。
 * 在代码中进行分组和排序。
 * @returns 按状态分组的 MemberForCard 数组对象
 */
export async function getAllMembersGrouped(): Promise<
  Record<string, MemberForCard[]>
> {
  console.log("DB: 获取所有公开成员信息 (用于分组)");
  try {
    const members = await prisma.member.findMany({
      where: { is_profile_public: true },
      select: {
        // 选择卡片所需字段
        id: true,
        name_en: true,
        name_zh: true,
        status: true,
        title_zh: true,
        title_en: true,
        avatar_url: true,
        enrollment_year: true,
        favorite_emojis: true,
        research_interests: true,
      },
      orderBy: [{ enrollment_year: "asc" }, { name_en: "asc" }], // 数据库层面基础排序
    });
    console.log(`DB: 获取到 ${members.length} 位成员`);

    // 定义 SelectedMember 类型以注解 map 回调参数 m
    type SelectedMember = (typeof members)[0];

    // 计算显示状态
    const membersWithStatus: MemberForCard[] = members.map(
      (m: SelectedMember) => ({
        ...m,
        displayStatus: calculateMemberGradeStatus(
          m as Pick<Member, "status" | "enrollment_year" | "title_zh">,
        ), // 确保类型匹配
      }),
    );

    // 按状态分组
    const grouped: Record<string, MemberForCard[]> = {};
    membersWithStatus.forEach((member) => {
      const groupKey = member.status || MemberStatus.OTHER; // 使用导入的 Enum
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(member);
    });

    // 定义分组顺序
    const statusOrder: Record<MemberStatus, number> = {
      [MemberStatus.PROFESSOR]: 1,
      [MemberStatus.POSTDOC]: 2,
      [MemberStatus.PHD_STUDENT]: 3,
      [MemberStatus.MASTER_STUDENT]: 4,
      [MemberStatus.UNDERGRADUATE]: 5,
      [MemberStatus.VISITING_SCHOLAR]: 6,
      [MemberStatus.RESEARCH_STAFF]: 7,
      [MemberStatus.ALUMNI]: 8,
      [MemberStatus.OTHER]: 99,
    };

    // 按自定义顺序对分组进行排序
    const sortedGroupedData: Record<string, MemberForCard[]> = {};
    Object.keys(grouped)
      .sort(
        (a, b) =>
          (statusOrder[a as MemberStatus] || 99) -
          (statusOrder[b as MemberStatus] || 99),
      )
      .forEach((key) => {
        // 组内排序
        sortedGroupedData[key] = grouped[key].sort((a, b) => {
          const yearA = a.enrollment_year ?? Infinity;
          const yearB = b.enrollment_year ?? Infinity;
          const isStudentA =
            a.status === MemberStatus.PHD_STUDENT ||
            a.status === MemberStatus.MASTER_STUDENT ||
            a.status === MemberStatus.UNDERGRADUATE;

          if (yearA !== yearB) {
            return isStudentA ? yearA - yearB : yearB - yearA; // 学生升序，其他降序
          }
          // 使用 ?? '' 保证 localeCompare 操作字符串
          return (a.name_en ?? a.name_zh ?? "").localeCompare(
            b.name_en ?? b.name_zh ?? "",
          );
        });
      });
    return sortedGroupedData;
  } catch (error) {
    console.error("获取所有成员信息失败:", error);
    throw new Error("Failed to fetch members.");
  }
}

/**
 * 根据 ID 获取单个成员的完整档案信息。
 * 实现智能作者显示逻辑：合并 authors_full_string 和内部关联作者。
 * @param id - 成员的唯一 ID (string)
 * @returns 包含所有关联数据的成员对象 MemberProfileData，或 null
 */
export async function getMemberProfileData(
  id: string,
): Promise<MemberProfileData | null> {
  console.log(`DB: 开始获取成员 ${id} 的完整档案`);
  try {
    // 1. 获取成员基本信息 + 简单直接关联 (导师/学生)
    const member = await prisma.member.findUnique({
      where: { id: id, is_profile_public: true },
      include: {
        // 只 include 简单的直接关系或必要的 select
        supervisor: { select: { id: true, name_zh: true, name_en: true } },
        supervisees: {
          select: {
            id: true,
            name_zh: true,
            name_en: true,
            status: true,
            avatar_url: true,
          },
          orderBy: { enrollment_year: "asc" },
        },
      },
    });

    if (!member) {
      console.log(`DB: 未找到 ID 为 ${id} 的公开成员档案`);
      return null;
    }
    console.log(`DB: 成功获取成员 ${id} 基础信息`);

    // 2. 分别获取其他所有关联数据 (包括出版物及其完整作者信息)
    console.log(`DB: 开始获取成员 ${id} 的关联数据...`);
    const [
      educationHistory,
      awards,
      projectMembersRaw,
      teachingRoles,
      presentations,
      softwareAndDatasets,
      patents,
      academicServices,
      newsMentions,
      memberPublicationsRaw,
    ] = await Promise.all([
      prisma.education.findMany({
        where: { member_id: id },
        orderBy: { end_year: "desc" },
      }),
      prisma.award.findMany({
        where: { member_id: id },
        orderBy: [{ year: "desc" }, { display_order: "asc" }],
      }),
      prisma.projectMember.findMany({
        where: { member_id: id },
        include: { project: true },
        orderBy: { project: { start_year: "desc" } },
      }),
      prisma.teaching.findMany({
        where: { member_id: id },
        orderBy: [{ year: "desc" }, { display_order: "asc" }],
      }),
      prisma.presentation.findMany({
        where: { member_id: id },
        orderBy: [{ year: "desc" }, { display_order: "asc" }],
      }),
      prisma.softwareDataset.findMany({
        where: { member_id: id },
        orderBy: { display_order: "asc" },
      }),
      prisma.patent.findMany({
        where: { member_id: id },
        orderBy: { issue_date: "desc" },
      }),
      prisma.academicService.findMany({
        where: { member_id: id },
        orderBy: [{ display_order: "asc" }],
      }),
      prisma.news.findMany({
        where: { related_member_id: id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.publication.findMany({
        // 获取该成员的论文
        where: { authors: { some: { member_id: id } } },
        orderBy: [{ year: "desc" }, { id: "desc" }],
        select: {
          // 选择 Publication 的所有需要字段 + authors 关联
          id: true,
          title: true,
          venue: true,
          year: true,
          volume: true,
          number: true,
          pages: true,
          publisher: true,
          ccf_rank: true,
          dblp_url: true,
          pdf_url: true,
          abstract: true,
          keywords: true,
          type: true,
          slides_url: true,
          video_url: true,
          code_repository_url: true,
          project_page_url: true,
          is_peer_reviewed: true,
          publication_status: true,
          authors_full_string: true,
          authors: {
            // 包含关联的 PublicationAuthor (用于获取内部作者信息)
            select: {
              author_order: true,
              is_corresponding_author: true,
              author: {
                // 关联的 Member
                select: { id: true, name_en: true, name_zh: true },
              },
            },
            orderBy: { author_order: "asc" }, // 确保内部作者列表有序
          },
        },
      }),
    ]);
    console.log(`DB: 成功获取成员 ${id} 的所有关联数据`);

    // 3. 格式化出版物列表 (实现智能作者显示)
    // First, get PublicationAuthor records specifically for this member to access isFeatured and order
    const publicationAuthorRecords = await prisma.publicationAuthor.findMany({
        where: {
            member_id: id,
            publication_id: { in: memberPublicationsRaw.map((p: PublicationWithAuthorsPayload) => p.id) }
        },
        select: { // Select only the necessary fields
            publication_id: true,
            isFeaturedOnProfile: true,
            profileDisplayOrder: true,
        }
    });

    // Create a map for easy lookup of isFeatured and order by publication_id
    const pubAuthorDetailsMap = new Map<number, { isFeatured: boolean; order: number | null }>();
    publicationAuthorRecords.forEach((pa: { publication_id: number; isFeaturedOnProfile: boolean | null; profileDisplayOrder: number | null }) => {
        pubAuthorDetailsMap.set(pa.publication_id, {
            isFeatured: pa.isFeaturedOnProfile ?? false,
            order: pa.profileDisplayOrder // Keep null as null
        });
    });

    type PublicationWithAuthorsPayload = Prisma.PublicationGetPayload<{
      select: {
        id: true;
        title: true;
        venue: true;
        year: true;
        volume: true;
        number: true;
        pages: true;
        publisher: true;
        ccf_rank: true;
        dblp_url: true;
        pdf_url: true;
        abstract: true;
        keywords: true;
        type: true;
        slides_url: true;
        video_url: true;
        code_repository_url: true;
        project_page_url: true;
        is_peer_reviewed: true;
        publication_status: true;
        authors_full_string: true;
        authors: {
          select: {
            author_order: true;
            is_corresponding_author: true;
            author: {
              select: { id: true; name_en: true; name_zh: true };
            };
          };
          orderBy: { author_order: "asc" };
        };
      };
    }>;

    let publicationsFormatted: PublicationInfo[] = memberPublicationsRaw.map(
      (p: PublicationWithAuthorsPayload): PublicationInfo => {
        // 将内部作者信息提取到 Map 中，方便按 order 查找
        const internalAuthorsMap = new Map<
          number,
          {
            id: string;
            name_en: string;
            name_zh: string | null;
            is_corresponding: boolean;
          }
        >();
        p.authors.forEach((ap: { author_order: number; is_corresponding_author: boolean; author: { id: string; name_en: string; name_zh: string | null } }) => {
          internalAuthorsMap.set(ap.author_order, {
            id: ap.author.id,
            name_en: ap.author.name_en,
            name_zh: ap.author.name_zh,
            is_corresponding: ap.is_corresponding_author,
          });
        });

        const displayAuthors: DisplayAuthor[] = [];
        const authorString = p.authors_full_string;

        if (authorString) {
          const fragments = authorString
            .split(";")
            .map((f: string) => f.trim())
            .filter((f: string) => f);
          fragments.forEach((fragment: string, index: number) => {
            const internalAuthor = internalAuthorsMap.get(index);
            if (internalAuthor) {
              // 匹配到内部作者
              displayAuthors.push({
                type: "internal",
                id: internalAuthor.id,
                name_en: internalAuthor.name_en,
                name_zh: internalAuthor.name_zh,
                order: index,
                is_corresponding: internalAuthor.is_corresponding,
              });
            } else {
              // 未匹配到内部作者，作为外部作者处理
              displayAuthors.push({
                type: "external",
                text: fragment, // 直接使用原始片段
                order: index,
              });
            }
          });
        } else {
          // 如果没有 authors_full_string，则回退到只显示内部作者 (可能不理想)
          console.warn(
            `Publication ID ${p.id} is missing authors_full_string. Falling back to internal authors only.`,
          );
          p.authors.forEach((ap: { author_order: number; is_corresponding_author: boolean; author: { id: string; name_en: string; name_zh: string | null } }) => {
            displayAuthors.push({
              type: "internal",
              id: ap.author.id,
              name_en: ap.author.name_en,
              name_zh: ap.author.name_zh,
              order: ap.author_order,
              is_corresponding: ap.is_corresponding_author,
            });
          });
        }

        // Get the featured status and order from the map
        const authorDetails = pubAuthorDetailsMap.get(p.id) || { isFeatured: false, order: null };

        // Construct the final PublicationInfo object explicitly
        // Ensuring all fields required by PublicationInfo are present and correctly typed
        return {
            id: p.id,
            title: p.title,
            year: p.year,
            venue: p.venue,
            ccf_rank: p.ccf_rank,
            pdf_url: p.pdf_url,
            code_repository_url: p.code_repository_url,
            project_page_url: p.project_page_url,
            video_url: p.video_url,
            slides_url: p.slides_url,
            number: p.number,
            volume: p.volume,
            pages: p.pages,
            publisher: p.publisher,
            abstract: p.abstract,
            type: p.type,
            displayAuthors: displayAuthors,
            isFeatured: authorDetails.isFeatured,
            profileDisplayOrder: authorDetails.order,
            // publicationAuthors: p.authors // Removed: Not assigning raw authors relation
        };
      },
    );

    // Sort the formatted publications based on profileDisplayOrder
    publicationsFormatted.sort((a, b) => {
        const orderA = a.profileDisplayOrder ?? Infinity; // Treat null/undefined as last
        const orderB = b.profileDisplayOrder ?? Infinity;
        if (orderA !== orderB) {
            return orderA - orderB; // Sort by order first
        }
        // If order is the same or both are null, fallback to year descending
        const yearA = a.year ?? 0;
        const yearB = b.year ?? 0;
        return yearB - yearA;
    });

    // 4. 计算显示状态
    const displayStatus = calculateMemberGradeStatus(member);

    // 5. 组装最终返回给页面的对象 (符合 MemberProfileData 类型)
    const profileData = {
      ...member,
      displayStatus,
      educationHistory,
      awards,
      projects: projectMembersRaw, // 注意：这里还是原始的，如果前端需要格式化，也要处理
      teachingRoles,
      presentations,
      softwareAndDatasets,
      patents,
      academicServices,
      publications: publicationsFormatted, // 使用格式化后的出版物列表
      newsMentions,
    };

    console.log(`DB: 成功组装成员 ${id} 的完整档案`);
    return profileData as MemberProfileData;
  } catch (error) {
    console.error(`获取成员 ${id} 档案失败:`, error);
    throw new Error(`Failed to retrieve profile for member ${id}`);
  }
}

/**
 * 获取所有成员信息，用于管理列表。
 * @returns 排序后的 Member 数组
 */
export async function getAllMembersForManager(): Promise<Member[]> {
  console.log("DB: 获取所有成员信息 (用于管理列表)");
  try {
    const members = await prisma.member.findMany({
      // Fetch full Member objects
      orderBy: [
        { enrollment_year: "asc" },
        { name_en: "asc" },
      ],
    });
    console.log(`DB: 获取到 ${members.length} 位成员 (管理列表)`);

    // Define status order mapping (ensure this is defined only once)
    const statusOrderMap: Record<MemberStatus, number> = {
      [MemberStatus.PROFESSOR]: 1,
      [MemberStatus.POSTDOC]: 2,
      [MemberStatus.PHD_STUDENT]: 3,
      [MemberStatus.MASTER_STUDENT]: 4,
      [MemberStatus.UNDERGRADUATE]: 5,
      [MemberStatus.VISITING_SCHOLAR]: 6,
      [MemberStatus.RESEARCH_STAFF]: 7,
      [MemberStatus.ALUMNI]: 8,
      [MemberStatus.OTHER]: 99,
    };

    // Sort the flat list
    const sortedMemberList = [...members].sort((a, b) => {
      const statusA = a.status || MemberStatus.OTHER;
      const statusB = b.status || MemberStatus.OTHER;
      const orderA = statusOrderMap[statusA] || 99;
      const orderB = statusOrderMap[statusB] || 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      const yearA = a.enrollment_year ?? Infinity;
      const yearB = b.enrollment_year ?? Infinity;
      const isStudentA =
        a.status === MemberStatus.PHD_STUDENT ||
        a.status === MemberStatus.MASTER_STUDENT ||
        a.status === MemberStatus.UNDERGRADUATE;
      
      if (yearA !== yearB && yearA !== Infinity && yearB !== Infinity) { 
        return isStudentA ? yearA - yearB : yearB - yearA;
      }
      // Ensure consistent return type (number) even if years are Infinity
      if (yearA !== yearB) { 
        // If one year is Infinity (null), treat it as larger/smaller consistently
        return yearA === Infinity ? 1 : -1; // Treat null year as "later"
      }

      return (a.name_en ?? a.name_zh ?? "").localeCompare(
        b.name_en ?? b.name_zh ?? "",
      );
    });

    return sortedMemberList;
  } catch (error) {
    console.error("获取所有成员信息 (管理列表) 失败:", error);
    throw new Error("Failed to fetch members for manager.");
  }
}

// --- Education CRUD Functions --- 

/**
 * Get a single education record by its ID.
 */
export async function getEducationRecordById(educationId: number): Promise<Education | null> {
  console.log(`DB: 获取教育记录 ID: ${educationId}`);
  try {
    const education = await prisma.education.findUnique({
      where: { id: educationId },
    });
    if (!education) {
      console.log(`DB: 未找到教育记录 ID: ${educationId}`);
      return null;
    }
    console.log(`DB: 成功获取教育记录 ID: ${educationId}`);
    return education;
  } catch (error) {
    console.error(`获取教育记录 ID ${educationId} 失败:`, error);
    throw new Error("Failed to fetch education record.");
  }
}

/**
 * Create a new education record for a member.
 */
export async function createEducationRecord(memberId: string, data: EducationFormData): Promise<Education> {
  console.log(`DB: 为成员 ${memberId} 创建新的教育记录`);
  
  if (!data.degree || !data.school) {
    throw new Error("Degree and School are required fields for creating education record.");
  }

  try {
    const processedData = {
      degree: data.degree, 
      school: data.school, 
      field: data.field ?? null, 
      start_year: data.start_year ? Number(data.start_year) : null,
      end_year: data.end_year ? Number(data.end_year) : null,
      thesis_title: data.thesis_title ?? null,
      description: data.description ?? null,
      display_order: data.display_order ? Number(data.display_order) : 0,
    };

    const newEducation = await prisma.education.create({
      data: {
        ...processedData, 
        member_id: memberId, 
      },
    });
    console.log(`DB: 成功为成员 ${memberId} 创建教育记录 ID: ${newEducation.id}`);
    return newEducation;
  } catch (error) {
    console.error(`为成员 ${memberId} 创建教育记录失败:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        console.error(`Foreign key constraint failed (P2003) for member ID: ${memberId}`);
      }
      // It's often better to let the original error propagate or wrap it
      // throw new Error(`Database error during education record creation: ${error.message}`);
    }
    throw new Error("Failed to create education record.");
  }
}

/**
 * Update an existing education record.
 */
export async function updateEducationRecord(educationId: number, data: EducationFormData): Promise<Education> {
  console.log(`DB: 更新教育记录 ID: ${educationId}`);
  try {
    const processedData = {
      ...data,
      start_year: data.start_year ? Number(data.start_year) : data.start_year === null ? null : undefined, 
      end_year: data.end_year ? Number(data.end_year) : data.end_year === null ? null : undefined,
      display_order: data.display_order ? Number(data.display_order) : data.display_order === 0 ? 0 : undefined,
    };
    Object.keys(processedData).forEach(key => processedData[key as keyof typeof processedData] === undefined && delete processedData[key as keyof typeof processedData]);
    
    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: processedData,
    });
    console.log(`DB: 成功更新教育记录 ID: ${educationId}`);
    return updatedEducation;
  } catch (error) {
    console.error(`更新教育记录 ID ${educationId} 失败:`, error);
    throw new Error("Failed to update education record.");
  }
}

/**
 * Delete an education record by its ID.
 */
export async function deleteEducationRecord(educationId: number): Promise<Education> {
  console.log(`DB: 删除教育记录 ID: ${educationId}`);
  try {
    const deletedEducation = await prisma.education.delete({
      where: { id: educationId },
    });
    console.log(`DB: 成功删除教育记录 ID: ${educationId}`);
    return deletedEducation;
  } catch (error) {
    console.error(`删除教育记录 ID ${educationId} 失败:`, error);
    throw new Error("Failed to delete education record.");
  }
}
