'use server';

import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/prisma"; // Use prisma namespace
import { revalidatePath } from "next/cache";
import { z } from 'zod'; // For validation

// Define the shape of the data expected from the project form
// Adjust fields based on the actual Project and ProjectMember models
const ProjectFormSchema = z.object({
    title: z.string().min(1, 'Project title is required'),
    description: z.string().optional(),
    start_year: z.number().int().min(1900).max(new Date().getFullYear() + 5).nullable().optional(),
    end_year: z.number().int().min(1900).max(new Date().getFullYear() + 10).nullable().optional(),
    url: z.string().url('Invalid URL format').nullable().optional(),
    role: z.string().optional(), // Role of the member in the project
    tags: z.string().optional(), // Corrected field name: tags (assuming comma-separated)
    // Add other relevant fields from the Project model if needed
}).refine(data => !data.end_year || !data.start_year || data.end_year >= data.start_year, {
    message: "End year must be greater than or equal to start year",
    path: ["end_year"], // Point error to end_year field
});

export type ProjectFormData = z.infer<typeof ProjectFormSchema>;

// Define the expected return type for addProjectRecord explicitly
// Includes the project and its linked members
type AddProjectResult = Prisma.ProjectGetPayload<{
    include: { members: true }
}>;

/**
 * Adds a new project and links it to a member.
 * Creates both a Project record and a ProjectMember record.
 */
export async function addProjectRecord(memberId: string, formData: ProjectFormData): Promise<{ success: boolean; error?: string; project?: AddProjectResult }> {
    const validationResult = ProjectFormSchema.safeParse(formData);
    if (!validationResult.success) {
        console.error("Add Project Validation Error:", validationResult.error.flatten().fieldErrors);
        return { success: false, error: JSON.stringify(validationResult.error.flatten().fieldErrors) };
    }

    const data = validationResult.data;

    try {
        console.log(`Action: Adding project for member ${memberId} with data:`, data);
        // Create the project and the link in a transaction
        const newProject = await prisma.project.create({
            data: {
                title: data.title,
                description: data.description,
                start_year: data.start_year,
                end_year: data.end_year,
                url: data.url,
                tags: data.tags, // Corrected field name: tags
                // Create the ProjectMember link simultaneously
                members: {
                    create: {
                        member_id: memberId,
                        role: data.role,
                        // Add other ProjectMember specific fields if any
                    }
                }
            },
            include: { members: true } // Include members to return the created link info
        });

        console.log("Action: Project created successfully:", newProject);
        revalidatePath(`/developer/members/edit/${memberId}`);
        revalidatePath(`/members/${memberId}`); // Revalidate public profile too
        return { success: true, project: newProject as AddProjectResult };

    } catch (error) {
        console.error("Error adding project:", error);
        let errorMessage = "Failed to add project.";
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle specific Prisma errors if needed
            errorMessage += ` (Code: ${error.code})`;
        }
        return { success: false, error: errorMessage };
    }
}

/**
 * Updates an existing project's details.
 * Note: This updates the Project entity. If the role (in ProjectMember) needs updating,
 * a separate action or combined logic might be needed.
 */
export async function updateProjectRecord(projectId: number, formData: ProjectFormData): Promise<{ success: boolean; error?: string; project?: Prisma.ProjectGetPayload<{}> }> {
    const validationResult = ProjectFormSchema.safeParse(formData);
    if (!validationResult.success) {
         console.error("Update Project Validation Error:", validationResult.error.flatten().fieldErrors);
        return { success: false, error: JSON.stringify(validationResult.error.flatten().fieldErrors) };
    }

    const data = validationResult.data;

    try {
        console.log(`Action: Updating project ${projectId} with data:`, data);
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title: data.title,
                description: data.description,
                start_year: data.start_year,
                end_year: data.end_year,
                url: data.url,
                tags: data.tags, // Corrected field name: tags
                // Note: This does NOT update the ProjectMember role. Handle separately if needed.
            },
        });
        console.log("Action: Project updated successfully:", updatedProject);

        // Revalidate paths associated with ANY member linked to this project?
        // This is tricky. For simplicity, maybe only revalidate the current editor path.
        // A better approach might involve fetching linked members and revalidating their paths.
        // Or maybe the editor component passes the memberId?
        // Let's assume we don't have memberId here easily. Revalidating specific member paths needs more info.
        // revalidatePath(`/developer/members/edit/[memberId]`); // Need memberId
        // revalidatePath(`/members/[memberId]`);

        return { success: true, project: updatedProject };

    } catch (error) {
         console.error(`Error updating project ${projectId}:`, error);
         let errorMessage = "Failed to update project.";
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2025') {
                 errorMessage = `Project with ID ${projectId} not found.`;
             }
             errorMessage += ` (Code: ${error.code})`;
         }
        return { success: false, error: errorMessage };
    }
}

/**
 * Deletes the link between a member and a project using the composite key.
 */
export async function deleteProjectRecord(projectId: number, memberId: string): Promise<{ success: boolean; error?: string }> {
    // Now expects projectId and memberId

    try {
        console.log(`Action: Deleting project link for project ${projectId} and member ${memberId}`);
        // Use the composite key in the where clause
        await prisma.projectMember.delete({
            where: {
                project_id_member_id: { // Use the Prisma-generated composite key name
                    project_id: projectId,
                    member_id: memberId,
                }
            },
        });

        console.log("Action: Project link deleted successfully.");
        revalidatePath(`/developer/members/edit/${memberId}`);
        revalidatePath(`/members/${memberId}`);
        return { success: true };

    } catch (error) {
        console.error(`Error deleting project link for project ${projectId}, member ${memberId}:`, error);
        let errorMessage = "Failed to delete project link.";
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                // Record not found
                errorMessage = `Project link for project ${projectId}, member ${memberId} not found.`;
            }
             errorMessage += ` (Code: ${error.code})`;
        }
        return { success: false, error: errorMessage };
    }
} 