import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// TODO: Replace with proper session/permission check later
async function checkAdminPermission(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("dev_auth");
  if (authCookie && authCookie.value === "true") {
    console.warn("[API Get Users] Using temporary insecure permission check.");
    return true;
  }
  return false;
}

export async function GET(request: Request) {
  console.log("[API Get Users] Received request.");

  try {
    // 1. Check permission (Temporary)
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[API Get Users] Permission denied.");
      return NextResponse.json(
        { success: false, error: "Permission denied." },
        { status: 403 },
      );
    }

    // 2. Fetch users from database
    console.log("[API Get Users] Fetching members from database...");
    const members = await prisma.member.findMany({
      select: {
        id: true,
        username: true,
        role_name: true,
        email: true,
        name_en: true, // Include English name
        is_active: true, // Might be useful to show status
      },
      orderBy: {
        name_en: "asc", // Order by name
      },
    });
    console.log(`[API Get Users] Found ${members.length} members.`);

    // 3. Return user list
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error("[API Get Users] Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An internal server error occurred while fetching users.",
      },
      { status: 500 },
    );
  }
}
