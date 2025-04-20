import { NextResponse } from "next/server";
import { getAllMembersForManager } from "@/lib/members";
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
// Import Prisma types
import { MemberStatus } from '@prisma/client';
// import { checkAdminPermission } from '@/lib/auth'; // Assuming an auth check function exists - TODO: Implement/find this

export async function GET() {
  try {
    const members = await getAllMembersForManager();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error("API Error fetching members:", error);
    // Extract error message safely
    const message = error instanceof Error ? error.message : "Internal Server Error";
    // Return a standard error response
    return NextResponse.json(
      { success: false, error: { code: 'MEMBER_FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}

// Define the expected request body structure with changes
interface AddMemberRequestBody {
  username: string;
  name_en: string;
  name_zh?: string;
  email: string;
  status: MemberStatus;
  role_name?: string;
  enrollment_year?: number | null;
  title_en?: string;
  title_zh?: string;
  office_location?: string;
  github_username?: string;
  personal_website?: string;
  research_interests?: string;
}

// POST /api/members - Create a new member
export async function POST(request: Request) {
  console.log('[API Post Member] Received request.');

  try {
    // 1. TODO: Implement Permission Check (Ensure only admins can add members)
    // const isAdmin = await checkAdminPermission(); // Implement this check based on your auth setup
    // if (!isAdmin) {
    //   console.warn('[API Post Member] Permission denied.');
    //   return NextResponse.json(
    //     { success: false, error: 'Permission denied. Admin role required.' },
    //     { status: 403 },
    //   );
    // }
    // console.log('[API Post Member] Permission check passed.');

    // 2. Parse Request Body
    let body: AddMemberRequestBody;
    try {
      body = await request.json();
      console.log('[API Post Member] Request body parsed:', body);
    } catch (e) {
      console.error('[API Post Member] Error parsing request body:', e);
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    // 3. Validate Input Data
    const {
      username,
      name_en,
      name_zh,
      email,
      status,
      role_name,
      enrollment_year,
      title_en,
      title_zh,
      office_location,
      github_username,
      personal_website,
      research_interests,
    } = body;

    // Basic required field check (as before)
    if (!username || !name_en || !email || !status || !role_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: username, name_en, email, status, and role_name are required.' },
        { status: 400 },
      );
    }

    // Validate status enum
    if (!Object.values(MemberStatus).includes(status)) {
        return NextResponse.json(
            { success: false, error: `Invalid status value: ${status}` },
            { status: 400 }
        );
    }

    // Validate enrollment year
    if (enrollment_year && (typeof enrollment_year !== 'number' || !Number.isInteger(enrollment_year) || enrollment_year < 1900 || enrollment_year > 2100)) {
         return NextResponse.json(
            { success: false, error: `Invalid enrollment year: ${enrollment_year}. Must be a valid year.` },
            { status: 400 }
        );
    }

    // Optional: Add validation for personal_website URL format
    if (personal_website && !isValidHttpUrl(personal_website)) {
        return NextResponse.json(
            { success: false, error: `Invalid Personal Website URL format.` },
            { status: 400 }
        );
    }

    // 4. Check for existing user/email
    const existingMember = await prisma.member.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingMember) {
      const conflictField = existingMember.username === username ? 'Username' : 'Email';
      console.warn(`[API Post Member] Conflict: ${conflictField} already exists.`);
      return NextResponse.json(
        { success: false, error: `${conflictField} already exists.` },
        { status: 409 }, // Conflict
      );
    }

    // 5. Create Member in Database
    console.log('[API Post Member] Creating member in database (adjusting fields)...');
    try {
        const newMember = await prisma.member.create({
        data: {
            username,
            name_en,
            name_zh: name_zh || null,
            email,
            password_hash: null,
            status,
            role_name: role_name,
            is_active: true,
            enrollment_year: enrollment_year ?? null,
            title_en: title_en || null,
            title_zh: title_zh || null,
            office_location: office_location || null,
            github_username: github_username || null,
            personal_website: personal_website || null,
            research_interests: research_interests || null,
        },
        select: { 
            id: true, username: true, name_en: true, name_zh: true, email: true,
            status: true, role_name: true, createdAt: true,
            enrollment_year: true, title_en: true, title_zh: true, office_location: true,
            github_username: true,
            personal_website: true,
            research_interests: true,
        },
        });
        console.log('[API Post Member] Member created successfully:', newMember);

        // 6. Return Success Response
        return NextResponse.json(
            { success: true, data: newMember, message: "Member created. Set password using the script API call." },
            { status: 201 },
        );
    } catch (prismaError) {
        console.error('[API Post Member] Prisma error creating member:', prismaError);
         // Check for specific Prisma errors if needed
         if (prismaError instanceof Error && 'code' in prismaError && prismaError.code === 'P2002') { // Example: Unique constraint violation
             return NextResponse.json(
                { success: false, error: 'A unique constraint violation occurred. Check username or email.' },
                { status: 409 } // Conflict
            );
         }
        return NextResponse.json(
            { success: false, error: 'Database error occurred while creating member.' },
            { status: 500 }
        );
    }

  } catch (error) {
    console.error('[API Post Member] Internal server error:', error);
    // Log the specific error for debugging
    if (error instanceof Error) {
        console.error(`[API Post Member] Error details: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 },
    );
  }
}

// Helper function for basic URL validation (can be placed in a lib file)
function isValidHttpUrl(string: string): boolean {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// Ensure bcrypt types are installed: npm install bcrypt @types/bcrypt --save-dev
// Ensure you have a checkAdminPermission function (e.g., in @/lib/auth)
