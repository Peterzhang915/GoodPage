import { NextResponse, NextRequest } from "next/server";
import {
  getEducationRecordById,
  updateEducationRecord,
  deleteEducationRecord,
} from "@/lib/members";
// TODO: Add authentication and authorization checks

// GET handler for fetching a single education record
export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string; educationId: string } } // Define type directly
) {
  // TODO: Check read permissions?
  const { educationId: educationIdStr } = params;
  const educationId = parseInt(educationIdStr, 10);

  if (isNaN(educationId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid Education ID" } },
      { status: 400 }
    );
  }

  try {
    const education = await getEducationRecordById(educationId);
    if (!education) {
      return NextResponse.json(
        { success: false, error: { message: "Education record not found" } },
        { status: 404 }
      );
    }
    // Optional: Check if the record actually belongs to the memberId in the URL (for authorization)
    // if (education.member_id !== params.memberId) { ... return 403 or 404 ... }
    return NextResponse.json({ success: true, data: education });
  } catch (error) {
    console.error(`[API] Failed to fetch education ${educationId}:`, error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}

// PATCH handler for updating an existing education record
export async function PATCH(
  request: NextRequest,
  { params }: { params: { memberId: string; educationId: string } } // Define type directly
) {
  // TODO: Check update permissions
  const { educationId: educationIdStr } = params;
  const educationId = parseInt(educationIdStr, 10);

  if (isNaN(educationId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid Education ID" } },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: { message: "Invalid request body" } },
        { status: 400 }
      );
    }

    // Optional: Add authorization check - does user have permission to update this specific record?

    const updatedEducation = await updateEducationRecord(educationId, data);
    return NextResponse.json({ success: true, data: updatedEducation });
  } catch (error) {
    console.error(`[API] Failed to update education ${educationId}:`, error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    // Add more specific error handling (e.g., 404 if record not found by update function)
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}

// DELETE handler for deleting an education record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string; educationId: string } } // Define type directly
) {
  // TODO: Check delete permissions
  const { educationId: educationIdStr } = params;
  const educationId = parseInt(educationIdStr, 10);

  if (isNaN(educationId)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid Education ID" } },
      { status: 400 }
    );
  }

  try {
    // Optional: Add authorization check

    await deleteEducationRecord(educationId);
    return NextResponse.json({
      success: true,
      message: "Education record deleted successfully.",
    });
  } catch (error) {
    console.error(`[API] Failed to delete education ${educationId}:`, error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    // Add more specific error handling (e.g., 404 if record not found by delete function)
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { success: false, error: { message } },
      { status }
    );
  }
}
