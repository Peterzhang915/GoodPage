// src/lib/members.ts
import prisma from "@/lib/prisma"; // 导入 Prisma Client 单例实例
// 导入 Enum 和 Prisma 命名空间 (确保是从 @/lib/prisma 或 @prisma/client 正确导入值)
import { MemberStatus, Prisma } from "@/lib/prisma";
// 导入基础模型类型 (通常已由 prisma.ts 重新导出)
import type {
  Member,
  Publication,
  Education,
  Award,
  Project,
  ProjectMember,
  Teaching,
  Presentation,
  SoftwareDataset,
  Patent,
  AcademicService,
  News,
} from "@/lib/prisma";
import { calculateMemberGradeStatus } from "@/lib/utils"; // 从新位置导入工具函数
// 导入在新文件中定义的复合类型
import type {
  MemberForCard,
  MemberProfileData,
  PublicationInfo,
  DisplayAuthor,
} from "@/lib/types";
// 注意：不再需要 memberProfileIncludeArgs 和其他 Payload 类型，因为我们简化了查询

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
          authors_full_string: true, // 包含原始作者字符串
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
    const publicationsFormatted: PublicationInfo[] = memberPublicationsRaw.map(
      (p) => {
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
        p.authors.forEach((ap) => {
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
            .map((f) => f.trim())
            .filter((f) => f);
          fragments.forEach((fragment, index) => {
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
          p.authors.forEach((ap) => {
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

        // 移除原始的 authors 关联数据，只保留 displayAuthors
        const { authors, ...restOfPub } = p;

        return { ...restOfPub, displayAuthors };
      },
    );

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
