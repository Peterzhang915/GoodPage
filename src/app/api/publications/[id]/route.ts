import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client'; // Import Prisma
import prisma from '@/lib/prisma'; // Import Prisma client instance
import { z } from 'zod';

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

// --- Zod Schema for PUT/PATCH (reuse or adapt from POST) ---
// Assuming PUT requires similar fields as POST for now
// You might want a different schema for PATCH allowing partial updates
const updatePublicationSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  year: z.coerce.number()
    .int()
    .min(1900, { message: 'Year must be 1900 or later.' })
    .max(new Date().getFullYear() + 5, { message: 'Year seems too far in the future.' }),
  // Add other expected fields from PublicationFormData here
  venue: z.string().nullable().optional(),
  type: z.nativeEnum(Prisma.PublicationType).optional(), // Assuming PublicationType enum exists
  pdf_url: z.string().url({ message: "Invalid PDF URL format." }).nullable().optional(),
  doi: z.string().nullable().optional(),
  abstract: z.string().nullable().optional(),
  bibtex: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(), // Assuming keywords stored as comma-separated string
  conference_url: z.string().url({ message: "Invalid Conference URL format." }).nullable().optional(),
  journal_url: z.string().url({ message: "Invalid Journal URL format." }).nullable().optional(),
  project_url: z.string().url({ message: "Invalid Project URL format." }).nullable().optional(),
  code_url: z.string().url({ message: "Invalid Code URL format." }).nullable().optional(),
  slides_url: z.string().url({ message: "Invalid Slides URL format." }).nullable().optional(),
  video_url: z.string().url({ message: "Invalid Video URL format." }).nullable().optional(),
  poster_url: z.string().url({ message: "Invalid Poster URL format." }).nullable().optional(),
  authors_string: z.string().nullable().optional(), // Assuming form might send this
});

// PUT Handler for updating a specific publication
export async function PUT(request: Request, { params }: RouteParams) {
    const id = params.id;
    const publicationId = parseInt(id, 10);

    if (isNaN(publicationId)) {
        return NextResponse.json(
            { success: false, error: { message: 'Invalid Publication ID format.' } },
            { status: 400 }
        );
    }

    console.log(`[API PUT /api/publications/${id}] Attempting to update publication.`);

    try {
        // 1. Parse request body
        const body = await request.json();

        // 2. Validate input data using the update schema
        const validationResult = updatePublicationSchema.safeParse(body);
        if (!validationResult.success) {
            console.log(`[API PUT /api/publications/${id}] Invalid input for updating publication:`, validationResult.error.errors);
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_INPUT',
                        message: "Invalid publication data provided for update.",
                        details: validationResult.error.flatten().fieldErrors,
                    },
                },
                { status: 400 }
            );
        }

        const dataToUpdate = validationResult.data;
        console.log(`[API PUT /api/publications/${id}] Validated data for update:`, dataToUpdate);

        // 3. Update publication in database
        const updatedPublication = await prisma.publication.update({
            where: { id: publicationId },
            data: dataToUpdate,
            // Optionally include relations if needed in response
            // include: publicationWithAuthorsPayload.include
        });

        console.log(`[API] Successfully updated publication with ID: ${publicationId}`);
        return NextResponse.json({ success: true, data: updatedPublication });

    } catch (error: unknown) {
        console.error(`[API] Error updating publication ${publicationId}:`, error);

        // Check for Prisma errors (e.g., record not found)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') { // Record to update not found.
                return NextResponse.json(
                    { success: false, error: { message: `Publication with ID ${publicationId} not found for update.` } },
                    { status: 404 }
                );
            }
            // Handle other potential Prisma errors (e.g., unique constraints) if necessary
        }

        // Generic error handling
        let errorMessage = 'An unexpected error occurred while updating the publication.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json(
            { success: false, error: { message: errorMessage } },
            { status: 500 }
        );
    }
} 