'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Prisma, ArtefactType } from '@prisma/client'; // Import ArtefactType enum
import prisma from '@/lib/prisma';
// import { ensureAuthenticated } from './auth'; // Assuming auth utility exists

// --- Zod Schema for Validation ---

const SoftwareDatasetFormSchema = z.object({
    title: z.string().min(1, "Title cannot be empty."),
    description: z.string().optional().nullable(),
    type: z.nativeEnum(ArtefactType),
    repositoryUrl: z.string().url("Invalid URL format for repository link.").optional().or(z.literal('')).nullable(),
    projectUrl: z.string().url("Invalid URL format for project link.").optional().or(z.literal('')).nullable(),
    license: z.string().optional().nullable(),
    version: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    // display_order might be handled separately or default
});

export type SoftwareDatasetFormData = z.infer<typeof SoftwareDatasetFormSchema>;

// --- Server Actions ---

/**
 * Adds a new software/dataset record for a member.
 */
export async function addSoftwareDatasetRecord(memberId: string, data: SoftwareDatasetFormData): Promise<{ success: boolean; error?: string; softwareDataset?: Prisma.SoftwareDatasetGetPayload<{}> }> {
    try {
        // await ensureAuthenticated();
        const validatedData = SoftwareDatasetFormSchema.parse(data);

        const newRecord = await prisma.softwareDataset.create({
            data: {
                member_id: memberId,
                title: validatedData.title,
                description: validatedData.description,
                type: validatedData.type,
                repository_url: validatedData.repositoryUrl,
                project_url: validatedData.projectUrl,
                license: validatedData.license,
                version: validatedData.version,
                status: validatedData.status,
                // display_order defaults to 0 in schema
            },
        });

        revalidatePath(`/developer/members/edit/${memberId}`);
        return { success: true, softwareDataset: newRecord };

    } catch (error: any) {
        console.error("Error adding software/dataset:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: JSON.stringify(error.flatten().fieldErrors) };
        }
        return { success: false, error: error.message || "Failed to add software/dataset record." };
    }
}

/**
 * Updates an existing software/dataset record.
 */
export async function updateSoftwareDatasetRecord(recordId: number, data: SoftwareDatasetFormData): Promise<{ success: boolean; error?: string; softwareDataset?: Prisma.SoftwareDatasetGetPayload<{}> }> {
    try {
        // await ensureAuthenticated();
        const validatedData = SoftwareDatasetFormSchema.parse(data);

        const existingRecord = await prisma.softwareDataset.findUnique({ where: { id: recordId } });
        if (!existingRecord) {
            return { success: false, error: "Software/Dataset record not found." };
        }

        const updatedRecord = await prisma.softwareDataset.update({
            where: { id: recordId },
            data: {
                title: validatedData.title,
                description: validatedData.description,
                type: validatedData.type,
                repository_url: validatedData.repositoryUrl,
                project_url: validatedData.projectUrl,
                license: validatedData.license,
                version: validatedData.version,
                status: validatedData.status,
                 // display_order not updated here
            },
        });

        revalidatePath(`/developer/members/edit/${existingRecord.member_id}`);
        return { success: true, softwareDataset: updatedRecord };

    } catch (error: any) {
        console.error("Error updating software/dataset:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: JSON.stringify(error.flatten().fieldErrors) };
        }
        return { success: false, error: error.message || "Failed to update software/dataset record." };
    }
}

/**
 * Deletes a software/dataset record.
 */
export async function deleteSoftwareDatasetRecord(recordId: number): Promise<{ success: boolean; error?: string }> {
    try {
        // await ensureAuthenticated();

        const existingRecord = await prisma.softwareDataset.findUnique({ where: { id: recordId }, select: { member_id: true } });
        if (!existingRecord) {
            return { success: false, error: "Software/Dataset record not found." };
        }

        await prisma.softwareDataset.delete({
            where: { id: recordId },
        });

        revalidatePath(`/developer/members/edit/${existingRecord.member_id}`);
        return { success: true };

    } catch (error: any) {
        console.error("Error deleting software/dataset:", error);
        return { success: false, error: error.message || "Failed to delete software/dataset record." };
    }
} 