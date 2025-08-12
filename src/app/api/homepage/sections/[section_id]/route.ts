import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating PUT request body
const updateSectionMetaSchema = z.object({
  title: z.string().min(1).optional(),
  introduction: z.string().optional().nullable(), // Allow clearing introduction
  is_visible: z.boolean().optional(),
});

// Helper to get section_id from params
const getSectionIdFromParams = (params: { section_id?: string }) => {
  const sectionId = params.section_id;
  if (!sectionId) {
    throw new Error("Missing section_id parameter");
  }
  // Basic validation: ensure it's a non-empty string (you could add more specific checks if needed)
  if (typeof sectionId !== "string" || sectionId.trim().length === 0) {
    throw new Error("Invalid section_id parameter format");
  }
  return sectionId;
};

// GET handler for a single section's metadata by section_id
export async function GET(
  request: Request,
  { params }: { params: { section_id: string } }
) {
  try {
    const section_id = getSectionIdFromParams(params);
    const sectionMeta = await prisma.homepageSectionMeta.findUnique({
      where: { section_id },
    });

    if (!sectionMeta) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Section metadata with ID '${section_id}' not found.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: sectionMeta });
  } catch (error: any) {
    console.error(
      `Failed to fetch section metadata ${params.section_id}:`,
      error
    );
    const status = error.message.includes("parameter") ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            status === 400
              ? error.message
              : "Failed to fetch section metadata.",
        },
      },
      { status }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT handler to update a specific section's metadata by section_id
export async function PUT(
  request: Request,
  { params }: { params: { section_id: string } }
) {
  try {
    const section_id = getSectionIdFromParams(params);
    const body = await request.json();

    // Validate input
    const validation = updateSectionMetaSchema.safeParse(body);
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

    const updatedSectionMeta = await prisma.homepageSectionMeta.update({
      where: { section_id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: updatedSectionMeta });
  } catch (error: any) {
    console.error(
      `Failed to update section metadata ${params.section_id}:`,
      error
    );
    if (error instanceof Error && error.message.includes("parameter")) {
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
          error: {
            message: `Section metadata with ID '${params.section_id}' not found.`,
          },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update section metadata." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Note: DELETE handler is likely not needed for section metadata.
// Sections are usually predefined parts of the page structure.
