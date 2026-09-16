import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Haversine distance helper (returns km)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Search workers (Geo-matching)
router.get('/', authenticate, async (req: AuthRequest, res: any) => {
  const { category, lat, lng, isUrgent } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    let whereClause: any = {
      verificationStatus: 'VERIFIED'
    };
    
    if (category) {
      // Simple substring search for skills
      whereClause.skills = { contains: String(category) };
    }
    
    if (isUrgent === 'true') {
      whereClause.isAvailableNow = true;
    }

    const workers = await prisma.workerProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, phone: true } }
      }
    });

    const userLat = parseFloat(String(lat));
    const userLng = parseFloat(String(lng));

    // Calculate distance and filter by serviceRadius
    const workersWithDistance = workers.map(w => {
      const distance = getDistanceFromLatLonInKm(userLat, userLng, w.lat, w.lng);
      return { ...w, distance };
    }).filter(w => w.distance <= w.serviceRadius)
      .sort((a, b) => a.distance - b.distance); // sort by distance

    res.json(workersWithDistance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create/Update Worker Profile
router.put('/profile', authenticate, authorize(['WORKER']), async (req: AuthRequest, res: any) => {
  const { skills, experienceYears, serviceRadius, lat, lng, certificateUrl } = req.body;
  const userId = req.user!.id;

  try {
    const profile = await prisma.workerProfile.upsert({
      where: { userId },
      update: {
        skills, experienceYears, serviceRadius, lat, lng, certificateUrl, verificationStatus: 'PENDING'
      },
      create: {
        userId, skills, experienceYears, serviceRadius, lat, lng, certificateUrl
      }
    });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current worker profile
router.get('/me', authenticate, authorize(['WORKER']), async (req: AuthRequest, res: any) => {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.id },
      include: { user: { select: { name: true, phone: true } } }
    });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update availability
router.put('/availability', authenticate, authorize(['WORKER']), async (req: AuthRequest, res: any) => {
  const { isAvailableNow } = req.body;
  const userId = req.user!.id;
  try {
    const profile = await prisma.workerProfile.update({
      where: { userId },
      data: { isAvailableNow }
    });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
