import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET handler to fetch all homepage section metadata
export async function GET() {
  try {
    const sections = await prisma.homepageSectionMeta.findMany({
      // You might want to add an order here if needed, e.g., by a specific field or a predefined order
      // orderBy: { section_id: 'asc' } // Example: order by section ID alphabetically
    });
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('Failed to fetch homepage section metadata:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch section metadata.' } },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Note: POST handler might not be needed if sections are predefined and managed directly
// or through a seeding script. If dynamic creation is needed, add a POST handler here. 