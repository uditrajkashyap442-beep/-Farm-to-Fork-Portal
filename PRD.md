# Product Requirements: Farm-to-Fork Traceability Portal

## Goal
Build an internal enterprise web application to track raw paddy procurement, enforce Quality Assurance (QA) data entry, and manage batch approvals.

## User Roles & Core Features
1. **Procurement Officer:**
   - Can create a new `Procurement Batch`.
   - Inputs data: Mandi Location, Farmer/Vendor Name, Weight (Tonnes), and Arrival Date.
2. **QA Technician:**
   - Sees a dashboard of "Pending QA" batches.
   - Can input lab results for a batch: Moisture % (Target: <12%), Average Grain Length (Target: >8mm), and Broken Grain %.
3. **Warehouse Manager:**
   - Can view all batches.
   - Can click "Approve for Milling" or "Reject" based on the QA metrics.
