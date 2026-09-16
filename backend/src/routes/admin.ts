import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get admin dashboard stats
router.get('/dashboard', authenticate, authorize(['COOPERATIVE_ADMIN']), async (req: AuthRequest, res: any) => {
  try {
    const totalBookings = await prisma.booking.count();
    const activeWorkers = await prisma.workerProfile.count({ where: { verificationStatus: 'VERIFIED' } });
    const pendingWorkers = await prisma.workerProfile.count({ where: { verificationStatus: 'PENDING' } });
    
    const payments = await prisma.payment.findMany({ where: { status: 'COMPLETED' } });
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    // Bookings by category (for chart)
    const bookings = await prisma.booking.findMany();
    const categoryCounts: Record<string, number> = {};
    bookings.forEach(b => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });
    const categoryChartData = Object.keys(categoryCounts).map(name => ({
      name,
      value: categoryCounts[name]
    }));

    res.json({
      totalBookings,
      activeWorkers,
      pendingWorkers,
      totalRevenue,
      categoryChartData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending workers
router.get('/pending-workers', authenticate, authorize(['COOPERATIVE_ADMIN']), async (req: AuthRequest, res: any) => {
  try {
    const workers = await prisma.workerProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { select: { name: true, phone: true, email: true } } }
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject worker
router.put('/workers/:userId/verify', authenticate, authorize(['COOPERATIVE_ADMIN']), async (req: AuthRequest, res: any) => {
  const { userId } = req.params;
  const { status } = req.body; // VERIFIED, REJECTED
  
  try {
    const worker = await prisma.workerProfile.update({
      where: { userId },
      data: { verificationStatus: status }
    });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Worker welfare panel data
router.get('/welfare', authenticate, authorize(['COOPERATIVE_ADMIN']), async (req: AuthRequest, res: any) => {
  try {
    const completedBookings = await prisma.booking.findMany({
      where: { status: { in: ['COMPLETED', 'RATED'] } },
      include: { payment: true, worker: { select: { name: true, id: true } } }
    });

    const workerEarnings: Record<string, { id: string, name: string, totalEarnings: number, welfareFund: number, jobs: number }> = {};
    
    completedBookings.forEach(b => {
      if (!b.payment) return;
      const wid = b.worker.id;
      if (!workerEarnings[wid]) {
        workerEarnings[wid] = { id: wid, name: b.worker.name, totalEarnings: 0, welfareFund: 0, jobs: 0 };
      }
      workerEarnings[wid].jobs += 1;
      // Worker gets amount - platform fee - welfare fee
      const platformFee = b.payment.amount * (b.payment.platformFeePercent / 100);
      const welfareFee = b.payment.amount * (b.payment.welfareFeePercent / 100);
      const net = b.payment.amount - platformFee - welfareFee;
      
      workerEarnings[wid].totalEarnings += net;
      workerEarnings[wid].welfareFund += welfareFee;
    });

    const welfareData = Object.values(workerEarnings);
    res.json(welfareData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
