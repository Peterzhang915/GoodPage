'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

// --- Type for individual publication update ---
interface FeaturedPublicationUpdate {
  publicationId: number;
  isFeatured: boolean;
  order: number;
}

// --- Action to update featured publications and their order for a member ---
export async function updateFeaturedPublications(
  memberId: string,
  featuredUpdates: FeaturedPublicationUpdate[]
): Promise<{ success: boolean; error?: string }> {

  console.log(`Action: Updating featured publications for member ${memberId}`);

  // --- Input Validation ---
  if (!memberId) {
    return { success: false, error: "Member ID is required." };
  }
  if (!Array.isArray(featuredUpdates)) {
     return { success: false, error: "Invalid update data format. Expected an array." };
  }

  // Optional: Deeper validation of array contents
  for (const update of featuredUpdates) {
      if (typeof update.publicationId !== 'number' || typeof update.isFeatured !== 'boolean' || typeof update.order !== 'number') {
          return { success: false, error: "Invalid data in update array." };
      }
  }

  // --- TODO: Permission Check ---
  // Check if the current user has permission to edit this member's profile
  console.warn(`Action Warning: Permission check disabled in updateFeaturedPublications for member ${memberId}`);

  try {
    // Use a transaction to ensure all updates succeed or fail together
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      console.log(`Action: Starting transaction for member ${memberId}`);

      // Option 1: Update each PublicationAuthor record individually (potentially many DB calls)
      // for (const update of featuredUpdates) {
      //   await tx.publicationAuthor.update({
      //     where: {
      //       publication_id_member_id: { // Use the composite ID key
      //         publication_id: update.publicationId,
      //         member_id: memberId,
      //       },
      //     },
      //     data: {
      //       isFeaturedOnProfile: update.isFeatured,
      //       profileDisplayOrder: update.order,
      //     },
      //   });
      // }

      // Option 2: More efficient - Reset all for the member first, then update the featured ones.
      // This avoids issues if a publication is removed from the featured list.

      // Step 1: Reset all publications for this member to not featured and default order
      // We target the PublicationAuthor link table
      await tx.publicationAuthor.updateMany({
         where: { member_id: memberId },
         data: {
             isFeaturedOnProfile: false,
             profileDisplayOrder: 0, // Reset order as well
         },
      });
       console.log(`Action: Reset featured status for all publications of member ${memberId}`);

      // Step 2: Update only the ones that should be featured with their new order
      // Create an array of promises for concurrent updates within the transaction
      const updatePromises = featuredUpdates
         .filter(update => update.isFeatured) // Only process those marked as featured
         .map(update =>
             tx.publicationAuthor.update({
                where: {
                   publication_id_member_id: { // Use composite ID
                       publication_id: update.publicationId,
                       member_id: memberId,
                   },
                },
                data: {
                   isFeaturedOnProfile: true,
                   profileDisplayOrder: update.order,
                },
             })
         );

       await Promise.all(updatePromises);
       console.log(`Action: Updated featured status and order for ${updatePromises.length} publications for member ${memberId}`);

       console.log(`Action: Transaction committed successfully for member ${memberId}`);
    }); // End transaction

    // --- Cache Revalidation ---
    revalidatePath(`/developer/members/${memberId}/edit`);
    revalidatePath(`/members/${memberId}`); // Revalidate public profile page

    console.log(`Action: Successfully updated featured publications and revalidated paths for member ${memberId}`);
    return { success: true };

  } catch (error) {
    console.error(`Action: Error updating featured publications for member ${memberId}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database transaction failed: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while updating featured publications.' };
  }
} 