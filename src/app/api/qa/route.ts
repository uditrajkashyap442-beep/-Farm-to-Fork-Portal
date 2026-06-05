// src/app/api/qa/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      batch_id, 
      moisture_percent, 
      grain_length_mm, 
      broken_percent, 
      tested_by 
    } = body;

    // 1. Enforce strict typing & validate input
    if (!batch_id || moisture_percent === undefined || grain_length_mm === undefined || broken_percent === undefined) {
      return NextResponse.json(
        { error: "Missing required QA data fields.", code: 400 }, 
        { status: 400 }
      );
    }

    // 2. Business Logic: Evaluate the batch against LT Foods Basmati standards
    // Targets: Moisture < 12%, Grain Length > 8mm, Broken grains < 5%
    const isApproved = 
      moisture_percent < 12 && 
      grain_length_mm > 8 && 
      broken_percent < 5;
      
    const newStatus = isApproved ? "APPROVED" : "REJECTED";
 
    // 3. Execute Prisma Transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Step A: Create the QA record
      const qaRecord = await tx.qAResult.create({
        data: {
          batch_id,
          moisture_percent,
          grain_length_mm,
          broken_percent,
          tested_by: tested_by || "System",
          tested_at: new Date(),
        },
      });

      // Step B: Update the parent Batch status
      const updatedBatch = await tx.batch.update({
        where: { id: batch_id },
        data: { status: newStatus },
      });

      return { qaRecord, updatedBatch };
    });

    // 4. Return success response
    return NextResponse.json(transactionResult, { status: 201 });

  } catch (error) {
    console.error("QA Submission Error:", error);
    
    // 5. Adhere to .cursorrules standard error format
    return NextResponse.json(
      { error: "Internal server error during QA submission.", code: 500 },
      { status: 500 }
    );
  }
}
