import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 一键删除所有 pending 状态的出版物
 */
export async function DELETE() {
  console.log("Received DELETE request to clear all pending publications");

  try {
    // 删除所有 pending_review 状态的出版物
    const result = await prisma.publication.deleteMany({
      where: {
        status: "pending_review",
      },
    });

    console.log(`Successfully deleted ${result.count} pending publications`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} pending publications`,
      data: {
        deletedCount: result.count,
      },
    });
  } catch (error) {
    console.error("Error clearing pending publications:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to clear pending publications: ${errorMessage}` },
      { status: 500 }
    );
  }
}
