# 🌾 Farm-to-Fork Traceability Portal

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

An internal enterprise web application built to track raw paddy procurement, enforce Quality Assurance (QA) data entry, and manage batch approvals seamlessly.

## 🎯 Goal

The Farm-to-Fork Traceability Portal aims to digitize and streamline the agricultural supply chain. By tracking batches from the moment they leave the farm until they are approved for milling, the portal ensures high quality and full traceability for every grain of paddy.

## 👥 User Roles & Features

### 1. 🧑‍🌾 Procurement Officer
- **Create Batches:** Initiate new `Procurement Batch` records.
- **Data Entry:** Log essential details including Mandi Location, Farmer/Vendor Name, Weight (Tonnes), and Arrival Date.

### 2. 🧪 QA Technician
- **QA Dashboard:** Access a dedicated dashboard for "Pending QA" batches.
- **Lab Results:** Input crucial quality metrics:
  - Moisture % *(Target: <12%)*
  - Average Grain Length *(Target: >8mm)*
  - Broken Grain %

### 3. 🏢 Warehouse Manager
- **Global Overview:** Monitor all batches across the procurement lifecycle.
- **Approval Workflow:** Review QA metrics to **Approve for Milling** or **Reject** batches.

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Set up the database:

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🛠️ Tech Stack
- **Framework:** [Next.js](https://nextjs.org/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)

---
*Developed with focus on traceability and quality assurance.*
