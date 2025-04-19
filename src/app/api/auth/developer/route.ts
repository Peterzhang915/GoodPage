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
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Instantiate Prisma Client
const prisma = new PrismaClient();

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
        const body: LoginRequestBody = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'Username and password are required.' }
            }, { status: 400 });
        }

        // --- Find member in database --- 
        const member = await prisma.member.findUnique({
            where: { username: username },
        });

        // --- Validate member and password --- 
        if (!member || !member.password_hash) {
            // User not found or password not set
            console.warn(`Login attempt failed for username: ${username}. User not found or no password hash.`);
            return NextResponse.json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' }
            }, { status: 401 });
        }

        // Compare provided password with stored hash
        const isPasswordValid = await bcrypt.compare(password, member.password_hash);

        if (!isPasswordValid) {
            // Password does not match
            console.warn(`Login attempt failed for username: ${username}. Incorrect password.`);
            return NextResponse.json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' }
                // Note: Login attempt tracking is currently handled client-side
            }, { status: 401 });
        }

        // --- Authentication Successful --- 

        // Determine permissions and full access based on role_name
        const resolvedPermissions = member.role_name ? [member.role_name] : []; // Use role_name as the permission
        // Example: Define which roles have full access
        const fullAccessRoles = ['ADMIN']; // Add other roles if needed
        const resolvedIsFullAccess = member.role_name ? fullAccessRoles.includes(member.role_name) : false;

        // TODO: Implement proper session management (e.g., using iron-session or next-auth)
        // to set a secure HttpOnly cookie instead of returning data directly.
        const responseData: LoginSuccessResponse = {
            success: true,
            permissions: resolvedPermissions,
            isFullAccess: resolvedIsFullAccess,
        };

        console.log(`Login successful for user: ${username}, Role: ${member.role_name || 'None'}`);
        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("[API Auth Error]", error);
        // Handle JSON parsing errors or other unexpected errors
        if (error instanceof SyntaxError) {
             return NextResponse.json({
                success: false,
                error: { code: 'INVALID_JSON', message: 'Invalid request body.' }
            }, { status: 400 });
        }
        // Added check for bcrypt errors (though unlikely here)
        if (error instanceof Error && error.message.includes('bcrypt')) {
             return NextResponse.json({
                success: false,
                error: { code: 'AUTH_SERVICE_ERROR', message: 'Authentication service error.' }
            }, { status: 500 });
        }
        return NextResponse.json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' }
        }, { status: 500 });
    } finally {
        // Ensure Prisma Client is disconnected after the request is handled
        // This might not be necessary with Next.js API routes depending on Prisma setup,
        // but can be good practice in some environments.
        // await prisma.$disconnect(); // Comment out if causing issues or handled globally
    }
}
