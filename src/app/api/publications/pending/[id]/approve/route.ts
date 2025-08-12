import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = parseInt(idString, 10);
  console.log(`Received POST request to approve pending publication ID: ${id}`);

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { error: "Valid publication ID is required" },
      { status: 400 }
    );
  }

  try {
    // 检查 publication 是否存在且为 pending 状态
    const publication = await prisma.publication.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        title: true,
        authors_full_string: true,
      },
    });

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }

    if (publication.status !== "pending_review") {
      return NextResponse.json(
        { error: "Publication is not in pending status" },
        { status: 400 }
      );
    }

    // 更新状态为 approved 并处理作者关联
    const updatedPublication = await prisma.$transaction(async (tx) => {
      // 1. 更新 publication 状态
      const updated = await tx.publication.update({
        where: { id },
        data: {
          status: "published", // 修复：使用 "published" 而不是 "approved"
        },
        include: {
          authors: {
            include: {
              author: {
                select: { id: true, name_en: true, name_zh: true },
              },
            },
            orderBy: { author_order: "asc" },
          },
        },
      });

      // 2. 处理作者匹配和关联（如果有 authors_full_string）
      if (publication.authors_full_string) {
        const authorNames = publication.authors_full_string
          .split(";")
          .map((name) => name.trim())
          .filter((name) => name.length > 0);

        // 获取所有members用于智能匹配
        const allMembers = await tx.member.findMany({
          select: { id: true, name_en: true, name_zh: true },
        });

        // 智能匹配逻辑（复用之前的逻辑）
        const findMatchingMember = (inputName: string) => {
          const cleanName = inputName.trim().toLowerCase();

          return allMembers.find((member) => {
            const nameEn = member.name_en.toLowerCase();
            const nameZh = member.name_zh?.toLowerCase();

            let normalizedAuthorName1 = cleanName;
            let normalizedAuthorName2 = cleanName;

            if (cleanName.includes(",")) {
              const parts = cleanName.split(",").map((p) => p.trim());
              if (parts.length === 2) {
                normalizedAuthorName1 = `${parts[1]} ${parts[0]}`.toLowerCase();
                normalizedAuthorName2 = `${parts[0]} ${parts[1]}`.toLowerCase();
              }
            }

            return (
              nameEn === cleanName ||
              nameEn.includes(cleanName) ||
              cleanName.includes(nameEn) ||
              nameEn === normalizedAuthorName1 ||
              nameEn.includes(normalizedAuthorName1) ||
              normalizedAuthorName1.includes(nameEn) ||
              nameEn === normalizedAuthorName2 ||
              nameEn.includes(normalizedAuthorName2) ||
              normalizedAuthorName2.includes(nameEn) ||
              (nameZh &&
                (nameZh === cleanName ||
                  nameZh.includes(cleanName) ||
                  cleanName.includes(nameZh)))
            );
          });
        };

        // 清除现有的作者关联
        await tx.publicationAuthor.deleteMany({
          where: { publication_id: id },
        });

        // 创建新的作者关联
        let authorOrder = 0;
        for (const authorName of authorNames) {
          const member = findMatchingMember(authorName);

          if (member) {
            await tx.publicationAuthor.create({
              data: {
                publication_id: id,
                member_id: member.id,
                author_order: authorOrder,
              },
            });
            console.log(
              `Linked author "${authorName}" to member ID ${member.id} (${member.name_en})`
            );
          } else {
            console.warn(
              `Author "${authorName}" not linked to any existing member.`
            );
          }
          authorOrder++;
        }
      }

      return updated;
    });

    console.log(`Successfully approved publication ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: "Publication approved successfully",
      data: updatedPublication,
    });
  } catch (error) {
    console.error("Error approving publication:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to approve publication: ${errorMessage}` },
      { status: 500 }
    );
  }
}
