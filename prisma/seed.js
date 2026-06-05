const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.qAResult.deleteMany({});
  await prisma.batch.deleteMany({});

  console.log("Seeding batches...");

  // Batch 1: Approved
  const b1 = await prisma.batch.create({
    data: {
      batch_number: "BATCH-2026-001",
      vendor_name: "Karan Singh",
      mandi_location: "Karnal Mandi",
      weight_tonnes: 12.5,
      status: "APPROVED",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  await prisma.qAResult.create({
    data: {
      batch_id: b1.id,
      moisture_percent: 11.2,
      grain_length_mm: 8.4,
      broken_percent: 3.1,
      tested_by: "Dr. Amit Verma",
      tested_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 3 days ago, 4 hours later
    },
  });

  // Batch 2: Rejected
  const b2 = await prisma.batch.create({
    data: {
      batch_number: "BATCH-2026-002",
      vendor_name: "Rajesh Kumar",
      mandi_location: "Kurukshetra Mandi",
      weight_tonnes: 18.2,
      status: "REJECTED",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  await prisma.qAResult.create({
    data: {
      batch_id: b2.id,
      moisture_percent: 13.5,
      grain_length_mm: 7.8,
      broken_percent: 6.2,
      tested_by: "Dr. Amit Verma",
      tested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    },
  });

  // Batch 3: Pending QA
  await prisma.batch.create({
    data: {
      batch_number: "BATCH-2026-003",
      vendor_name: "Gurnam Singh",
      mandi_location: "Kaithal Mandi",
      weight_tonnes: 24.0,
      status: "PENDING_QA",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // Batch 4: Pending QA
  await prisma.batch.create({
    data: {
      batch_number: "BATCH-2026-004",
      vendor_name: "Baldev Singh",
      mandi_location: "Ambala Mandi",
      weight_tonnes: 15.8,
      status: "PENDING_QA",
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  });

  // Batch 5: Approved
  const b5 = await prisma.batch.create({
    data: {
      batch_number: "BATCH-2026-005",
      vendor_name: "Harpreet Brar",
      mandi_location: "Tarn Taran Mandi",
      weight_tonnes: 29.5,
      status: "APPROVED",
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  });

  await prisma.qAResult.create({
    data: {
      batch_id: b5.id,
      moisture_percent: 10.8,
      grain_length_mm: 8.2,
      broken_percent: 2.5,
      tested_by: "Dr. Priya Sharma",
      tested_at: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
