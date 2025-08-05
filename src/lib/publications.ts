// src/lib/publications.ts
import prisma from "@/lib/prisma"; // 导入 Prisma Client
// 【修改】导入 DisplayAuthor 类型
import type { PublicationInfo, DisplayAuthor } from "@/lib/types";
import type { Publication } from "@/lib/prisma"; // 导入基础类型

/**
 * 获取所有出版物列表（包含智能格式化的作者列表）。
 * @returns PublicationInfo 数组 (每个对象包含 displayAuthors)
 */
export async function getAllPublicationsFormatted(): Promise<
  PublicationInfo[]
> {
  console.log("DB: Fetching all publications with smart author formatting.");
  try {
    // 【修改】调整 include/select 结构以获取所需数据
    const publicationsRaw = await prisma.publication.findMany({
      where: {
        status: "published" // 只获取已发布的出版物
      },
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
    });
    console.log(`DB: Fetched ${publicationsRaw.length} raw publications.`);

    // 【修改】转换数据结构，生成 displayAuthors
    return publicationsRaw.map((p) => {
      // 将内部作者信息提取到数组中，方便按名字匹配
      const internalAuthors = p.authors.map((ap) => ({
        id: ap.author.id,
        name_en: ap.author.name_en,
        name_zh: ap.author.name_zh,
        is_corresponding: ap.is_corresponding_author,
        author_order: ap.author_order,
      }));

      // 辅助函数：检查作者名字是否匹配
      const findMatchingMember = (authorName: string) => {
        const cleanName = authorName.trim().toLowerCase();

        return internalAuthors.find((member) => {
          const nameEn = member.name_en.toLowerCase();
          const nameZh = member.name_zh?.toLowerCase();

          // 【修复】处理两种格式：
          // 1. "LastName, FirstName" -> "FirstName LastName" (原有数据格式)
          // 2. "FirstName, LastName" -> "FirstName LastName" (新数据格式)
          let normalizedAuthorName1 = cleanName; // "LastName, FirstName" -> "FirstName LastName"
          let normalizedAuthorName2 = cleanName; // "FirstName, LastName" -> "FirstName LastName"

          if (cleanName.includes(',')) {
            const parts = cleanName.split(',').map(p => p.trim());
            if (parts.length === 2) {
              // 尝试两种格式转换
              normalizedAuthorName1 = `${parts[1]} ${parts[0]}`.toLowerCase(); // "LastName, FirstName" -> "FirstName LastName"
              normalizedAuthorName2 = `${parts[0]} ${parts[1]}`.toLowerCase(); // "FirstName, LastName" -> "FirstName LastName"
            }
          }

          // 多种匹配策略
          return (
            // 直接匹配原始名字
            nameEn === cleanName ||
            nameEn.includes(cleanName) ||
            cleanName.includes(nameEn) ||
            // 匹配转换后的名字格式1 ("LastName, FirstName" -> "FirstName LastName")
            nameEn === normalizedAuthorName1 ||
            nameEn.includes(normalizedAuthorName1) ||
            normalizedAuthorName1.includes(nameEn) ||
            // 匹配转换后的名字格式2 ("FirstName, LastName" -> "FirstName LastName")
            nameEn === normalizedAuthorName2 ||
            nameEn.includes(normalizedAuthorName2) ||
            normalizedAuthorName2.includes(nameEn) ||
            // 中文名匹配
            (nameZh && (nameZh === cleanName || nameZh.includes(cleanName) || cleanName.includes(nameZh)))
          );
        });
      };

      const displayAuthors: DisplayAuthor[] = [];
      const authorString = p.authors_full_string;

      if (authorString) {
        const fragments = authorString
          .split(";")
          .map((f) => f.trim())
          .filter((f) => f);
        fragments.forEach((fragment, index) => {
          // 【修复】按名字匹配而不是按index匹配
          const matchedMember = findMatchingMember(fragment);
          if (matchedMember) {
            // 匹配到内部作者
            displayAuthors.push({
              type: "internal",
              id: matchedMember.id,
              name_en: matchedMember.name_en,
              name_zh: matchedMember.name_zh,
              order: index,
              is_corresponding: matchedMember.is_corresponding,
            });
          } else {
            // 未匹配到内部作者，作为外部作者处理
            let formattedText = fragment; // Default to original fragment
            // 【修复】简单去掉逗号，不做格式转换
            if (fragment.includes(",")) {
              const parts = fragment.split(",").map((p) => p.trim());
              // 如果恰好分割成2部分且两部分都不为空，直接用空格连接
              if (parts.length === 2 && parts[0] && parts[1]) {
                formattedText = `${parts[0]} ${parts[1]}`;
              }
              // 否则保持原样
            }
            displayAuthors.push({
              type: "external",
              text: formattedText,
              order: index,
            });
          }
        });
      } else {
        // 回退逻辑：如果缺少原始字符串，仅用内部作者
        console.warn(
          `Publication ID ${p.id} missing authors_full_string. Using internal authors only.`,
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

      return { ...restOfPub, displayAuthors } as PublicationInfo; // 断言类型
    });
  } catch (error) {
    console.error("获取所有出版物失败:", error);
    throw new Error("Failed to fetch publications.");
  }
}

/**
 * 根据成员 ID 获取其发表的论文列表（包含智能格式化的作者列表）。
 * 【注意】这个函数现在与 getAllPublicationsFormatted 内部的作者处理逻辑类似，
 * 但可以保留用于只获取特定成员论文的场景。
 * @param memberId - 成员的唯一 ID
 * @returns PublicationInfo 数组
 */
export async function getPublicationsByMemberIdFormatted(
  memberId: string,
): Promise<PublicationInfo[]> {
  console.log(
    `DB: Fetching publications for member ${memberId} with smart author formatting.`,
  );
  try {
    // 【修改】使用与 getAllPublicationsFormatted 相同的 select 结构
    const publicationsRaw = await prisma.publication.findMany({
      where: {
        AND: [
          { authors: { some: { member_id: memberId } } },
          { status: "published" } // 只获取已发布的出版物
        ]
      },
      orderBy: [{ year: "desc" }, { id: "desc" }],
      select: {
        // <--- 使用和上面一样的 select 结构
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
          select: {
            author_order: true,
            is_corresponding_author: true,
            author: { select: { id: true, name_en: true, name_zh: true } },
          },
          orderBy: { author_order: "asc" },
        },
      },
    });
    console.log(
      `DB: Fetched ${publicationsRaw.length} raw publications for member ${memberId}.`,
    );

    // 【修改】应用相同的 displayAuthors 生成逻辑，包含外部作者格式化
    return publicationsRaw.map((p) => {
      // 将内部作者信息提取到数组中，方便按名字匹配
      const internalAuthors = p.authors.map((ap) => ({
        id: ap.author.id,
        name_en: ap.author.name_en,
        name_zh: ap.author.name_zh,
        is_corresponding: ap.is_corresponding_author,
        author_order: ap.author_order,
      }));

      // 辅助函数：检查作者名字是否匹配
      const findMatchingMember = (authorName: string) => {
        const cleanName = authorName.trim().toLowerCase();
        return internalAuthors.find((member) => {
          const nameEn = member.name_en.toLowerCase();
          const nameZh = member.name_zh?.toLowerCase();

          // 精确匹配或包含匹配
          return (
            nameEn === cleanName ||
            nameEn.includes(cleanName) ||
            cleanName.includes(nameEn) ||
            (nameZh && (nameZh === cleanName || nameZh.includes(cleanName) || cleanName.includes(nameZh)))
          );
        });
      };

      const displayAuthors: DisplayAuthor[] = [];
      const authorString = p.authors_full_string;

      if (authorString) {
        const fragments = authorString
          .split(";")
          .map((f) => f.trim())
          .filter((f) => f);
        fragments.forEach((fragment, index) => {
          // 【修复】按名字匹配而不是按index匹配
          const matchedMember = findMatchingMember(fragment);
          if (matchedMember) {
            // 匹配到内部作者
            displayAuthors.push({
              type: "internal",
              id: matchedMember.id,
              name_en: matchedMember.name_en,
              name_zh: matchedMember.name_zh,
              order: index,
              is_corresponding: matchedMember.is_corresponding,
            });
          } else {
            // 未匹配到内部作者，作为外部作者处理，并格式化
            let formattedText = fragment;
            if (fragment.includes(",")) {
              const parts = fragment.split(",").map((p) => p.trim());
              if (parts.length === 2 && parts[0] && parts[1]) {
                const lastName = parts[0];
                const firstName = parts[1];
                if (!lastName.includes(" ") && firstName.length > 0) {
                  formattedText = `${firstName} ${lastName}`;
                }
              }
            }
            displayAuthors.push({
              type: "external",
              text: formattedText,
              order: index,
            });
          }
        });
      } else {
        console.warn(
          `Publication ID ${p.id} missing authors_full_string. Using internal authors only.`,
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

      const { authors, ...restOfPub } = p;
      return { ...restOfPub, displayAuthors } as PublicationInfo;
    });
  } catch (error) {
    console.error(`获取成员 ${memberId} 的出版物失败:`, error);
    throw new Error(`Failed to fetch publications for member ${memberId}.`);
  }
}

// 可以添加根据 ID 获取单个 PublicationInfo 的函数等
// export async function getPublicationInfoById(id: number): Promise<PublicationInfo | null> { ... }
