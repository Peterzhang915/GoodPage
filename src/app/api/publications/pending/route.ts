import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  console.log('Received request to /api/publications/pending');
  try {
    const pendingPublications = await prisma.publication.findMany({
      where: {
        status: 'pending_review',
      },
      orderBy: {
        createdAt: 'desc', // Show newest pending items first
      },
      // Select the necessary fields for the review list
      select: {
        id: true,
        title: true,
        year: true,
        venue: true,
        raw_authors: true, // Important for review
        doi_url: true,     // Added for display
        pdf_url: true,     // Added for display
        createdAt: true,
      }
    });

    console.log(`Found ${pendingPublications.length} pending publications.`);

    return NextResponse.json(pendingPublications, { status: 200 });

  } catch (error) {
    console.error('Error fetching pending publications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
  // Prisma client disconnection is usually handled automatically in serverless environments
}
