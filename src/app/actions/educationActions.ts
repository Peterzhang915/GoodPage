'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Education } from '@prisma/client'; // Import Education type

// --- Type for Education Form Data (excluding id and member_id) ---
// Ensure Omit uses the correct foreign key name 'member_id'
export type EducationFormData = Omit<Education, 'id' | 'member_id'>;


// --- Action to ADD a new Education Record ---
export async function addEducationRecord(
  member_id: string, // Changed parameter name to match schema
  data: EducationFormData
): Promise<{ success: boolean; error?: string; education?: Education }> {

  console.log(`Action: Adding education record for member ${member_id}`);

  // --- Input Validation ---
  if (!member_id) {
    return { success: false, error: "Member ID is required." };
  }
  if (!data || typeof data !== 'object') {
     return { success: false, error: "Education data is required." };
  }
  if (!data.school || !data.degree || !data.start_year) {
      return { success: false, error: "School, Degree, and Start Year are required." };
  }
   // Optional: More specific validation (e.g., year format)
   if (data.start_year && isNaN(Number(data.start_year))) {
     return { success: false, error: "Invalid Start Year." };
   }
   if (data.end_year && isNaN(Number(data.end_year))) {
       return { success: false, error: "Invalid End Year." };
   }

  // --- TODO: Permission Check ---
  // Can the current user add education to this member's profile?
  // const currentUser = await getCurrentUser();
  // if (!checkPermission(currentUser, 'manage_members', member_id) && currentUser.id !== member_id) {
  //   return { success: false, error: "Permission denied." };
  // }
  console.warn(`Action Warning: Permission check disabled in addEducationRecord for member ${member_id}`);

  try {
    const newEducation = await prisma.education.create({
      data: {
        ...data,
        // Ensure years are stored as numbers if they are passed as strings/numbers
        start_year: data.start_year ? parseInt(data.start_year.toString(), 10) : null,
        end_year: data.end_year ? parseInt(data.end_year.toString(), 10) : null,
        member_id: member_id, // Use correct foreign key field name
      },
    });

    console.log(`Action: Successfully added education record ${newEducation.id} for member ${member_id}`);

    // --- Cache Revalidation ---
    revalidatePath(`/developer/members/${member_id}/edit`); // Use correct field name
    revalidatePath(`/members/${member_id}`); // Use correct field name

    return { success: true, education: newEducation };

  } catch (error) {
    console.error(`Action: Error adding education for member ${member_id}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while adding education.' };
  }
}

// --- Action to UPDATE an existing Education Record ---
export async function updateEducationRecord(
  educationId: number, // Use the ID of the education record
  data: Partial<EducationFormData> // Allow partial updates
): Promise<{ success: boolean; error?: string; education?: Education }> {

   console.log(`Action: Updating education record ${educationId}`);

   // --- Input Validation ---
   if (!educationId) {
     return { success: false, error: "Education Record ID is required." };
   }
   if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
       return { success: false, error: "No update data provided." };
   }
   // Optional: Validate specific fields being updated
   if (data.start_year && isNaN(Number(data.start_year))) {
     return { success: false, error: "Invalid Start Year." };
   }
   if (data.end_year && isNaN(Number(data.end_year))) {
       return { success: false, error: "Invalid End Year." };
   }

  // --- TODO: Permission Check ---
  // Need to check if user can edit *this specific* education record.
  // const currentUser = await getCurrentUser();
  // const educationToUpdate = await prisma.education.findUnique({ where: { id: educationId }});
  // if (!educationToUpdate) return { success: false, error: "Education record not found."};
  // if (!checkPermission(currentUser, 'manage_members', educationToUpdate.member_id) && currentUser.id !== educationToUpdate.member_id) {
  //   return { success: false, error: "Permission denied." };
  // }
  console.warn(`Action Warning: Permission check disabled in updateEducationRecord for education ${educationId}`);

  try {
     const updatedEducation = await prisma.education.update({
       where: { id: educationId },
       data: {
         ...data,
         // Ensure years are updated as numbers if provided
         start_year: data.start_year !== undefined ? (data.start_year ? parseInt(data.start_year.toString(), 10) : null) : undefined,
         end_year: data.end_year !== undefined ? (data.end_year ? parseInt(data.end_year.toString(), 10) : null) : undefined,
       },
     });

     console.log(`Action: Successfully updated education record ${educationId}`);

     // --- Cache Revalidation ---
     revalidatePath(`/developer/members/${updatedEducation.member_id}/edit`); // Use correct field name
     revalidatePath(`/members/${updatedEducation.member_id}`); // Use correct field name

     return { success: true, education: updatedEducation };

   } catch (error) {
     console.error(`Action: Error updating education ${educationId}:`, error);
     if (error instanceof Error) {
        return { success: false, error: `Database error: ${error.message}` };
     }
     return { success: false, error: 'An unknown error occurred while updating education.' };
   }
}


// --- Action to DELETE an Education Record ---
export async function deleteEducationRecord(
  educationId: number
): Promise<{ success: boolean; error?: string }> {

  console.log(`Action: Deleting education record ${educationId}`);

  // --- Input Validation ---
  if (!educationId) {
    return { success: false, error: "Education Record ID is required." };
  }

  // --- TODO: Permission Check ---
  // Need to check if user can delete *this specific* education record.
  // const currentUser = await getCurrentUser();
  // const educationToDelete = await prisma.education.findUnique({ where: { id: educationId }, select: { member_id: true }}); // Select correct field
  // if (!educationToDelete) return { success: false, error: "Education record not found."};
  // if (!checkPermission(currentUser, 'manage_members', educationToDelete.member_id) && currentUser.id !== educationToDelete.member_id) {
  //   return { success: false, error: "Permission denied." };
  // }
   console.warn(`Action Warning: Permission check disabled in deleteEducationRecord for education ${educationId}`);

  try {
    // Store member_id before deleting for revalidation path
    const educationToDelete = await prisma.education.findUnique({ where: { id: educationId }, select: { member_id: true }}); // Select correct field
    const member_id = educationToDelete?.member_id; // Use correct field name

    await prisma.education.delete({
      where: { id: educationId },
    });

    console.log(`Action: Successfully deleted education record ${educationId}`);

    // --- Cache Revalidation ---
    if (member_id) {
        revalidatePath(`/developer/members/${member_id}/edit`); // Use correct field name
        revalidatePath(`/members/${member_id}`); // Use correct field name
        console.log(`Action: Revalidated paths after deleting education for member ${member_id}`);
    }

    return { success: true };

  } catch (error) {
    console.error(`Action: Error deleting education ${educationId}:`, error);
    if (error instanceof Error) {
        // Handle specific Prisma error if record not found (e.g., P2025)
        // import { Prisma } from '@prisma/client';
        // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        //    return { success: false, error: "Record to delete not found." };
        // }
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while deleting education.' };
  }
} 