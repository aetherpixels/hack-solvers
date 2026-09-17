# ANTIGRAVITY TRANSFER CONTEXT

## 1. PROJECT OVERVIEW
* **Project name:** Cooperative Gig Services Platform
* **Purpose:** MVP for Smart India Hackathon 2026 (PS ID: SIH26089 - Ministry of Cooperation). A cooperative-owned service marketplace connecting skilled workers to customers, providing an alternative to exploitative private gig platforms.
* **Current objective:** Prepare the MVP for presentation, ensuring local hosting works perfectly and presentation materials are ready.
* **Target users:** Customers (hire workers), Workers (offer services), Cooperative Admins (oversee platform, track welfare).
* **Important requirements:** The "Worker Welfare Panel" is the core differentiator (transparent net earnings vs. fair-wage benchmarks, welfare fund contributions). Must use geo-matching for workers.

## 2. CURRENT TECH STACK
* **Frontend:** React, Vite, TypeScript, Tailwind CSS (v4)
* **Backend:** Node.js, Express, TypeScript
* **Database:** SQLite (local development) via Prisma ORM.
* **Authentication:** JWT-based role authorization (CUSTOMER, WORKER, COOPERATIVE_ADMIN).
* **APIs:** RESTful endpoints for Auth, Workers (Geo-search), Bookings, Payments, Admin.
* **Libraries/frameworks:** `react-leaflet` (maps), `recharts` (charts), `axios`, `bcryptjs`.
* **Hosting/deployment:** Currently running locally. Prepped for Render (Backend) and Vercel (Frontend).
* **Environment/configuration:** `VITE_API_URL` on frontend. `DATABASE_URL` and `FRONTEND_URL` on backend. (No secrets included here).

## 3. PROJECT STRUCTURE
* **`frontend/`**: The React application.
  * `src/pages/`: Contains role-based dashboards (`AdminDashboard.tsx`, `CustomerDashboard.tsx`, `WorkerDashboard.tsx`, `WelfarePanel.tsx`, `Login.tsx`, `Signup.tsx`).
  * `src/components/`: Shared UI (e.g., `Navbar.tsx`).
  * `src/App.tsx`: React Router configuration and Protected Routes setup.
* **`backend/`**: The Express API.
  * `prisma/schema.prisma`: Database schema definition.
  * `prisma/seed.ts`: Script that generates 40 mock bookings, customers, and workers for the demo.
  * `src/index.ts`: Main Express server and CORS config.
  * `src/routes/`: API endpoints segregated by domain.
* **`DEMO_SCRIPT.md` & `slide_content.md`**: Pitch and presentation materials.

## 4. CURRENT IMPLEMENTATION STATUS
* **Completed:** End-to-end booking flow, JWT Auth, Haversine geo-matching algorithm, Mock Razorpay payments, Ratings, Recharts demand forecasting, Worker Welfare panel, UI styling.
* **Partially completed:** Production Deployment (Code is ready, but blocked by user's GitHub permissions/authentication).
* **Not started:** Native mobile app wrappers, real government KYC (out of scope for MVP).
* **Broken/buggy:** Pushing to GitHub `aetherpixels/hack-solvers` failed due to local Git account (`LifeLegends`) lacking permissions.

## 5. DATABASE
* **Current database technology:** SQLite (using local `dev.db` file).
* **Tables/models:** `User`, `WorkerProfile`, `Booking`, `Payment`, `Rating`, `Cooperative`.
* **Important relationships:** Users have strict roles. Bookings link a Customer User to a Worker User. Payments and Ratings are 1-to-1 with Bookings.
* **Seed data:** Robust `seed.ts` file populates demo data so dashboards are not empty.
* **Important decisions:** Kept SQLite for local development speed and reliability. Explicitly downgraded Prisma to v5 early on to avoid bleeding-edge cloud deployment issues in Prisma v8.

## 6. FEATURES
* **Geo-Matched Dispatch Engine:** Backend `/api/workers` route filters workers by `serviceRadius` and sorts by distance using the Haversine formula. (Completed, `src/routes/workers.ts`).
* **Booking State Machine:** REQUESTED -> ACCEPTED -> COMPLETED -> PAID -> RATED. (Completed, `src/routes/bookings.ts`).
* **Mock Payments:** Simulates Razorpay order creation and signature verification. (Completed, `src/routes/payments.ts`).
* **Worker Dashboard:** View active requests, job history, earnings, and toggle Online/Offline availability. (Completed).
* **Worker Welfare Panel:** Visualizes fair-wage benchmarks and 2% welfare fund contributions. (Completed).

## 7. UI/UX REQUIREMENTS
* **Current design:** Clean, tailwind-styled dashboards. Green thematic colors (`coop-600`) representing agriculture/cooperatives.
* **Layout:** Shared top Navbar, max-width centered container for pages.
* **Components:** Leaflet map on Customer Dashboard, Recharts on Admin/Welfare dashboards.
* **Anything that MUST NOT be changed:** The user explicitly requested to NOT modify the UI/design or project functionality anymore.

## 8. PREVIOUS DECISIONS
* **Decision:** Mock Razorpay in test mode. **Why:** Hackathon MVP restriction. **Unchanged:** Do not implement real banking APIs.
* **Decision:** Replace hardcoded `localhost` with `import.meta.env.VITE_API_URL`. **Why:** To prep for Vercel deployment. **Unchanged:** Keep environment variables for API paths.
* **Decision:** Use SQLite locally. **Why:** Zero-config reliability for offline presentations. **Unchanged:** Do not switch to PostgreSQL in `schema.prisma` unless the user explicitly wants to deploy to Render.

## 9. USER REQUIREMENTS
* "do NOT rewrite or redesign the application."
* "Preserve the existing UI, functionality, routes, and database schema."
* "dont change the frame of slides just replace the content... it was last years winning ppt"
* "host on local"
* "If authentication is required for Vercel, Render, GitHub... stop and tell me exactly what I need to click/login to."

## 10. PROBLEMS / BUGS
* **Deployment Issue:** GitHub push failed with HTTP 403 because the local Git account (`LifeLegends`) does not have write access to the `aetherpixels/hack-solvers` repository. The user must push manually or fix credentials.
* **Server Restarts:** The local environment frequently restarts, killing the background `node` and `vite` processes. They must be restarted using `run_command` when resuming work.

## 11. CURRENT WORKING STATE
* The application works perfectly end-to-end on the local machine when the servers are running.
* Frontend connects to Backend on port 5000. Bookings, matching, and payments execute flawlessly.
* Slide content has been written out in Markdown format since the actual `.pptx` file was not accessible.

## 12. LAST COMPLETED STEP
* Wrote `slide_content.md` mapping the SIH26089 MVP features to the 6-slide structure of the user's reference PDF.

## 13. EXACT NEXT STEP
* Re-start the local backend and frontend servers so the user can rehearse their presentation.
* Wait for the user to copy the slide content into their PPT template, and assist with any final text tweaks they request.

## 14. DO NOT DO THESE
* DO NOT rewrite the frontend UI or change Tailwind styling.
* DO NOT attempt to push to GitHub without the user fixing their Git credentials first.
* DO NOT change Prisma to PostgreSQL unless the user is ready to deploy to Render and has a DB URL.
* DO NOT ask the user for passwords or API tokens in the chat.

## 15. IMPORTANT FILE REFERENCES
1. `backend/src/index.ts` (Main API entry, CORS config)
2. `frontend/src/pages/WorkerDashboard.tsx` (Recently upgraded stats view)
3. `backend/prisma/schema.prisma` (DB Schema)
4. `slide_content.md` & `DEMO_SCRIPT.md` (Hackathon pitch materials)

## 16. CONTINUATION INSTRUCTIONS
* **What to read first:** This `ANTIGRAVITY_TRANSFER_CONTEXT.md` file.
* **What to inspect:** Verify the `frontend/` and `backend/` directories exist and dependencies are installed.
* **What to verify:** Ensure port 5000 and 5173 are clear, then start the background servers (`npx ts-node --transpile-only src/index.ts` in backend, `npm run dev` in frontend).
* **What NOT to assume:** Do not assume the app is deployed to production. It is local.
* **When to ask:** Before making ANY changes to the UI, schema, or deployment configurations.

## 17. CONVERSATION SUMMARY
1. **Initial Setup:** User requested an MVP for SIH26089. We planned and built a Node/Express/Prisma/SQLite backend and React/Vite/Tailwind frontend.
2. **Development:** Implemented geo-matching, mock payments, and role-based dashboards. Populated DB with `seed.ts`.
3. **Refinement:** Upgraded the Worker dashboard to include earnings, online/offline toggle, and tabbed job views at user's request.
4. **Deployment Attempt:** Prepped codebase for Vercel/Render (env vars, CORS), but GitHub push failed due to user's Git permissions (`LifeLegends` vs `aetherpixels`). Instructed user to push manually.
5. **Presentation:** User provided a PDF reference of a winning PPT. I mapped our project features to the 6-slide format in `slide_content.md` for them to copy-paste.

## 18. TRANSFER CHECKLIST
- [x] Project structure was inspected
- [x] Important requirements were captured
- [x] Current implementation was verified
- [x] Known bugs were documented
- [x] Previous decisions were documented
- [x] Next task was identified
- [x] No secrets/API keys/passwords were included
