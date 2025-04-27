import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod Schema (same structure as news reorder)
const reorderItemSchema = z.object({
    id: z.number().int(),
    display_order: z.number().int(),
});

const reorderInterestPointsSchema = z.object({
    items: z.array(reorderItemSchema).min(1, { message: "Items array cannot be empty." }),
});

// PUT handler to update the display_order of multiple interest points
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        const validation = reorderInterestPointsSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: { message: 'Invalid input.', details: validation.error.errors } },
                { status: 400 },
            );
        }

        const { items } = validation.data;

        const updatePromises = items.map(item =>
            prisma.interestPoint.update({ // Use interestPoint model
                where: { id: item.id },
                data: { display_order: item.display_order },
            })
        );

        await prisma.$transaction(updatePromises);

        return NextResponse.json({ success: true, message: `Successfully reordered ${items.length} interest points.` });

    } catch (error: any) {
        console.error('Failed to reorder interest points:', error);
        if (error.code === 'P2025') {
             return NextResponse.json(
                { success: false, error: { message: 'One or more interest points not found during reorder.' } },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, error: { message: 'Failed to reorder interest points.' } },
            { status: 500 },
        );
    } finally {
        await prisma.$disconnect();
    }
} 