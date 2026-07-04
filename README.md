# Farm-to-Fork Traceability Portal

Internal web app to track raw paddy procurement, QA data entry, and batch approvals.

## Features

- **Procurement**: Create batch records (Mandi Location, Vendor, Weight, Arrival Date).
- **QA**: Input lab results (Moisture, Grain Length, Broken Grain).
- **Warehouse**: View batches and approve/reject based on QA metrics.

## Tech Stack

- Next.js (App Router)
- Prisma ORM
- TailwindCSS

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
