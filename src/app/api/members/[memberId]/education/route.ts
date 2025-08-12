import { NextResponse, NextRequest } from "next/server";
import { createEducationRecord } from "@/lib/members";
// TODO: Add authentication and authorization checks

interface Params {
  params: Promise<{ memberId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  // TODO: Check user permission (e.g., is admin or the member themselves?)
  const resolvedParams = await params;
  const { memberId } = resolvedParams;
  if (!memberId) {
    return NextResponse.json(
      { success: false, error: { message: "Member ID is required" } },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();

    // Basic validation (more robust validation with Zod/Yup would be better)
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: { message: "Invalid request body" } },
        { status: 400 }
      );
    }
    if (!data.degree || !data.school) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Degree and School are required" },
        },
        { status: 400 }
      );
    }

    const newEducation = await createEducationRecord(memberId, data);
    return NextResponse.json({ success: true, data: newEducation });
  } catch (error) {
    console.error(
      `[API] Failed to create education for member ${memberId}:`,
      error
    );
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    // Determine appropriate status code based on error type if possible
    const status = message.includes("required") ? 400 : 500;
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
