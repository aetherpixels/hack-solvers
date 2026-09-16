import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// In a real app we'd use Razorpay SDK here. For MVP we'll mock it.

router.post('/create-order', authenticate, authorize(['CUSTOMER']), async (req: AuthRequest, res: any) => {
  const { bookingId, amount } = req.body; // amount in INR
  
  try {
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      update: { amount },
      create: {
        bookingId,
        amount,
        platformFeePercent: 5.0,
        welfareFeePercent: 2.0,
        status: 'PENDING'
      }
    });

    // Mock Razorpay order response
    res.json({
      id: `order_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // paise
      currency: "INR",
      receipt: payment.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/verify', authenticate, authorize(['CUSTOMER']), async (req: AuthRequest, res: any) => {
  const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  try {
    // In MVP, we skip real signature verification and just mark success
    const payment = await prisma.payment.update({
      where: { bookingId },
      data: {
        status: 'COMPLETED',
        razorpayOrderId: razorpay_order_id
      }
    });
    res.json({ success: true, payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Ratings
router.post('/rating', authenticate, authorize(['CUSTOMER']), async (req: AuthRequest, res: any) => {
  const { bookingId, stars, comment } = req.body;
  
  try {
    const rating = await prisma.rating.create({
      data: { bookingId, stars, comment }
    });

    // Update worker average rating
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (booking) {
      const allWorkerRatings = await prisma.rating.findMany({
        where: { booking: { workerId: booking.workerId } }
      });
      const avg = allWorkerRatings.reduce((acc, r) => acc + r.stars, 0) / allWorkerRatings.length;
      await prisma.workerProfile.update({
        where: { userId: booking.workerId },
        data: { avgRating: avg }
      });
    }

    res.json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
