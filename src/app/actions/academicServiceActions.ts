'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
// import { ensureAuthenticated } from './auth'; // Assuming you have an auth utility - Temporarily commented out

// --- Zod Schema for Validation ---

// Basic schema for form data
const AcademicServiceFormSchema = z.object({
    organization: z.string().min(1, "Organization cannot be empty."),
    role: z.string().min(1, "Role cannot be empty."),
    startYear: z.coerce.number().int().positive("Start year must be a positive number.").optional().nullable(), // Coerce string/null to number
    endYear: z.coerce.number().int().positive("End year must be a positive number.").optional().nullable(), // Coerce string/null to number
    description: z.string().optional().nullable(),
    isFeatured: z.boolean().optional(),
}).refine(data => !data.startYear || !data.endYear || data.endYear >= data.startYear, {
    message: "End year cannot be before start year.",
    path: ["endYear"], // Attach error to endYear field
});

// Type inferred from the schema
export type AcademicServiceFormData = z.infer<typeof AcademicServiceFormSchema>;

// --- Server Actions ---

/**
 * Adds a new academic service record for a member.
 */
export async function addAcademicServiceRecord(memberId: string, data: AcademicServiceFormData): Promise<{ success: boolean; error?: string; academicService?: Prisma.AcademicServiceGetPayload<{}> }> {
    try {
        // await ensureAuthenticated(); // Protect the action - Temporarily commented out

        const validatedData = AcademicServiceFormSchema.parse(data);

        const newService = await prisma.academicService.create({
            data: {
                // Use the fields defined in the updated schema.prisma
                member_id: memberId,
                organization: validatedData.organization, // Correct field
                role: validatedData.role,               // Correct field
                start_year: validatedData.startYear,     // Correct field
                end_year: validatedData.endYear,         // Correct field
                description: validatedData.description,   // Correct field
                isFeatured: validatedData.isFeatured ?? false,
                // display_order will use default value
            },
        });

        revalidatePath(`/developer/members/edit/${memberId}`); // Or a more specific path
        return { success: true, academicService: newService };

    } catch (error: any) {
        console.error("Error adding academic service:", error);
        if (error instanceof z.ZodError) {
            // Return validation errors specifically
            return { success: false, error: JSON.stringify(error.flatten().fieldErrors) };
        }
        return { success: false, error: error.message || "Failed to add academic service record." };
    }
}

/**
 * Updates an existing academic service record.
 */
export async function updateAcademicServiceRecord(serviceId: number, data: AcademicServiceFormData): Promise<{ success: boolean; error?: string; academicService?: Prisma.AcademicServiceGetPayload<{}> }> {
    try {
        // await ensureAuthenticated(); - Temporarily commented out

        const validatedData = AcademicServiceFormSchema.parse(data);

        // Check if the record exists before updating
        const existingService = await prisma.academicService.findUnique({ where: { id: serviceId } });
        if (!existingService) {
            return { success: false, error: "Academic service record not found." };
        }

        const updatedService = await prisma.academicService.update({
            where: { id: serviceId },
            data: {
                // Use the fields defined in the updated schema.prisma
                organization: validatedData.organization,
                role: validatedData.role,
                start_year: validatedData.startYear,
                end_year: validatedData.endYear,
                description: validatedData.description,
                isFeatured: validatedData.isFeatured ?? false,
                // member_id is not updated here
                // display_order is not updated by this action currently
            },
        });

        revalidatePath(`/developer/members/edit/${existingService.member_id}`);
        return { success: true, academicService: updatedService };

    } catch (error: any) {
        console.error("Error updating academic service:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: JSON.stringify(error.flatten().fieldErrors) };
        }
        return { success: false, error: error.message || "Failed to update academic service record." };
    }
}

/**
 * Deletes an academic service record.
 */
export async function deleteAcademicServiceRecord(serviceId: number): Promise<{ success: boolean; error?: string }> {
    try {
        // await ensureAuthenticated(); - Temporarily commented out

        // Find the record to get memberId for revalidation before deleting
        const existingService = await prisma.academicService.findUnique({ where: { id: serviceId }, select: { member_id: true } });
        if (!existingService) {
            // Don't throw an error if it's already gone, just return success slightly differently?
            // Or return error as current design suggests
            return { success: false, error: "Academic service record not found." };
        }

        await prisma.academicService.delete({
            where: { id: serviceId },
        });

        revalidatePath(`/developer/members/edit/${existingService.member_id}`);
        return { success: true };

    } catch (error: any) {
        console.error("Error deleting academic service:", error);
        return { success: false, error: error.message || "Failed to delete academic service record." };
    }
}