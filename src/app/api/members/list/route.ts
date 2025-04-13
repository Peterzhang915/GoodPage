import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  console.log('Received request to /api/members/list');
  try {
    const members = await prisma.member.findMany({
      where: {
        // Optionally filter by status if needed, e.g., only 'Current' members
        // status: 'Current'
      },
      select: {
        id: true,
        name_en: true, // Or name_zh
        name_zh: true,
      },
      orderBy: {
        name_en: 'asc', // Or name_zh
      }
    });
    console.log(`Found ${members.length} members.`);
    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error('Error fetching members list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
