import { NextResponse } from "next/server";
import { PrismaClient, ProjectType } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating PUT request body
const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  image_url: z.string().url().optional().nullable(),
  project_url: z.string().url().optional().nullable(),
  type: z.nativeEnum(ProjectType).optional(),
  leader_id: z.string().cuid().optional().nullable(), // Allow setting leader to null
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional(),
});

// Helper to get ID from params
const getIdFromParams = (params: { id?: string }) => {
  const id = parseInt(params.id || "");
  if (isNaN(id)) {
    throw new Error("Invalid ID parameter");
  }
  return id;
};

// GET handler for a single project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const project = await prisma.homepageProject.findUnique({
      where: { id },
      include: {
        // Include leader info
        leader: { select: { id: true, name_en: true, name_zh: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Project with ID ${id} not found.` },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Failed to fetch project ${resolvedParams.id}:`, error);
    const status = error.message.includes("Invalid ID") ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: {
          message: status === 400 ? error.message : "Failed to fetch project.",
        },
      },
      { status }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT handler to update a specific project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);
    const body = await request.json();

    // Validate input
    const validation = updateProjectSchema.safeParse(body);
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

    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No valid fields provided for update." },
        },
        { status: 400 }
      );
    }

    // Prepare data, handle potential null assignment for leader_id
    const dataToUpdate = { ...validation.data };

    const updatedProject = await prisma.homepageProject.update({
      where: { id },
      data: dataToUpdate,
      include: {
        // Include leader info in the response
        leader: { select: { id: true, name_en: true, name_zh: true } },
      },
    });

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Failed to update project ${resolvedParams.id}:`, error);
    if (error instanceof Error && error.message.includes("Invalid ID")) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }
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
    if (error.code === "P2025") {
      // Record not found
      return NextResponse.json(
        {
          success: false,
          error: { message: `Project with ID ${resolvedParams.id} not found.` },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Failed to update project." } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE handler to remove a specific project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = getIdFromParams(resolvedParams);

    await prisma.homepageProject.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: `Project with ID ${id} deleted.` },
      { status: 200 }
    );
  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Failed to delete project ${resolvedParams.id}:`, error);
    if (error instanceof Error && error.message.includes("Invalid ID")) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      // Record not found
      return NextResponse.json(
        {
          success: false,
          error: { message: `Project with ID ${resolvedParams.id} not found.` },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete project." } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
