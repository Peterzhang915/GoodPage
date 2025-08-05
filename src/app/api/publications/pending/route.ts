import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  console.log("Received request to /api/publications/pending");
  try {
    const pendingPublications = await prisma.publication.findMany({
      where: {
        status: "pending_review",
      },
      orderBy: {
        createdAt: "desc", // Show newest pending items first
      },
      // Select the necessary fields for the review list
      select: {
        id: true,
        title: true,
        year: true,
        venue: true,
        authors_full_string: true, // 使用正确的字段名
        type: true,
        source: true,
        pdf_url: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`Found ${pendingPublications.length} pending publications.`);

    return NextResponse.json({
      success: true,
      data: pendingPublications
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending publications:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 },
    );
  }
  // Prisma client disconnection is usually handled automatically in serverless environments
}

export async function POST(request: Request) {
  console.log("Received POST request to /api/publications/pending");

  try {
    const body = await request.json();
    console.log("Request body:", body);

    // 验证必需字段
    if (!body.title || !body.year) {
      return NextResponse.json(
        { error: "Title and year are required" },
        { status: 400 }
      );
    }

    // 创建 pending publication
    const newPublication = await prisma.publication.create({
      data: {
        title: body.title,
        year: parseInt(body.year),
        venue: body.venue || null,
        authors_full_string: body.authors_full_string || null,
        type: body.type || 'OTHER',
        abstract: body.abstract || null,
        keywords: body.keywords || null,
        pdf_url: body.pdf_url || null,
        ccf_rank: body.ccf_rank || null,
        volume: body.volume || null,
        number: body.number || null,
        pages: body.pages || null,
        publisher: body.publisher || null,
        slides_url: body.slides_url || null,
        video_url: body.video_url || null,
        code_repository_url: body.code_repository_url || null,
        project_page_url: body.project_page_url || null,
        is_peer_reviewed: body.is_peer_reviewed || null,
        publication_status: body.publication_status || null,
        // Pending 相关字段
        status: "pending_review", // 设置为待审核状态
        raw_authors: body.authors_full_string || null, // 存储原始作者字符串
        source: body.source || "yaml_import", // 标记数据来源
      },
    });

    console.log(`Created pending publication with ID: ${newPublication.id}`);

    return NextResponse.json(
      {
        success: true,
        data: newPublication,
        message: "Publication added to pending review"
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating pending publication:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create publication: ${errorMessage}` },
      { status: 500 }
    );
  }
}
