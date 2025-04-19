'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Teaching } from '@/lib/prisma'; // Import Teaching type

// --- Type for Teaching Form Data ---
// Omit id and member_id as they are handled by the action/database
export type TeachingFormData = Omit<Teaching, 'id' | 'member_id'>;

// --- Action to ADD a new Teaching Record ---
export async function addTeachingRecord(
  member_id: string,
  data: TeachingFormData
): Promise<{ success: boolean; error?: string; teaching?: Teaching }> {

  console.log(`Action: Adding teaching record for member ${member_id}`);

  // --- Input Validation ---
  if (!member_id) {
    return { success: false, error: "Member ID is required." };
  }
  if (!data || typeof data !== 'object') {
     return { success: false, error: "Teaching data is required." };
  }
  // Course Title is the main required field based on schema
  if (!data.course_title) {
      return { success: false, error: "Course Title is required." };
  }
  // Optional: Validate year format
  if (data.year && isNaN(Number(data.year))) {
       return { success: false, error: "Invalid Year format." };
  }
  // Optional: Validate URL format if provided
  if (data.description_url && !/^https?:\/\/.+/.test(data.description_url)) {
       return { success: false, error: "Invalid Description URL format." };
  }


  // --- TODO: Permission Check ---
  console.warn(`Action Warning: Permission check disabled in addTeachingRecord for member ${member_id}`);

  try {
    const newTeaching = await prisma.teaching.create({
      data: {
        ...data,
        // Ensure numerical fields are stored correctly
        year: data.year ? parseInt(data.year.toString(), 10) : null,
        // Use DB default for role if not provided or empty
        role: data.role || undefined, // Let Prisma handle default if empty/null
        // Use DB default for display_order if not provided
        display_order: data.display_order ?? undefined, // Let Prisma handle default if null/undefined
        member_id: member_id, // Link to the member
      },
    });

    console.log(`Action: Successfully added teaching record ${newTeaching.id} for member ${member_id}`);

    // --- Cache Revalidation ---
    revalidatePath(`/developer/members/${member_id}/edit`);
    revalidatePath(`/members/${member_id}`); // Also revalidate public profile if applicable

    return { success: true, teaching: newTeaching };

  } catch (error) {
    console.error(`Action: Error adding teaching record for member ${member_id}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while adding teaching record.' };
  }
}

// --- Action to UPDATE an existing Teaching Record ---
export async function updateTeachingRecord(
  teachingId: number, // ID of the teaching record
  data: Partial<TeachingFormData> // Allow partial updates
): Promise<{ success: boolean; error?: string; teaching?: Teaching }> {

   console.log(`Action: Updating teaching record ${teachingId}`);

   // --- Input Validation ---
   if (!teachingId) {
     return { success: false, error: "Teaching Record ID is required." };
   }
   if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
       return { success: false, error: "No update data provided." };
   }
    // Optional: Validate year format if provided
    if (data.year !== undefined && data.year !== null && isNaN(Number(data.year))) {
        return { success: false, error: "Invalid Year format." };
    }
     // Optional: Validate URL format if provided
    if (data.description_url !== undefined && data.description_url !== null && data.description_url !== '' && !/^https?:\/\/.+/.test(data.description_url)) {
        return { success: false, error: "Invalid Description URL format." };
    }

  // --- TODO: Permission Check ---
  console.warn(`Action Warning: Permission check disabled in updateTeachingRecord for teaching record ${teachingId}`);

  try {
     const updatedTeaching = await prisma.teaching.update({
       where: { id: teachingId },
       data: {
         ...data,
         // Ensure year is updated as number if provided
         year: data.year !== undefined ? (data.year ? parseInt(data.year.toString(), 10) : null) : undefined,
         // Handle empty string for role - should it reset to default or be empty? Assuming reset to default.
         role: data.role === '' ? undefined : data.role, // Reset to default if empty string passed
         // display_order should update normally if provided
         display_order: data.display_order,
    },
  });

     console.log(`Action: Successfully updated teaching record ${teachingId}`);

     // --- Cache Revalidation ---
     revalidatePath(`/developer/members/${updatedTeaching.member_id}/edit`);
     revalidatePath(`/members/${updatedTeaching.member_id}`);

     return { success: true, teaching: updatedTeaching };

   } catch (error) {
     console.error(`Action: Error updating teaching record ${teachingId}:`, error);
     if (error instanceof Error) {
        return { success: false, error: `Database error: ${error.message}` };
     }
     return { success: false, error: 'An unknown error occurred while updating teaching record.' };
   }
}


// --- Action to DELETE a Teaching Record ---
export async function deleteTeachingRecord(
  teachingId: number
): Promise<{ success: boolean; error?: string }> {

  console.log(`Action: Deleting teaching record ${teachingId}`);

  // --- Input Validation ---
  if (!teachingId) {
    return { success: false, error: "Teaching Record ID is required." };
  }

  // --- TODO: Permission Check ---
   console.warn(`Action Warning: Permission check disabled in deleteTeachingRecord for teaching record ${teachingId}`);

  try {
    // Store member_id before deleting for revalidation path
    const teachingToDelete = await prisma.teaching.findUnique({ where: { id: teachingId }, select: { member_id: true }});
    const member_id = teachingToDelete?.member_id;

    await prisma.teaching.delete({
      where: { id: teachingId },
    });

    console.log(`Action: Successfully deleted teaching record ${teachingId}`);

    // --- Cache Revalidation ---
    if (member_id) {
        revalidatePath(`/developer/members/${member_id}/edit`);
        revalidatePath(`/members/${member_id}`);
        console.log(`Action: Revalidated paths after deleting teaching record for member ${member_id}`);
    }

    return { success: true };

  } catch (error) {
    console.error(`Action: Error deleting teaching record ${teachingId}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while deleting teaching record.' };
  }
} 
