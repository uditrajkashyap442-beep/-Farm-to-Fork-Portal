# Database Schema (Prisma)

Model `Batch`
- `id` (String, UUID, Primary Key)
- `batch_number` (String, Unique, e.g., "BATCH-2026-001")
- `vendor_name` (String)
- `mandi_location` (String)
- `weight_tonnes` (Float)
- `status` (Enum: "PENDING_QA", "APPROVED", "REJECTED")
- `created_at` (DateTime)

Model `QAResult`
- `id` (String, UUID, Primary Key)
- `batch_id` (Foreign Key -> Batch.id)
- `moisture_percent` (Float)
- `grain_length_mm` (Float)
- `broken_percent` (Float)
- `tested_by` (String)
- `tested_at` (DateTime)
