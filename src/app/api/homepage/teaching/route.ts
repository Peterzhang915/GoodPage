import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating POST request body
const createTeachingSchema = z.object({
  course_title: z.string().min(1, { message: "Course title cannot be empty." }),
  details: z.string().optional().nullable(),
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional().default(true),
});

// GET handler to fetch all teaching entries, sorted by display_order
export async function GET() {
  try {
    const teachingEntries = await prisma.homepageTeaching.findMany({
      orderBy: {
        display_order: "asc",
      },
    });
    return NextResponse.json({ success: true, data: teachingEntries });
  } catch (error) {
    console.error("Failed to fetch homepage teaching entries:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch teaching data." } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST handler to create a new teaching entry
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createTeachingSchema.safeParse(body);
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

    const { course_title, details, display_order, is_visible } =
      validation.data;

    let finalDisplayOrder = display_order;

    // Calculate next display_order if not provided
    if (finalDisplayOrder === undefined) {
      const maxOrderResult = await prisma.homepageTeaching.aggregate({
        _max: {
          display_order: true,
        },
      });
      finalDisplayOrder = (maxOrderResult._max.display_order ?? -1) + 1;
    }

    const newTeachingEntry = await prisma.homepageTeaching.create({
      data: {
        course_title,
        details,
        display_order: finalDisplayOrder,
        is_visible,
      },
    });

    return NextResponse.json(
      { success: true, data: newTeachingEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create homepage teaching entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to create teaching entry." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
