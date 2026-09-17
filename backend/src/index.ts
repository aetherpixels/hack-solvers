import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import workerRoutes from './routes/workers';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
app.use(cors()); // Allow all origins explicitly to avoid CORS issues
app.use(express.json());

// Add a diagnostic route you can test in the browser
app.get('/api/health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const count = await prisma.user.count();
    res.json({ status: 'OK', message: 'Backend is connected to Postgres!', userCount: count });
  } catch (e: any) {
    res.status(500).json({ error: e.message, hint: 'The database is empty! Please visit /api/setup to initialize it.' });
  }
});

app.get('/api/setup', (req, res) => {
  try {
    const { execSync } = require('child_process');
    console.log('Running DB Push...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('Running DB Seed...');
    execSync('npx ts-node --transpile-only prisma/seed.ts', { stdio: 'inherit' });
    res.send('<h1>Database setup complete!</h1><p>You can now go back to your frontend and log in!</p>');
  } catch (e: any) {
    res.status(500).send(`<h1>Setup Failed</h1><pre>${e.message}</pre>`);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
