import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin / Demo account (Pro)
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cardova.app' },
    update: {},
    create: {
      email: 'admin@cardova.app',
      password: adminPassword,
      name: 'Cardova Admin',
      emailVerified: true,
      role: 'admin',
      isPro: true,
      aiCreditsUsed: 0,
    },
  });

  // Admin card
  await prisma.card.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      username: 'admin',
      displayName: 'Cardova Admin',
      title: 'Platform Administrator',
      company: 'Cardova',
      location: 'San Francisco, CA',
      bio: 'Building the future of digital business cards. Cardova makes it easy to create, share, and track your professional identity online.',
      theme: 'glass',
      isPublished: true,
      socialLinks: {
        website: 'https://cardova.app',
        twitter: 'https://twitter.com/cardova',
        linkedin: 'https://linkedin.com/company/cardova',
        email: 'admin@cardova.app',
      },
    },
  });

  // Demo user (Free tier)
  const demoPassword = await bcrypt.hash('Demo123!', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@cardova.app' },
    update: {},
    create: {
      email: 'demo@cardova.app',
      password: demoPassword,
      name: 'Sarah Chen',
      emailVerified: true,
      isPro: false,
      aiCreditsUsed: 3,
    },
  });

  // Demo card
  await prisma.card.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      username: 'sarahchen',
      displayName: 'Sarah Chen',
      title: 'Product Designer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      bio: 'I design interfaces that make complex financial products feel simple. Currently leading the Stripe Dashboard redesign and building design systems that scale.',
      theme: 'glass',
      isPublished: true,
      socialLinks: {
        twitter: 'https://twitter.com/sarahchen',
        linkedin: 'https://linkedin.com/in/sarahchen',
        github: 'https://github.com/sarahchen',
        website: 'https://sarahchen.design',
        email: 'sarah@example.com',
      },
    },
  });

  // Add some demo card views
  const now = new Date();
  const views = [];
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const viewedAt = new Date(now);
    viewedAt.setDate(viewedAt.getDate() - daysAgo);

    views.push({
      cardId: (await prisma.card.findUnique({ where: { userId: demo.id } }))!.id,
      referrer: ['twitter', 'linkedin', 'direct', 'qr', 'email'][Math.floor(Math.random() * 5)],
      viewedAt,
    });
  }
  await prisma.cardView.createMany({ data: views });

  console.log('Seed complete!');
  console.log('');
  console.log('=== Demo Accounts ===');
  console.log('');
  console.log('Admin (Pro):');
  console.log('  Email:    admin@cardova.app');
  console.log('  Password: Admin123!');
  console.log('  Card:     /admin');
  console.log('');
  console.log('Demo (Free):');
  console.log('  Email:    demo@cardova.app');
  console.log('  Password: Demo123!');
  console.log('  Card:     /sarahchen');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
