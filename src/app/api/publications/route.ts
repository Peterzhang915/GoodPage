import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma, PublicationType } from "@prisma/client"; // Ensure PublicationType is imported
import * as z from "zod"; // Import zod for input validation
import { getAllPublicationsFormatted } from "@/lib/publications";
// import { checkPermission, getCurrentUser } from '@/lib/auth'; // Placeholder for actual auth functions

// Define the type for the data returned by the GET request, including authors
// We use Prisma.validator to create a type safe payload structure
const publicationWithAuthorsPayload =
  Prisma.validator<Prisma.PublicationDefaultArgs>()({
    include: {
      authors: {
        // Include the relation PublicationAuthor
        include: {
          author: {
            // From PublicationAuthor, include the related Member
            select: {
              // Select only necessary Member fields
              id: true,
              name_en: true,
              name_zh: true,
            },
          },
        },
        orderBy: {
          // Order authors by their specified order
          author_order: "asc",
        },
      },
    },
  });

// Export the type for use in the frontend component
export type PublicationWithAuthors = Prisma.PublicationGetPayload<
  typeof publicationWithAuthorsPayload
>;

export async function GET() {
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
    console.warn(
      "API: Permission check is currently disabled in GET /api/publications."
    );
    // --- End Permission Check ---

    // 使用 getAllPublicationsFormatted 函数获取格式化的出版物数据
    const publications = await getAllPublicationsFormatted();



    return NextResponse.json({
      data: publications,
      count: publications.length,
    });
  } catch (error) {
    console.error("API Error in GET /api/publications:", error);
    return NextResponse.json(
      { error: "Failed to fetch publications" },
      { status: 500 }
    );
  }
}

// --- Zod Schema for POST Input Validation ---
// Corresponds to the simplified PublicationForm for now
const createPublicationSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  year: z.coerce
    .number()
    .int()
    .min(1900, { message: "Year must be 1900 or later." })
    .max(new Date().getFullYear() + 5, {
      message: "Year seems too far in the future.",
    }),
  venue: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  ccf_rank: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  authors_full_string: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  pdf_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  type: z.nativeEnum(PublicationType).optional(), // PublicationType should be available here
});

// --- POST Handler ---
export async function POST(request: Request) {
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
    console.warn(
      "API: Permission check is currently disabled in POST /api/publications."
    );
    // --- End Permission Check ---

    // 1. Parse request body
    const body = await request.json();

    // 2. Validate input data
    const validationResult = createPublicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Invalid publication data provided.",
            details: validationResult.error.flatten().fieldErrors, // Send detailed validation errors
          },
        },
        { status: 400 } // Bad Request
      );
    }

    // Ensure data types are correct after validation
    const { title, year, venue, ccf_rank, authors_full_string, pdf_url, type } =
      validationResult.data;



    // 3. Create publication in database
    const newPublication = await prisma.publication.create({
      data: {
        title: title, // Explicitly typed
        year: year, // Explicitly typed
        venue: venue, // Explicitly typed
        ccf_rank: ccf_rank, // Explicitly typed
        authors_full_string: authors_full_string, // Explicitly typed
        pdf_url: pdf_url, // Explicitly typed
        type: type, // Explicitly typed
        // NOTE: Optional fields not provided will default to null or their DB default
      },
    });

    // 4. Process and link authors with smart matching
    if (authors_full_string) {
      const authorNames = authors_full_string
        .split(";")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      // 获取所有members用于智能匹配
      const allMembers = await prisma.member.findMany({
        select: { id: true, name_en: true, name_zh: true },
      });

      let authorOrder = 0;
      for (const authorName of authorNames) {
        // 【修复】使用智能匹配逻辑
        const findMatchingMember = (inputName: string) => {
          const cleanName = inputName.trim().toLowerCase();

          return allMembers.find((member) => {
            const nameEn = member.name_en.toLowerCase();
            const nameZh = member.name_zh?.toLowerCase();

            // 处理两种格式：
            // 1. "LastName, FirstName" -> "FirstName LastName" (原有数据格式)
            // 2. "FirstName, LastName" -> "FirstName LastName" (新数据格式)
            let normalizedAuthorName1 = cleanName; // "LastName, FirstName" -> "FirstName LastName"
            let normalizedAuthorName2 = cleanName; // "FirstName, LastName" -> "FirstName LastName"

            if (cleanName.includes(",")) {
              const parts = cleanName.split(",").map((p) => p.trim());
              if (parts.length === 2) {
                // 尝试两种格式转换
                normalizedAuthorName1 = `${parts[1]} ${parts[0]}`.toLowerCase(); // "LastName, FirstName" -> "FirstName LastName"
                normalizedAuthorName2 = `${parts[0]} ${parts[1]}`.toLowerCase(); // "FirstName, LastName" -> "FirstName LastName"
              }
            }

            // 多种匹配策略
            return (
              // 直接匹配原始名字
              nameEn === cleanName ||
              nameEn.includes(cleanName) ||
              cleanName.includes(nameEn) ||
              // 匹配转换后的名字格式1 ("LastName, FirstName" -> "FirstName LastName")
              nameEn === normalizedAuthorName1 ||
              nameEn.includes(normalizedAuthorName1) ||
              normalizedAuthorName1.includes(nameEn) ||
              // 匹配转换后的名字格式2 ("FirstName, LastName" -> "FirstName LastName")
              nameEn === normalizedAuthorName2 ||
              nameEn.includes(normalizedAuthorName2) ||
              normalizedAuthorName2.includes(nameEn) ||
              // 中文名匹配
              (nameZh &&
                (nameZh === cleanName ||
                  nameZh.includes(cleanName) ||
                  cleanName.includes(nameZh)))
            );
          });
        };

        const member = findMatchingMember(authorName);

        if (member) {
          // Link to existing member
          await prisma.publicationAuthor.create({
            data: {
              publication_id: newPublication.id,
              member_id: member.id,
              author_order: authorOrder,
            },
          });

        } else {
          console.warn(
            `API: Author "${authorName}" from authors_full_string not linked to any existing member.`
          );
        }
        authorOrder++;
      }
    }



    // 5. 获取完整的publication数据（包含authors关系）用于返回
    const completePublication = await prisma.publication.findUnique({
      where: { id: newPublication.id },
      include: {
        authors: {
          include: {
            author: {
              select: { id: true, name_en: true, name_zh: true },
            },
          },
          orderBy: { author_order: "asc" },
        },
      },
    });

    // 6. Return success response with complete data
    return NextResponse.json(
      { success: true, data: completePublication },
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
      {
        success: false,
        error: { code: "PUBLICATION_CREATION_FAILED", message },
      },
      { status: statusCode }
    );
  }
}

// TODO: Implement PUT/DELETE handlers in a separate [id]/route.ts file
