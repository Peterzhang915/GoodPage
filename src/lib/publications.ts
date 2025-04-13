// src/lib/publications.ts
import prisma from '@/lib/prisma'; // 导入 Prisma Client
// 导入在新文件中定义的类型
import type { PublicationInfo } from '@/lib/types';
import type { Publication } from '@/lib/prisma'; // 导入基础类型

/**
 * 获取所有出版物列表（包含格式化的作者列表）。
 * @returns PublicationInfo 数组
 */
export async function getAllPublicationsFormatted(): Promise<PublicationInfo[]> {
     console.log("DB: Fetching all publications.");
    try {
        // 定义查询的类型，以便下面 map 回调能正确推断类型
        const publicationsWithAuthors = await prisma.publication.findMany({
            orderBy: [{ year: 'desc' }, { id: 'desc' }],
            include: {
                authors: {
                    orderBy: { author_order: 'asc' },
                    include: {
                        author: { select: { id: true, name_zh: true, name_en: true } }
                    }
                }
            }
        });
         console.log(`DB: Fetched ${publicationsWithAuthors.length} publications.`);

        // 转换数据结构
        return publicationsWithAuthors.map((p) => {
            const formattedAuthors = p.authors.map((ap) => ({
                id: ap.author.id,
                name_zh: ap.author.name_zh,
                name_en: ap.author.name_en,
                is_corresponding: ap.is_corresponding_author
            }));
            const { authors, createdAt, updatedAt, authors_full_string, ...rest } = p;
            return {
                ...rest,
                authors: formattedAuthors
            } as PublicationInfo; // 断言类型
        });

    } catch (error) {
        console.error("获取所有出版物失败:", error);
        throw new Error("Failed to fetch publications.");
    }
}

/**
 * 根据成员 ID 获取其发表的论文列表（包含格式化的作者列表）。
 * 注意：这个函数的功能已被 getMemberProfileData 包含，但如果需要独立获取可以保留。
 * @param memberId - 成员的唯一 ID
 * @returns PublicationInfo 数组
 */
export async function getPublicationsByMemberIdFormatted(memberId: string): Promise<PublicationInfo[]> {
    console.log(`DB: Fetching publications for member ${memberId}`);
    try {
        const publications = await prisma.publication.findMany({
             where: { authors: { some: { member_id: memberId } } },
             orderBy: [{ year: 'desc' }, { id: 'desc' }],
             include: {
                 authors: {
                     orderBy: { author_order: 'asc' },
                     include: {
                         author: { select: { id: true, name_zh: true, name_en: true } }
                     }
                 }
             }
         });
         console.log(`DB: Fetched ${publications.length} publications for member ${memberId}.`);

        // 转换数据结构
        return publications.map((p) => {
            const formattedAuthors = p.authors.map((ap) => ({
                id: ap.author.id,
                name_zh: ap.author.name_zh,
                name_en: ap.author.name_en,
                is_corresponding: ap.is_corresponding_author
            }));
             const { authors, createdAt, updatedAt, authors_full_string, ...rest } = p;
            return {
                 ...rest,
                 authors: formattedAuthors
            } as PublicationInfo;
        });

    } catch (error) {
        console.error(`获取成员 ${memberId} 的出版物失败:`, error);
        throw new Error(`Failed to fetch publications for member ${memberId}.`);
    }
}

// 可以添加根据 ID 获取单个 PublicationInfo 的函数等
// export async function getPublicationInfoById(id: number): Promise<PublicationInfo | null> { ... }