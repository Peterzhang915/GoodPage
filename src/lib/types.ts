// src/lib/types.ts
// 从 prisma.ts 重新导出的类型中导入基础类型和 Enum
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
  PublicationAuthor,
  MemberStatus, // 确保 MemberStatus 从 @/lib/prisma (或 @prisma/client) 正确导出为值
  Prisma, // Prisma 命名空间，用于 GetPayload
} from "@/lib/prisma"; // 确保路径正确

// --- 定义前端需要的复合数据类型 ---

// 用于成员卡片的数据结构
export type MemberForCard = Pick<
  Member,
  | "id"
  | "name_en"
  | "name_zh"
  | "status"
  | "title_zh"
  | "title_en"
  | "avatar_url"
  | "enrollment_year"
  | "favorite_emojis"
  | "research_interests"
> & { displayStatus: string };

// 【新增】定义智能作者显示结构
export type DisplayAuthor =
  | {
      type: "internal";
      id: string;
      name_en: string;
      name_zh: string | null;
      order: number;
      is_corresponding?: boolean; // 可选，如果需要显示通讯作者标记
    }
  | {
      type: "external";
      text: string; // 外部作者直接显示文本
      order: number;
    };

// 用于出版物列表和详情的、包含格式化作者的数据结构
// 【修改】 使用 displayAuthors 替代旧的 authors
export type PublicationInfo = Omit<
  Publication,
  "createdAt" | "updatedAt" | "authors"
> & {
  displayAuthors: DisplayAuthor[]; // 新增：结构化的作者列表
  // authors?: AuthorInfo[]; // 旧的内部作者列表，可以移除或标记为可选/弃用
  // authors_full_string?: string | null; // 这个字段现在主要在后端处理，前端不需要直接用
};

// 【新增】为作者信息定义具名类型 (这个类型现在主要在后端处理时用，前端用 DisplayAuthor)
export type InternalAuthorInfo = {
  id: string;
  name_zh: string | null;
  name_en: string;
  is_corresponding?: boolean;
  author_order: number; // 加入 author_order
};

// 定义 getMemberProfileData 中 include 查询参数的对象
// 【修改】确保 Publication include 中包含 authors_full_string，并调整 authors 关联的 include
export const memberProfileIncludeArgs = {
  educationHistory: { orderBy: { end_year: "desc" } },
  awards: { orderBy: [{ year: "desc" }, { display_order: "asc" }] },
  projects: {
    include: { project: true },
    orderBy: { project: { start_year: "desc" } },
  },
  teachingRoles: { orderBy: [{ year: "desc" }, { display_order: "asc" }] },
  presentations: { orderBy: [{ year: "desc" }, { display_order: "asc" }] },
  softwareAndDatasets: { orderBy: { display_order: "asc" } },
  patents: { orderBy: { issue_date: "desc" } },
  academicServices: { orderBy: { display_order: "asc" } },
  authoredPublications: {
    // 注意：这里获取的是 PublicationAuthor 记录
    orderBy: { author_order: "asc" }, // 排序 PublicationAuthor
    include: {
      publication: {
        // 包含关联的 Publication
        select: {
          // 选择 Publication 的字段
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
          authors_full_string: true, // 必须包含原始作者字符串
          authors: {
            // 包含关联的 PublicationAuthor (用于获取内部作者信息)
            select: {
              author_order: true, // 需要顺序
              is_corresponding_author: true, // 需要通讯作者标记
              author: {
                // 关联的 Member
                select: { id: true, name_en: true, name_zh: true },
              },
            },
            orderBy: { author_order: "asc" }, // 确保内部作者列表有序
          },
        },
      },
    },
  },
  supervisor: { select: { id: true, name_zh: true, name_en: true } },
  supervisees: {
    select: {
      id: true,
      name_zh: true,
      name_en: true,
      status: true,
      avatar_url: true,
    },
    orderBy: [{ enrollment_year: "asc" }],
  },
  newsMentions: { orderBy: { createdAt: "desc" }, take: 5 },
} satisfies Prisma.MemberInclude;

// 使用 GetPayload 获取精确的、包含 include 数据的 Member 类型
// 【修改】直接在 MemberPayload 上扩展 Member 基础类型，确保所有字段可用
export type MemberPayload = Prisma.MemberGetPayload<{
  include: typeof memberProfileIncludeArgs;
}> &
  Member;

// 这个类型现在可能不太需要了，因为我们直接在 Publication select 中获取所需信息
// export type PopulatedPublicationAuthor = Prisma.PublicationAuthorGetPayload<{...}>;

// 这个类型也可能不再需要，因为我们直接在 Publication select 中获取
// export type IncludedPublicationAuthor = Prisma.PublicationAuthorGetPayload<{...}>;

// 成员主页所需的所有数据的聚合类型
// 【修改】确保 publications 数组类型为 PublicationInfo (包含 displayAuthors)
export type MemberProfileData = MemberPayload & {
  displayStatus: string;
  publications: PublicationInfo[]; // 使用更新后的 PublicationInfo
};

// --- 新增：照片墙相关类型 ---

/**
 * Defines the structure for an image object used in the photo gallery.
 */
export type GalleryImage = {
  id: string | number; // Unique identifier for the image (string or number)
  src: string; // Source URL of the image
  alt: string; // Alternative text for accessibility
  category: string; // Category the image belongs to
  caption?: string; // Optional caption for the image
  date?: string; // Optional date associated with the image
};
