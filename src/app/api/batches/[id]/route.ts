// src/app/api/batches/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { status } = body;

    // 1. Enforce strict validation
    if (!status || !["APPROVED", "REJECTED", "PENDING_QA"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value provided.", code: 400 },
        { status: 400 }
      );
    }

    // 2. Update status in database
    const updatedBatch = await prisma.batch.update({
      where: { id },
      data: { status },
      include: {
        qa_result: true,
      },
    });

    return NextResponse.json(updatedBatch);
  } catch (error) {
    console.error("Failed to update batch status:", error);
    return NextResponse.json(
      { error: "Internal server error while updating batch status.", code: 500 },
      { status: 500 }
    );
  }
}
