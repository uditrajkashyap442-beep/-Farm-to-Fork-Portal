# Tech Stack & Architecture

- **Frontend:** Next.js 14 (App Router), React, TailwindCSS.
- **UI Components:** Use `shadcn/ui` for data tables, forms, and dialogs. Use `Lucide React` for icons.
- **Backend/API:** Next.js Route Handlers (`/api/batches`, `/api/qa`).
- **Database:** PostgreSQL hosted on Supabase.
- **ORM:** Prisma (for type-safe database queries).
- **Authentication:** For this MVP, use a simple mocked session state (Role: Admin, QA, Procurement). Do not build complex OAuth flows yet.
