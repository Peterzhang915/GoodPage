// src/app/api/auth/developer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    developerCredentials,
    developerPermissions,
    DeveloperCredential,
    DeveloperPermission,
} from '@/config/developerCredentials';

// Define the expected request body structure
interface LoginRequestBody {
    username?: string;
    password?: string;
}

// Define the success response data structure
interface LoginSuccessResponse {
    success: true;
    permissions: string[];
    isFullAccess: boolean;
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
 * Validates username and password against configured credentials.
 * 
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object with success/error status and data.
 */
export async function POST(request: NextRequest): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
    try {
        const body: LoginRequestBody = await request.json();
        const { username, password } = body;

        // Basic validation for request body
        if (!username || !password) {
            return NextResponse.json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'Username and password are required.' }
            }, { status: 400 });
        }

        // Find the developer credential
        const developer = developerCredentials.find((dev: DeveloperCredential) => dev.username === username);

        // --- SECURITY WARNING --- 
        // Plaintext password comparison - ONLY FOR DEVELOPMENT.
        // In production, use password hashing (e.g., bcrypt) for storage and comparison.
        // --- END SECURITY WARNING ---
        if (!developer || developer.password !== password) {
            // TODO: Implement server-side rate limiting and lockout logic later.
            // Current lockout logic is handled client-side via useDeveloperLogin hook.
            return NextResponse.json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' }
            }, { status: 401 });
        }

        // Find permissions for the authenticated developer
        const devPerms = developerPermissions.find((p: DeveloperPermission) => p.username === username);
        const resolvedPermissions = devPerms?.permissions ?? [];
        const resolvedIsFullAccess = devPerms?.isFullAccess ?? false;

        // TODO: Implement proper session management (e.g., using iron-session or next-auth) 
        // to set a secure HttpOnly cookie instead of returning data directly.
        // For now, returning data directly to align with current frontend hook state.
        const responseData: LoginSuccessResponse = {
            success: true,
            permissions: resolvedPermissions,
            isFullAccess: resolvedIsFullAccess,
        };

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
        return NextResponse.json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' }
        }, { status: 500 });
    }
}
