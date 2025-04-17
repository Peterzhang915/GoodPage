// src/app/api/auth/developer/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Example for potential cookie usage

// TODO: Implement a more robust session management solution (e.g., next-auth or iron-session)
// TODO: Implement rate limiting and lockout logic to prevent brute-force attacks

// Placeholder for where you might store attempt counts (in-memory for demo, use Redis/DB in prod)
const loginAttempts: Record<string, { attempts: number; lockUntil: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }

    const developerKey = process.env.DEVELOPER_ACCESS_KEY;

    if (!developerKey) {
      console.error('[API Auth Error] DEVELOPER_ACCESS_KEY environment variable is not set.');
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // --- TODO: Implement Rate Limiting & Lockout Logic --- 
    // Example basic check (needs proper implementation):
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'; // Get client IP (consider reliability)
    const attemptInfo = loginAttempts[clientIp] || { attempts: 0, lockUntil: 0 };

    if (attemptInfo.lockUntil > Date.now()) {
       const remainingSeconds = Math.ceil((attemptInfo.lockUntil - Date.now()) / 1000);
       return NextResponse.json({
         success: false,
         error: `Account locked due to too many failed attempts. Try again in ${remainingSeconds} seconds.`,
         locked: true,
         attemptsRemaining: 0
       }, { status: 429 }); // Too Many Requests
    }
    // --- End TODO ---

    if (key === developerKey) {
      // --- Authentication Successful ---
      delete loginAttempts[clientIp];

      // TODO: Define actual permissions based on the key or user (for future expansion)
      const permissions = ['manage_news', 'manage_photos', 'manage_members', 'manage_codeservers', 'manage_ops', 'generate_keys', 'manage_publications', 'view_logs'];
      const isFullAccess = true;

      // TODO: Create a secure session/cookie (e.g., using iron-session or next-auth)
      // Example: Set a simple cookie (replace with robust session management)
      // Create the response object first, using the defined permissions and access level
      const response = NextResponse.json({
        success: true,
        message: 'Authentication successful',
        permissions: permissions, 
        isFullAccess: isFullAccess
      });

      // Set the cookie on the response object
      response.cookies.set('dev_auth', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 8, // Example: 8 hours expiration
          sameSite: 'lax'
      });

      return response; // Return the response with the cookie set

    } else {
      // --- Authentication Failed ---
      attemptInfo.attempts += 1;
      let attemptsRemaining = MAX_ATTEMPTS - attemptInfo.attempts;
      let errorMsg = 'Invalid password or key.';
      let locked = false;

      if (attemptsRemaining <= 0) {
        attemptInfo.lockUntil = Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000;
        attemptsRemaining = 0;
        locked = true;
        errorMsg = `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`;
      }

      loginAttempts[clientIp] = attemptInfo; // Store updated attempt info

      return NextResponse.json({
        success: false,
        error: errorMsg,
        attemptsRemaining: attemptsRemaining,
        locked: locked
      }, { status: 401 }); // Unauthorized
    }

  } catch (error) {
    console.error('[API Auth Error]', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred' }, { status: 500 });
  }
} 