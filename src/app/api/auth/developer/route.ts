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
// const prisma = new PrismaClient();
console.log("[API Auth] Instantiated new PrismaClient for this request.");

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
    // Keep local Prisma instance instantiation logic commented/removed if it was like that
    // const prisma = new PrismaClient(...);

    try {
        console.log(`[API Auth - BYPASS ACTIVE] Environment DATABASE_URL: ${process.env.DATABASE_URL}`); // Log still useful

        const body: LoginRequestBody = await request.json();
        const { username, password } = body; // We still receive them, just don't use them

        console.log(`[API Auth - BYPASS ACTIVE] Received login attempt for username: \"${username}\" (Credentials ignored)`);

        // Basic validation still useful
        if (!username || !password) {
             return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Username and password are required (even if bypassed).' }}, { status: 400 });
        }

        // --- BYPASSED: Database Query and Validation ---
        console.warn("[API Auth - BYPASS ACTIVE] Skipping database query and password validation for presentation.");
        /*
        // --- Original Database Query Logic (commented out) ---
        const memberResult = await prisma.$queryRawUnsafe<...>(...);
        const member = memberResult.length > 0 ? memberResult[0] : null;
        if (!member || !member.password_hash) {
            return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' }}, { status: 401 });
        }
        */

        // --- BYPASSED: Password Comparison ---
        /*
        const isPasswordValid = await bcrypt.compare(password, member.password_hash);
        if (!isPasswordValid) {
             return NextResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' }}, { status: 401 });
        }
        */

        // --- Always Grant Success (Temporary) ---
        console.log(`[API Auth - BYPASS ACTIVE] Granting default DEVELOPER access.`);
        const responseData: LoginSuccessResponse = {
            success: true,
            permissions: ['DEVELOPER'], // Grant default permissions
            isFullAccess: true,         // Assume full access for developer
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("[API Auth Error - Bypass Active]", error);
        if (error instanceof SyntaxError) {
             return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid request body.' }}, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' }}, { status: 500 });
    } finally {
        // No local prisma instance to disconnect if commented out
        // await prisma?.$disconnect(); // Use optional chaining if prisma might not exist
        console.log("[API Auth - Bypass Active] Request finished.");
    }
}
