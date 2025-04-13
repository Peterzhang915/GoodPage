import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Handler for DELETE requests
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } } // Next.js passes route params here
) {
  const id = params.id;
  console.log(`Received DELETE request for pending publication ID: ${id}`);

  if (!id) {
    return NextResponse.json({ error: 'Publication ID is required' }, { status: 400 });
  }

  try {
    // Find the publication first to ensure it exists and is pending
    const publication = await prisma.publication.findUnique({
      where: { id: id },
      select: { status: true } // Only need status to verify
    });

    if (!publication) {
      console.warn(`Publication with ID ${id} not found.`);
      // Return 404 even if it never existed, or was already deleted/approved
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    // IMPORTANT: Only allow deletion if the status is 'pending_review'
    if (publication.status !== 'pending_review') {
      console.warn(`Attempted to delete publication ${id} with status ${publication.status}.`);
      return NextResponse.json({ error: 'Cannot delete publication that is not pending review.' }, { status: 400 });
    }

    // Delete the publication
    await prisma.publication.delete({
      where: { id: id },
    });

    console.log(`Successfully deleted pending publication with ID: ${id}`);
    // Return a success response with no content
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting pending publication ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

// Handler for PUT requests (Update)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`Received PUT request for publication ID: ${id}`);

  if (!id) {
    return NextResponse.json({ error: 'Publication ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    console.log("Update payload:", body);

    // Validate required fields (adjust based on your form validation)
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Extract fields allowed for update
    const { authorIds, status, ...updateData } = body;

    // Basic type validation for year (optional but good practice)
    if (updateData.year !== null && typeof updateData.year !== 'number') {
        try {
            updateData.year = updateData.year ? parseInt(updateData.year, 10) : null;
            if (isNaN(updateData.year)) updateData.year = null;
        } catch {
             updateData.year = null;
        }
    }

    // Ensure status is 'approved' when saving from editor
    if (status !== 'approved') {
        console.warn(`Editor attempted to save with status ${status}. Forcing to 'approved'.`);
        // Or return error: return NextResponse.json({ error: 'Invalid status for update' }, { status: 400 });
    }
    const finalStatus = 'approved';


    // Use Prisma transaction to update publication and connect authors
    const updatedPublication = await prisma.$transaction(async (tx) => {
      // 1. Update the publication data
      const publication = await tx.publication.update({
        where: { id: id },
        data: {
          ...updateData,
          status: finalStatus, // Set status to approved
          authors: { // Disconnect all existing authors first
            set: [],
          }
        },
      });

      // 2. Connect the selected authors (if any)
      if (authorIds && Array.isArray(authorIds) && authorIds.length > 0) {
         // Ensure authorIds are valid strings
         const validAuthorIds = authorIds.filter((aid): aid is string => typeof aid === 'string' && aid.length > 0);
         if (validAuthorIds.length > 0) {
            await tx.publication.update({
                where: { id: id },
                data: {
                    authors: {
                        connect: validAuthorIds.map(authorId => ({ id: authorId }))
                    }
                }
            });
         } else {
             console.log("No valid author IDs provided to connect.");
         }
      } else {
          console.log("No author IDs provided, clearing connections.");
      }

      // 3. Re-fetch the updated publication with authors included for the response
      const result = await tx.publication.findUnique({
        where: { id: id },
        include: { authors: { select: { id: true, name_en: true, name_zh: true } } } // Include authors in result
      });

      if (!result) {
        // This shouldn't happen if the initial update succeeded, but handle defensively
        throw new Error("Failed to re-fetch updated publication after transaction.");
      }
      return result;
    });

    console.log(`Successfully updated and approved publication with ID: ${id}`);
    return NextResponse.json(updatedPublication, { status: 200 });

  } catch (error) {
    console.error(`Error updating publication ${id}:`, error);
    // Handle potential Prisma errors (e.g., record not found)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
      }
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
} 