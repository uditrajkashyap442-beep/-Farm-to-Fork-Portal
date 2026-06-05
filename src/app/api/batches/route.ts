// src/app/api/batches/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        qa_result: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return NextResponse.json(batches);
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching batches.", code: 500 },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendor_name, mandi_location, weight_tonnes, arrival_date } = body;

    // 1. Enforce strict validation
    if (!vendor_name || !mandi_location || weight_tonnes === undefined) {
      return NextResponse.json(
        { error: "Missing required fields for batch registration.", code: 400 },
        { status: 400 }
      );
    }

    const parsedWeight = parseFloat(weight_tonnes);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return NextResponse.json(
        { error: "Weight must be a positive number.", code: 400 },
        { status: 400 }
      );
    }

    // 2. Generate sequential batch number
    const count = await prisma.batch.count();
    const batch_number = `BATCH-2026-${String(count + 1).padStart(3, "0")}`;

    // 3. Create batch in database
    const batch = await prisma.batch.create({
      data: {
        batch_number,
        vendor_name,
        mandi_location,
        weight_tonnes: parsedWeight,
        status: "PENDING_QA",
        created_at: arrival_date ? new Date(arrival_date) : new Date(),
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Failed to create batch:", error);
    return NextResponse.json(
      { error: "Internal server error while registering batch.", code: 500 },
      { status: 500 }
    );
  }
}
