// src/app/api/auth/developer/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Removed imports for config files
// import {
//     developerCredentials,
//     developerPermissions,
//     DeveloperCredential,
//     DeveloperPermission,
// } from '@/config/developerCredentials';

// --- Import Prisma Client and bcrypt ---
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

// Instantiate Prisma Client
const prisma = new PrismaClient();
console.log("[API Auth] Initialized Prisma Client for developer auth request.");

// Define the expected request body structure
interface LoginRequestBody {
    username?: string;
    password?: string;
}

// Define the success response data structure
interface LoginSuccessResponse {
    success: true;
    permissions: string[]; // Will contain the role_name
    isFullAccess: boolean; // Determined by role_name
}

// Define the error response data structure
interface LoginErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
    };
}

/**
 * POST handler for developer authentication.
 * Validates username and password against database using Prisma and bcrypt.
 *
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object with success/error status and data.
 */
export async function POST(request: NextRequest): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
    try {
        console.log(`[API Auth] Received developer login request.`);

        const body: LoginRequestBody = await request.json();
        const { username, password } = body;

        console.log(`[API Auth] Attempting login for username: \"${username}\"`);

        if (!username || !password) {
             console.warn("[API Auth] Bad Request: Username or password missing.");
             return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Username and password are required.' }}, { status: 400 });
        }

        console.log(`[API Auth] Querying database for member: ${username}`);
        const member = await prisma.member.findUnique({
            where: { username: username },
            // No include needed if role is directly on Member model as role_name
        });

        if (!member || !member.password_hash) {
            console.warn(`[API Auth] Login failed: User \"${username}\" not found or has no password hash.`);
            return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' }}, { status: 401 });
        }
        console.log(`[API Auth] Found member: ${username}. Comparing password...`);

        const isPasswordValid = await bcrypt.compare(password, member.password_hash);
        if (!isPasswordValid) {
            console.warn(`[API Auth] Login failed: Incorrect password for user \"${username}\".`);
            return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' }}, { status: 401 });
        }

        console.log(`[API Auth] Login successful for user: ${username}. Determining permissions.`);

        // Get role directly from the member object
        const roles = member.role_name ? [member.role_name] : []; // Assume role_name is a string like 'Admin'
        const isFullAccess = roles.includes('Root') || roles.includes('Admin'); // Example logic

        console.log(`[API Auth] User roles: ${roles.join(', ')}. Full Access: ${isFullAccess}`);

        const responseData: LoginSuccessResponse = {
            success: true,
            permissions: roles,
            isFullAccess: isFullAccess,
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("[API Auth Error]", error);

        // Handle JSON parsing error first
        if (error instanceof SyntaxError) {
            console.warn("[API Auth] Error: Invalid JSON in request body.");
            return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body.' }}, { status: 400 });
        }

        // Check if error is a Prisma known request error (like unique constraint violation)
        if (typeof error === 'object' && error !== null && 'code' in error) {
            const prismaError = error as { code: string; message?: string }; // Type assertion
            console.warn(`[API Auth] Prisma Error ${prismaError.code}: ${prismaError.message ?? 'No message'}`);
            // Potentially return a more specific error message based on error.code
            return NextResponse.json({ success: false, error: { code: 'DATABASE_ERROR', message: 'A database error occurred.' }}, { status: 500 });
        }

        // Handle generic errors
        const errorMessage = (error instanceof Error) ? error.message : 'An unexpected error occurred.';

        // Generic internal server error for other cases
        return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: errorMessage }}, { status: 500 });
    } finally {
        await prisma.$disconnect();
        console.log("[API Auth] Request finished.");
    }
}
