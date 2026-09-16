import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SKILLS = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Domestic Helper', 'Caregiver', 'Driver', 'Gardener', 'Cleaner', 'Technician'];
const CITIES = [
  { lat: 28.6139, lng: 77.2090 }, // Delhi
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 12.9716, lng: 77.5946 }, // Bangalore
];

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.payment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cooperative.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Cooperative
  const coop = await prisma.cooperative.create({
    data: {
      name: 'National Labour Federation',
      region: 'India',
    }
  });

  // Create Admin
  await prisma.user.create({
    data: {
      role: 'COOPERATIVE_ADMIN',
      name: 'Admin User',
      phone: '9999999999',
      email: 'admin@coop.org',
      passwordHash,
      cooperativeId: coop.id,
    }
  });

  // Create Customers
  const customers = [];
  for (let i = 1; i <= 15; i++) {
    const c = await prisma.user.create({
      data: {
        role: 'CUSTOMER',
        name: `Customer ${i}`,
        phone: `88888888${i.toString().padStart(2, '0')}`,
        email: `customer${i}@example.com`,
        passwordHash,
      }
    });
    customers.push(c);
  }

  // Create Workers
  const workers = [];
  for (let i = 1; i <= 25; i++) {
    const city = CITIES[i % CITIES.length]!;
    // add small random offset
    const lat = city.lat + (Math.random() - 0.5) * 0.1;
    const lng = city.lng + (Math.random() - 0.5) * 0.1;
    
    const skill = SKILLS[i % SKILLS.length]!;
    
    const w = await prisma.user.create({
      data: {
        role: 'WORKER',
        name: `Worker ${i}`,
        phone: `77777777${i.toString().padStart(2, '0')}`,
        email: `worker${i}@example.com`,
        passwordHash,
        cooperativeId: coop.id,
        workerProfile: {
          create: {
            skills: skill,
            experienceYears: Math.floor(Math.random() * 10) + 1,
            serviceRadius: 15.0,
            lat,
            lng,
            verificationStatus: i < 5 ? 'PENDING' : 'VERIFIED',
            avgRating: 4.0 + Math.random(),
            isAvailableNow: Math.random() > 0.5,
          }
        }
      },
      include: { workerProfile: true }
    });
    workers.push(w);
  }

  // Create Bookings
  const statuses = ['COMPLETED', 'RATED', 'ACCEPTED', 'REQUESTED', 'DECLINED'];
  for (let i = 1; i <= 40; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]!;
    const worker = workers[Math.floor(Math.random() * workers.length)]!;
    const status = statuses[Math.floor(Math.random() * statuses.length)]!;
    
    const city = CITIES[i % CITIES.length]!;
    const lat = city.lat + (Math.random() - 0.5) * 0.1;
    const lng = city.lng + (Math.random() - 0.5) * 0.1;
    
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        workerId: worker.id,
        category: worker.workerProfile!.skills,
        scheduledAt: new Date(Date.now() + (Math.random() - 0.5) * 10 * 24 * 60 * 60 * 1000),
        status: status,
        isUrgent: Math.random() > 0.8,
        lat,
        lng,
        address: `${Math.floor(Math.random() * 100)} Main St, City`,
      }
    });

    if (status === 'COMPLETED' || status === 'RATED') {
      const amount = 500 + Math.floor(Math.random() * 1500);
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount,
          status: 'COMPLETED',
        }
      });
      
      if (status === 'RATED') {
        await prisma.rating.create({
          data: {
            bookingId: booking.id,
            stars: 4 + Math.floor(Math.random() * 2), // 4 or 5
            comment: 'Great job!',
          }
        });
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
