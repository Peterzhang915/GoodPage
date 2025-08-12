import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // To potentially check auth cookie
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import generator from "generate-password";

const saltRounds = 10;

// Helper function to check caller permissions (TEMPORARY AND INSECURE)
// TODO: Replace this with proper session validation and permission check based on session data
async function checkAdminPermission(): Promise<boolean> {
  // Await the cookies() call
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("dev_auth");
  // Extremely basic check - assumes presence of cookie means admin for now.
  // THIS IS NOT SECURE FOR PRODUCTION.
  if (authCookie && authCookie.value === "true") {
    // In a real system, decode the session/token in the cookie,
    // look up the user, and check their actual permissions from the DB.
    // For now, we grant permission if the basic cookie exists.
    console.warn(
      "[API Reset Password] Using temporary insecure permission check."
    );
    return true; // Assume admin if basic cookie exists
  }
  return false;
}

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  const targetUsername = params.username;

  console.log(
    `[API Reset Password] Attempting to reset password for user: ${targetUsername}`
  );

  try {
    // 1. Check if the CALLER has permission (Temporary Check)
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn(`[API Reset Password] Permission denied for caller.`);
      return NextResponse.json(
        { success: false, error: "Permission denied." },
        { status: 403 }
      ); // Forbidden
    }

    // 2. Find the target user
    const user = await prisma.member.findUnique({
      where: { username: targetUsername },
      select: { id: true }, // Check if user exists
    });

    if (!user) {
      console.log(
        `[API Reset Password] Target user not found: ${targetUsername}`
      );
      return NextResponse.json(
        { success: false, error: `User '${targetUsername}' not found.` },
        { status: 404 }
      );
    }

    // 3. Generate a strong password
    const newPassword = generator.generate({
      length: 14, // Adjust length as needed
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      strict: true, // Ensure all character types are present
    });
    console.log(
      `[API Reset Password] Generated new password for ${targetUsername}`
    );

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log(
      `[API Reset Password] Hashed new password for ${targetUsername}`
    );

    // 5. Update the user's password hash in the database
    await prisma.member.update({
      where: { username: targetUsername },
      data: { password_hash: hashedPassword },
    });
    console.log(
      `[API Reset Password] Updated password hash in DB for ${targetUsername}`
    );

    // 6. Return success and the generated password (for admin to convey)
    return NextResponse.json({
      success: true,
      message: `Password for '${targetUsername}' has been reset successfully.`,
      newPassword: newPassword, // IMPORTANT: Return the plaintext password
    });
  } catch (error) {
    console.error(
      `[API Reset Password] Error resetting password for ${targetUsername}:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "An internal server error occurred during password reset.",
      },
      { status: 500 }
    );
  }
}
