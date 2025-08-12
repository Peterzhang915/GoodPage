"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
// import { ensureAuthenticated } from './auth'; // Assuming you have an auth utility - Temporarily commented out

// --- Zod Schema for Validation ---

const PresentationFormSchema = z.object({
  title: z.string().min(1, "Presentation title cannot be empty."),
  eventName: z.string().optional().nullable(), // Optional: Conference/Event Name
  conferenceUrl: z
    .string()
    .url("Invalid URL format for conference link.")
    .optional()
    .or(z.literal(""))
    .nullable(), // Optional URL
  location: z.string().optional().nullable(),
  year: z.coerce
    .number()
    .int()
    .positive("Year must be a positive integer.")
    .optional()
    .nullable(),
  url: z
    .string()
    .url("Invalid URL format for slides/video link.")
    .optional()
    .or(z.literal(""))
    .nullable(), // Optional URL for slides/video
  isInvited: z.boolean(),
  // display_order might be handled separately or default
});

export type PresentationFormData = z.infer<typeof PresentationFormSchema>;

// --- Server Actions ---

/**
 * Adds a new presentation record for a member.
 */
export async function addPresentationRecord(
  memberId: string,
  data: PresentationFormData
): Promise<{
  success: boolean;
  error?: string;
  presentation?: Prisma.PresentationGetPayload<{}>;
}> {
  try {
    // await ensureAuthenticated();
    const validatedData = PresentationFormSchema.parse(data);

    const newPresentation = await prisma.presentation.create({
      data: {
        member_id: memberId,
        title: validatedData.title,
        event_name: validatedData.eventName,
        conference_url: validatedData.conferenceUrl,
        location: validatedData.location,
        year: validatedData.year,
        url: validatedData.url,
        is_invited: validatedData.isInvited,
        // display_order defaults to 0 in schema
      },
    });

    revalidatePath(`/developer/members/edit/${memberId}`);
    return { success: true, presentation: newPresentation };
  } catch (error: any) {
    console.error("Error adding presentation:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: JSON.stringify(error.flatten().fieldErrors),
      };
    }
    return {
      success: false,
      error: error.message || "Failed to add presentation record.",
    };
  }
}

/**
 * Updates an existing presentation record.
 */
export async function updatePresentationRecord(
  presentationId: number,
  data: PresentationFormData
): Promise<{
  success: boolean;
  error?: string;
  presentation?: Prisma.PresentationGetPayload<{}>;
}> {
  try {
    // await ensureAuthenticated();
    const validatedData = PresentationFormSchema.parse(data);

    const existingPresentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
    });
    if (!existingPresentation) {
      return { success: false, error: "Presentation record not found." };
    }

    const updatedPresentation = await prisma.presentation.update({
      where: { id: presentationId },
      data: {
        title: validatedData.title,
        event_name: validatedData.eventName,
        conference_url: validatedData.conferenceUrl,
        location: validatedData.location,
        year: validatedData.year,
        url: validatedData.url,
        is_invited: validatedData.isInvited,
        // display_order not updated here, could be added if needed
      },
    });

    revalidatePath(`/developer/members/edit/${existingPresentation.member_id}`);
    return { success: true, presentation: updatedPresentation };
  } catch (error: any) {
    console.error("Error updating presentation:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: JSON.stringify(error.flatten().fieldErrors),
      };
    }
    return {
      success: false,
      error: error.message || "Failed to update presentation record.",
    };
  }
}

/**
 * Deletes a presentation record.
 */
export async function deletePresentationRecord(
  presentationId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // await ensureAuthenticated();

    const existingPresentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      select: { member_id: true },
    });
    if (!existingPresentation) {
      return { success: false, error: "Presentation record not found." };
    }

    await prisma.presentation.delete({
      where: { id: presentationId },
    });

    revalidatePath(`/developer/members/edit/${existingPresentation.member_id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting presentation:", error);
    return {
      success: false,
      error: error.message || "Failed to delete presentation record.",
    };
  }
}
