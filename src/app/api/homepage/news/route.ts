import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod'; // For input validation

const prisma = new PrismaClient();

// Zod Schema for validating POST request body
const createNewsSchema = z.object({
  content: z.string().min(1, { message: 'News content cannot be empty.' }),
  // display_order is optional, handled by finding max + 1 if not provided
  display_order: z.number().int().optional(),
  is_visible: z.boolean().optional().default(true),
});

// GET handler to fetch all news items, sorted by display_order
export async function GET() {
  try {
    const newsItems = await prisma.homepageNews.findMany({
      orderBy: {
        display_order: 'asc', // Default sort order
      },
    });
    return NextResponse.json({ success: true, data: newsItems });
  } catch (error) {
    console.error('Failed to fetch homepage news:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch news data.' } },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST handler to create a new news item
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createNewsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input.', details: validation.error.errors } },
        { status: 400 },
      );
    }

    const { content, display_order, is_visible } = validation.data;

    let finalDisplayOrder = display_order;

    // If display_order is not provided, calculate the next available order
    if (finalDisplayOrder === undefined) {
      const maxOrderResult = await prisma.homepageNews.aggregate({
        _max: {
          display_order: true,
        },
      });
      finalDisplayOrder = (maxOrderResult._max.display_order ?? -1) + 1;
    }

    const newNewsItem = await prisma.homepageNews.create({
      data: {
        content,
        display_order: finalDisplayOrder,
        is_visible,
      },
    });

    return NextResponse.json({ success: true, data: newNewsItem }, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error('Failed to create homepage news item:', error);
    // Consider more specific error checks (e.g., database constraint errors)
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create news item.' } },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
