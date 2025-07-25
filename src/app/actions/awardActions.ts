'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Award } from '@prisma/client'; // Import Award type

// --- Type for Award Form Data ---
// Assuming Award model has 'id', 'member_id', 'year', 'content'
// Omit id and member_id as they are handled by the action/database
export type AwardFormData = Omit<Award, 'id' | 'member_id'>;

// --- Action to ADD a new Award Record ---
export async function addAwardRecord(
  member_id: string, // Use correct foreign key name
  data: AwardFormData
): Promise<{ success: boolean; error?: string; award?: Award }> {

  console.log(`Action: Adding award record for member ${member_id}`);

  // --- Input Validation ---
  if (!member_id) {
    return { success: false, error: "Member ID is required." };
  }
  if (!data || typeof data !== 'object') {
     return { success: false, error: "Award data is required." };
  }
  if (!data.content) { // Content is likely the main required field
      return { success: false, error: "Award content is required." };
  }
   // Optional: Validate year format
   if (data.year && isNaN(Number(data.year))) {
       return { success: false, error: "Invalid Year format." };
   }

  // --- TODO: Permission Check ---
  console.warn(`Action Warning: Permission check disabled in addAwardRecord for member ${member_id}`);

  try {
    const newAward = await prisma.award.create({
      data: {
        ...data,
        // Ensure year is stored as number if passed as string/number
        year: data.year ? parseInt(data.year.toString(), 10) : null,
        member_id: member_id, // Link to the member using correct FK
      },
    });

    console.log(`Action: Successfully added award record ${newAward.id} for member ${member_id}`);

    // --- Cache Revalidation ---
    revalidatePath(`/developer/members/${member_id}/edit`);
    revalidatePath(`/members/${member_id}`);

    return { success: true, award: newAward };

  } catch (error) {
    console.error(`Action: Error adding award for member ${member_id}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while adding award.' };
  }
}

// --- Action to UPDATE an existing Award Record ---
export async function updateAwardRecord(
  awardId: number, // ID of the award record
  data: Partial<AwardFormData> // Allow partial updates
): Promise<{ success: boolean; error?: string; award?: Award }> {

   console.log(`Action: Updating award record ${awardId}`);

   // --- Input Validation ---
   if (!awardId) {
     return { success: false, error: "Award Record ID is required." };
   }
   if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
       return { success: false, error: "No update data provided." };
   }
    // Optional: Validate year format if provided
    if (data.year !== undefined && data.year !== null && isNaN(Number(data.year))) {
        return { success: false, error: "Invalid Year format." };
    }

  // --- TODO: Permission Check ---
  console.warn(`Action Warning: Permission check disabled in updateAwardRecord for award ${awardId}`);

  try {
     const updatedAward = await prisma.award.update({
       where: { id: awardId },
       data: {
         ...data,
         // Ensure year is updated as number if provided
         year: data.year !== undefined ? (data.year ? parseInt(data.year.toString(), 10) : null) : undefined,
       },
     });

     console.log(`Action: Successfully updated award record ${awardId}`);

     // --- Cache Revalidation ---
     revalidatePath(`/developer/members/${updatedAward.member_id}/edit`);
     revalidatePath(`/members/${updatedAward.member_id}`);

     return { success: true, award: updatedAward };

   } catch (error) {
     console.error(`Action: Error updating award ${awardId}:`, error);
     if (error instanceof Error) {
        return { success: false, error: `Database error: ${error.message}` };
     }
     return { success: false, error: 'An unknown error occurred while updating award.' };
   }
}


// --- Action to DELETE an Award Record ---
export async function deleteAwardRecord(
  awardId: number
): Promise<{ success: boolean; error?: string }> {

  console.log(`Action: Deleting award record ${awardId}`);

  // --- Input Validation ---
  if (!awardId) {
    return { success: false, error: "Award Record ID is required." };
  }

  // --- TODO: Permission Check ---
   console.warn(`Action Warning: Permission check disabled in deleteAwardRecord for award ${awardId}`);

  try {
    // Store member_id before deleting for revalidation path
    const awardToDelete = await prisma.award.findUnique({ where: { id: awardId }, select: { member_id: true }});
    const member_id = awardToDelete?.member_id;

    await prisma.award.delete({
      where: { id: awardId },
    });

    console.log(`Action: Successfully deleted award record ${awardId}`);

    // --- Cache Revalidation ---
    if (member_id) {
        revalidatePath(`/developer/members/${member_id}/edit`);
        revalidatePath(`/members/${member_id}`);
        console.log(`Action: Revalidated paths after deleting award for member ${member_id}`);
    }

    return { success: true };

  } catch (error) {
    console.error(`Action: Error deleting award ${awardId}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while deleting award.' };
  }
}
