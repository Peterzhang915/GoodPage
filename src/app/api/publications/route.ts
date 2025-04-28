import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types
import * as z from 'zod'; // Import zod for input validation
// import { checkPermission, getCurrentUser } from '@/lib/auth'; // Placeholder for actual auth functions

// Define the type for the data returned by the GET request, including authors
// We use Prisma.validator to create a type safe payload structure
const publicationWithAuthorsPayload = Prisma.validator<Prisma.PublicationDefaultArgs>()({
  include: { 
    authors: { // Include the relation PublicationAuthor
      include: {
        author: { // From PublicationAuthor, include the related Member
          select: { // Select only necessary Member fields
            id: true,
            name_en: true,
            name_zh: true
          }
        }
      },
      orderBy: { // Order authors by their specified order
        author_order: 'asc'
      }
    } 
  }
});

// Export the type for use in the frontend component
export type PublicationWithAuthors = Prisma.PublicationGetPayload<typeof publicationWithAuthorsPayload>;


export async function GET() {
  console.log("API: Handling GET /api/publications");
  try {
    // --- Permission Check Placeholder --- 
    /* 
    const currentUser = await getCurrentUser();
    if (!currentUser || !checkPermission(currentUser, 'view_publications')) { // Or 'manage_publications'
      console.warn("API: Unauthorized attempt to fetch publications.");
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Permission denied.' } },
        { status: 403 } // 403 Forbidden
      );
    }
    console.log(`API: User ${currentUser.id} authorized.`);
    */
    console.warn("API: Permission check is currently disabled in GET /api/publications.");
    // --- End Permission Check ---

    const publications = await prisma.publication.findMany({
      // Include author details via the join table
      include: publicationWithAuthorsPayload.include,
      // Default ordering: newest first? Or alphabetical? Let's do year desc, then title asc.
      orderBy: [
        { year: 'desc' },
        { title: 'asc' },
      ],
      // TODO: Add pagination in the future (e.g., using take and skip)
    });
    
    // --- TEMPORARY LOGGING --- 
    const fetchedIds = publications.map(p => p.id);
    console.log(`[API GET /api/publications] Fetched publication IDs:`, fetchedIds); 
    // --- END TEMPORARY LOGGING ---

    console.log(`API: Fetched ${publications.length} publications.`);
    // We need to transform the nested structure slightly for easier frontend consumption if needed,
    // or return the Prisma structure directly. Let's return directly for now.
    const responseData: PublicationWithAuthors[] = publications;

    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    console.error("API Error fetching all publications:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    // Return a standard error response
    return NextResponse.json(
      { success: false, error: { code: 'PUBLICATION_FETCH_ALL_FAILED', message } },
      { status: 500 }
    );
  }
}

// --- Zod Schema for POST Input Validation --- 
// Corresponds to the simplified PublicationForm for now
const createPublicationSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  year: z.coerce.number()
    .int()
    .min(1900, { message: 'Year must be 1900 or later.' })
    .max(new Date().getFullYear() + 5, { message: 'Year seems too far in the future.' }),
  // Add other fields here as the form grows, ensure they match form data
  // venue: z.string().nullable().optional(),
  // type: z.nativeEnum(PublicationType).optional(),
  // pdf_url: z.string().url().nullable().optional(),
  // ... etc
});

// --- POST Handler --- 
export async function POST(request: Request) {
  console.log("API: Handling POST /api/publications");
  try {
    // --- Permission Check Placeholder --- 
    /* 
    const currentUser = await getCurrentUser();
    if (!currentUser || !checkPermission(currentUser, 'manage_publications')) { 
      console.warn("API: Unauthorized attempt to create publication.");
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Permission denied.' } },
        { status: 403 } 
      );
    }
    console.log(`API: User ${currentUser.id} authorized to create publication.`);
    */
    console.warn("API: Permission check is currently disabled in POST /api/publications.");
    // --- End Permission Check ---

    // 1. Parse request body
    const body = await request.json();

    // 2. Validate input data
    const validationResult = createPublicationSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("API: Invalid input for creating publication:", validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: "Invalid publication data provided.",
            details: validationResult.error.flatten().fieldErrors, // Send detailed validation errors
          },
        },
        { status: 400 } // Bad Request
      );
    }

    const { title, year } = validationResult.data;
    // Destructure other validated fields here as they are added
    // const { venue, type, pdf_url, ... } = validationResult.data;

    console.log(`API: Creating publication with Title: ${title}, Year: ${year}`);

    // 3. Create publication in database
    const newPublication = await prisma.publication.create({
      data: {
        title,
        year,
        // Add other fields here based on validationResult.data
        // venue,
        // type,
        // pdf_url, 
        // ...etc
        // NOTE: Optional fields not provided will default to null or their DB default
      },
      // Optionally include authors if needed in the response (unlikely for create)
      // include: publicationWithAuthorsPayload.include 
    });

    console.log(`API: Successfully created publication with ID: ${newPublication.id}`);

    // 4. Return success response
    return NextResponse.json(
      { success: true, data: newPublication },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("API Error creating publication:", error);
    let message = "Internal Server Error";
    let statusCode = 500;

    // Handle potential Prisma errors specifically if needed
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // e.g., unique constraint violation
        message = `Database error occurred: ${error.code}`;
        statusCode = 409; // Conflict, maybe?
    } else if (error instanceof Error) {
        message = error.message;
    }

    return NextResponse.json(
      { success: false, error: { code: 'PUBLICATION_CREATION_FAILED', message } },
      { status: statusCode }
    );
  }
}

// TODO: Implement PUT/DELETE handlers in a separate [id]/route.ts file 