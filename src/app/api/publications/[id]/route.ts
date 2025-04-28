import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client'; // Import Prisma
import prisma from '@/lib/prisma'; // Import Prisma client instance

interface RouteParams {
    params: { id: string };
}

// GET Handler for fetching a specific publication by ID
export async function GET(request: Request, { params }: RouteParams) {
    const id = params.id;
    const publicationId = parseInt(id, 10);

    if (isNaN(publicationId)) {
        return NextResponse.json(
            { success: false, error: { message: 'Invalid Publication ID format.' } },
            { status: 400 }
        );
    }

    console.log(`[API GET /api/publications/${id}] Attempting to fetch publication. Parsed ID: ${publicationId} (Type: ${typeof publicationId})`);

    try {
        const publication = await prisma.publication.findUnique({
            where: { id: publicationId },
            // Optionally include authors or other relations if needed for verification
            // include: { authors: { include: { author: true } } }
        });

        if (!publication) {
            console.log(`[API] Publication with ID ${publicationId} not found in database.`);
            return NextResponse.json(
                { success: false, error: { message: `Publication with ID ${publicationId} not found.` } },
                { status: 404 } // Return 404 if not found
            );
        }

        console.log(`[API] Successfully fetched publication with ID: ${publicationId}`);
        return NextResponse.json({ success: true, data: publication });

    } catch (error: unknown) {
        console.error(`[API] Error fetching publication ${publicationId}:`, error);
        let errorMessage = 'An unexpected error occurred while fetching the publication.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json(
            { success: false, error: { message: errorMessage } },
            { status: 500 }
        );
    }
}

// DELETE Handler for deleting a specific publication
export async function DELETE(request: Request, { params }: RouteParams) {
    const id = params.id;

    // Validate ID
    const publicationId = parseInt(id, 10);
    if (isNaN(publicationId)) {
        return NextResponse.json(
            { success: false, error: { message: 'Invalid Publication ID format.' } },
            { status: 400 }
        );
    }

    console.log(`[API DELETE /api/publications/${id}] Attempting to delete publication. Parsed ID: ${publicationId} (Type: ${typeof publicationId})`);

    try {
        // Attempt to delete the publication
        // Using delete directly will throw if the record doesn't exist, implicitly handling 404
        await prisma.publication.delete({
            where: { id: publicationId },
        });

        console.log(`[API] Successfully deleted publication with ID: ${publicationId}`);
        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error(`[API] Error deleting publication ${publicationId}:`, error);

        // Check if it's a Prisma error indicating record not found
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') { // Prisma code for "Record to delete does not exist."
                return NextResponse.json(
                    { success: false, error: { message: `Publication with ID ${publicationId} not found.` } },
                    { status: 404 }
                );
            }
        }

        // Generic error for other issues
        let errorMessage = 'An unexpected error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json(
            { success: false, error: { message: errorMessage } },
            { status: 500 }
        );
    }
}

// You might want to add PUT/PATCH handlers here later for editing 