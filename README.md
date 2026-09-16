# Cooperative Gig Services Platform

An MVP for SIH26089: "Cooperative Gig Services Platform for Household & Community Services"

## Quick Start

1. **Backend**:
   ```sh
   cd backend
   npm install
   npx prisma db push
   npx ts-node prisma/seed.ts
   npm run dev
   ```
   (Starts on http://localhost:5000)

2. **Frontend**:
   ```sh
   cd frontend
   npm install
   npm run dev
   ```
   (Starts on http://localhost:5173)

## Architecture
- **Frontend**: React (Vite), TypeScript, Tailwind CSS v4, React Router, Recharts, Leaflet.
- **Backend**: Node.js, Express, TypeScript, Prisma.
- **Database**: SQLite (portable and zero-config for the demo, easily swapped to Postgres via Prisma).
- **Auth**: JWT-based role authorization (Customer, Worker, Admin).

## Feature Map (PS Requirements)
- **Worker Verification**: Built into the admin dashboard (Approve/Reject flow).
- **Geo-Matching**: Haversine distance logic on the backend filters and sorts workers based on distance to the customer's coordinates.
- **Bookings & Payments**: Complete state machine (Requested -> Accepted -> Completed -> Paid -> Rated). Razorpay test mode mock integrated.
- **Emergency/On-Demand**: "Urgent" toggle filters for workers actively online (`isAvailableNow`).
- **Worker Welfare Panel (Core Differentiator)**: A dedicated dashboard showing transparent net earnings vs. fair-wage benchmarks and welfare fund contributions.

## Future Roadmap (Out of Scope for MVP)
- Real government ID verification (KYC/Aadhaar via Digilocker).
- Native mobile app wrapper (React Native/Expo).
- Real production payment gateway (switching Razorpay from Test to Live).
- Machine-learning based demand forecasting (currently using heuristic historical averages).
- Multi-language support (i18n).
