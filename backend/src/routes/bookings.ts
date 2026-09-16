import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create booking
router.post('/', authenticate, authorize(['CUSTOMER']), async (req: AuthRequest, res: any) => {
  const { workerId, category, scheduledAt, isUrgent, lat, lng, address } = req.body;
  const customerId = req.user!.id;

  try {
    const booking = await prisma.booking.create({
      data: {
        customerId,
        workerId,
        category,
        scheduledAt: new Date(scheduledAt),
        isUrgent: isUrgent || false,
        lat,
        lng,
        address
      }
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user bookings
router.get('/', authenticate, async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  try {
    let whereClause = {};
    if (role === 'CUSTOMER') whereClause = { customerId: userId };
    else if (role === 'WORKER') whereClause = { workerId: userId };
    else return res.status(403).json({ error: 'Invalid role' });

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        worker: { select: { id: true, name: true, phone: true } },
        payment: true,
        rating: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update booking status
router.put('/:id/status', authenticate, async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { status } = req.body; // ACCEPTED, COMPLETED, DECLINED
  const userId = req.user!.id;
  const role = req.user!.role;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (role === 'WORKER' && booking.workerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (role === 'CUSTOMER' && booking.customerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
