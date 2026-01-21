import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user.email);

  // Create consent record for user
  const consent = await prisma.consentRecord.create({
    data: {
      userId: user.id,
      consentVersion: 'v1_audio_2026_01',
      scopes: ['audio_processing', 'voice_synthesis', 'storage_retention'],
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Created consent record:', consent.consentVersion);

  console.log('Seeding completed!');
  console.log('\nDemo credentials:');
  console.log('Email: demo@example.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });