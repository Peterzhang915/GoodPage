import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for validating POST request body
const createInterestPointSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Interest point title cannot be empty." }),
  description: z
    .string()
    .min(1, { message: "Interest point description cannot be empty." }),
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional().default(true),
});

// GET handler to fetch all interest points, sorted by display_order
export async function GET() {
  try {
    const interestPoints = await prisma.interestPoint.findMany({
      orderBy: {
        display_order: "asc",
      },
    });
    return NextResponse.json({ success: true, data: interestPoints });
  } catch (error) {
    console.error("Failed to fetch interest points:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch interest points data." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST handler to create a new interest point
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createInterestPointSchema.safeParse(body);
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

    const { title, description, display_order, is_visible } = validation.data;

    let finalDisplayOrder = display_order;

    // If display_order is not provided, calculate the next available order
    if (finalDisplayOrder === undefined) {
      const maxOrderResult = await prisma.interestPoint.aggregate({
        _max: {
          display_order: true,
        },
      });
      finalDisplayOrder = (maxOrderResult._max.display_order ?? -1) + 1;
    }

    const newInterestPoint = await prisma.interestPoint.create({
      data: {
        title,
        description,
        display_order: finalDisplayOrder,
        is_visible,
      },
    });

    return NextResponse.json(
      { success: true, data: newInterestPoint },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create interest point:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to create interest point." },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
