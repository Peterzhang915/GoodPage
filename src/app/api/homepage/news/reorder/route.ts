import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod Schema for validating the request body
const reorderItemSchema = z.object({
    id: z.number().int(),
    display_order: z.number().int(),
});

const reorderNewsSchema = z.object({
    items: z.array(reorderItemSchema).min(1, { message: "Items array cannot be empty." }),
});

// PUT handler to update the display_order of multiple news items
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = reorderNewsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: { message: 'Invalid input.', details: validation.error.errors } },
                { status: 400 },
            );
        }

        const { items } = validation.data;

        // Use Prisma transaction to update all items atomically
        const updatePromises = items.map(item =>
            prisma.homepageNews.update({
                where: { id: item.id },
                data: { display_order: item.display_order },
            })
        );

        // Execute the transaction
        await prisma.$transaction(updatePromises);

        return NextResponse.json({ success: true, message: `Successfully reordered ${items.length} news items.` });

    } catch (error: any) {
        console.error('Failed to reorder homepage news items:', error);
        // Handle potential errors during transaction (e.g., if an ID doesn't exist)
        // Prisma transactions roll back automatically on error.
        if (error.code === 'P2025') { // Example: Record to update not found
             return NextResponse.json(
                { success: false, error: { message: 'One or more news items not found during reorder.' } },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, error: { message: 'Failed to reorder news items.' } },
            { status: 500 },
        );
    } finally {
        await prisma.$disconnect();
    }
} 