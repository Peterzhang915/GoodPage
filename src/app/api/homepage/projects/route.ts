import { NextResponse, NextRequest } from "next/server";
import { PrismaClient, ProjectType } from "@prisma/client"; // Import ProjectType enum
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating POST request body
const createProjectSchema = z.object({
  title: z.string().min(1, { message: "Project title cannot be empty." }),
  description: z
    .string()
    .min(1, { message: "Project description cannot be empty." }),
  image_url: z
    .string()
    .url({ message: "Invalid image URL format." })
    .optional()
    .nullable(),
  project_url: z
    .string()
    .url({ message: "Invalid project URL format." })
    .optional()
    .nullable(),
  type: z.nativeEnum(ProjectType).optional().default(ProjectType.MAIN), // Use nativeEnum for Prisma enums
  leader_id: z
    .string()
    .cuid({ message: "Invalid leader ID format." })
    .optional()
    .nullable(), // CUID for Member ID
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional().default(true),
});

// GET handler to fetch projects, optionally filtered by type, sorted by display_order
export async function GET(request: NextRequest) {
  // Use NextRequest to access searchParams
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type")?.toUpperCase(); // Get 'type' query param

  let whereClause = {};
  if (
    typeFilter &&
    (typeFilter === ProjectType.MAIN || typeFilter === ProjectType.FORMER)
  ) {
    whereClause = { type: typeFilter as ProjectType };
  }

  try {
    const projects = await prisma.homepageProject.findMany({
      where: whereClause,
      orderBy: {
        display_order: "asc",
      },
      include: {
        // Include leader information
        leader: {
          select: {
            // Select only necessary fields from leader
            id: true,
            name_en: true,
            name_zh: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Failed to fetch homepage projects:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch projects data." } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST handler to create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid input.",
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      image_url,
      project_url,
      type,
      leader_id,
      display_order,
      is_visible,
    } = validation.data;

    let finalDisplayOrder = display_order;

    // Calculate next display_order if not provided (considering type)
    if (finalDisplayOrder === undefined) {
      const maxOrderResult = await prisma.homepageProject.aggregate({
        _max: {
          display_order: true,
        },
        where: { type }, // Calculate order within the same type
      });
      finalDisplayOrder = (maxOrderResult._max.display_order ?? -1) + 1;
    }

    const newProject = await prisma.homepageProject.create({
      data: {
        title,
        description,
        image_url,
        project_url,
        type,
        leader_id: leader_id, // Assign validated leader_id (can be null)
        display_order: finalDisplayOrder,
        is_visible,
      },
      include: {
        // Include leader info in the response
        leader: { select: { id: true, name_en: true, name_zh: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create homepage project:", error);
    // Handle potential foreign key constraint error if leader_id is invalid
    if (
      error.code === "P2003" &&
      error.meta?.field_name?.includes("leader_id")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Invalid leader ID provided. Member not found.` },
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Failed to create project." } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
