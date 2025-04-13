// src/lib/types.ts
// 从 prisma.ts 重新导出的类型中导入基础类型和 Enum
import type {
    Member, Publication, Education, Award, Project, ProjectMember, Teaching,
    Presentation, SoftwareDataset, Patent, AcademicService, News, PublicationAuthor,
    MemberStatus, // 确保 MemberStatus 从 @/lib/prisma (或 @prisma/client) 正确导出为值
    Prisma // Prisma 命名空间，用于 GetPayload
} from '@/lib/prisma'; // 确保路径正确

// --- 定义前端需要的复合数据类型 ---

// 用于成员卡片的数据结构
export type MemberForCard = Pick<
  Member,
  | 'id' | 'name_en' | 'name_zh' | 'status' | 'title_zh' | 'title_en'
  | 'avatar_url' | 'enrollment_year' | 'favorite_emojis' | 'research_interests'
> & { displayStatus: string };

// 用于出版物列表和详情的、包含格式化作者的数据结构
export type PublicationInfo = Omit<Publication, 'createdAt' | 'updatedAt' | 'authors_full_string'> & {
    authors: AuthorInfo[]; // 【修改】使用 AuthorInfo 类型
};


// 【新增】为作者信息定义具名类型
export type AuthorInfo = {
    id: string;
    name_zh: string | null;
    name_en: string;
    is_corresponding?: boolean;
};

// 定义 getMemberProfileData 中 include 查询参数的对象
// 【修复 TS2353】: 移除最外层的 include: {}
export const memberProfileIncludeArgs = {
    // 直接列出要 include 的关联字段及其选项
    educationHistory: { orderBy: { end_year: 'desc' } },
    awards: { orderBy: [{ year: 'desc' }, { display_order: 'asc' }] },
    projects: { include: { project: true }, orderBy: { project: { start_year: 'desc' } } },
    teachingRoles: { orderBy: [{ year: 'desc' }, { display_order: 'asc' }] },
    presentations: { orderBy: [{ year: 'desc' }, { display_order: 'asc' }] },
    softwareAndDatasets: { orderBy: { display_order: 'asc' } },
    patents: { orderBy: { issue_date: 'desc' } },
    academicServices: { orderBy: [{ year: 'desc' }, { display_order: 'asc' }] },
    authoredPublications: {
        include: {
            publication: {
                include: {
                    authors: {
                        orderBy: { author_order: 'asc'},
                        include: { author: { select: { id: true, name_zh: true, name_en: true }}}
                    }
                }
            }
        },
        orderBy: { author_order: 'asc' }
    },
    supervisor: { select: { id: true, name_zh: true, name_en: true } },
    supervisees: {
        select: { id: true, name_zh: true, name_en: true, status: true, avatar_url: true },
        // 【修复 TS2344/TS2322】: 将 orderBy 值改为数组形式
        orderBy: [{ enrollment_year: 'asc' }]
    },
    newsMentions: { orderBy: { createdAt: 'desc' }, take: 5 }

} satisfies Prisma.MemberInclude; // 使用 satisfies 确保结构符合 MemberInclude 类型

// 使用 GetPayload 获取精确的、包含 include 数据的 Member 类型
// 注意：这里的 typeof memberProfileIncludeArgs 现在直接是 Include 对象本身
export type MemberPayload = Prisma.MemberGetPayload<{ include: typeof memberProfileIncludeArgs }>;


export type PopulatedPublicationAuthor = Prisma.PublicationAuthorGetPayload<{
    include: {
        publication: {
             include: {
                authors: {
                    orderBy: { author_order: 'asc'},
                    include: {
                        author: { select: { id: true, name_zh: true, name_en: true }}
                    }
                }
            }
        }
    }
}>;

// 定义 Publication 关联的 Author 列表元素的精确类型
// (这个定义依赖于上面的 authoredPublications.include.publication.include.authors 的结构)
// 【续写并完成】
export type IncludedPublicationAuthor = Prisma.PublicationAuthorGetPayload<{
    include: { author: { select: { id: true; name_zh: true; name_en: true } } }
}>;


// 成员主页所需的所有数据的聚合类型
export type MemberProfileData = MemberPayload & {
  displayStatus: string;
  publications: PublicationInfo[]; // 包含格式化后的出版物列表
  // MemberPayload 中已包含 educationHistory, awards 等数组
};
