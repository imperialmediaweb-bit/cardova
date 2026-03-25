import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { redis } from './config/redis';
import { startEmailWorker } from './jobs/emailWorker';
import bcrypt from 'bcryptjs';

async function seedDemoAccounts() {
  try {
    const password = await bcrypt.hash('Demo123!', 12);
    const adminPassword = await bcrypt.hash('Admin123!', 12);

    // Clean up old demo user (demo@cardova.app) that conflicts with new usernames
    const oldDemo = await prisma.user.findUnique({ where: { email: 'demo@cardova.app' } });
    if (oldDemo) {
      await prisma.user.delete({ where: { id: oldDemo.id } }).catch(() => {});
    }

    // Admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@cardova.app' },
      update: {},
      create: { email: 'admin@cardova.app', password: adminPassword, name: 'Cardova Admin', emailVerified: true, role: 'admin', isPro: true },
    });
    await prisma.card.upsert({
      where: { userId: admin.id },
      update: {},
      create: { userId: admin.id, username: 'admin', displayName: 'Cardova Admin', title: 'Platform Administrator', company: 'Cardova', location: 'San Francisco, CA', bio: 'Building the future of digital business cards.', theme: 'glass', isPublished: true, socialLinks: { website: 'https://cardova.app', email: 'admin@cardova.app' } },
    });

    // Sarah Chen - Personal Free
    const sarah = await prisma.user.upsert({
      where: { email: 'sarah@demo.cardova.app' },
      update: {},
      create: { email: 'sarah@demo.cardova.app', password, name: 'Sarah Chen', emailVerified: true, isPro: false, aiCreditsUsed: 3 },
    });
    await prisma.card.upsert({
      where: { userId: sarah.id },
      update: {},
      create: { userId: sarah.id, username: 'sarahchen', displayName: 'Sarah Chen', title: 'Product Designer', company: 'Stripe', location: 'San Francisco, CA', bio: 'I design interfaces that make complex financial products feel simple. Currently leading the Stripe Dashboard redesign.', theme: 'glass', cardType: 'personal', isPublished: true, socialLinks: { twitter: 'https://twitter.com/sarahchen', linkedin: 'https://linkedin.com/in/sarahchen', website: 'https://sarahchen.design', email: 'sarah@example.com' } },
    });

    // Bella Cucina - Restaurant Business Pro
    const bella = await prisma.user.upsert({
      where: { email: 'bella@demo.cardova.app' },
      update: {},
      create: { email: 'bella@demo.cardova.app', password, name: 'Marco Rossi', emailVerified: true, isPro: true },
    });
    await prisma.card.upsert({
      where: { userId: bella.id },
      update: {},
      create: {
        userId: bella.id, username: 'bellacucina', displayName: 'Marco Rossi', title: 'Owner & Head Chef', company: 'Bella Cucina', location: 'New York, NY',
        bio: 'We bring authentic Italian flavors to the heart of Manhattan. Family recipes passed down three generations, made with locally sourced ingredients.',
        theme: 'sunset', cardType: 'business', isPublished: true, leadFormEnabled: true,
        socialLinks: { instagram: 'https://instagram.com/bellacucina', website: 'https://bellacucina.nyc', phone: '+1 212 555 0142', email: 'hello@bellacucina.nyc' },
        services: [
          { id: 'svc1', name: 'Dine-In Experience', description: 'Authentic Italian dining with handmade pasta and wood-fired pizza', price: '$$', icon: 'heart' },
          { id: 'svc2', name: 'Private Events', description: 'Host your celebration in our private dining room for up to 40 guests', price: 'From $2,500', icon: 'briefcase' },
          { id: 'svc3', name: 'Catering', description: 'Full-service Italian catering for corporate events and weddings', price: 'From $45/person', icon: 'shopping-bag' },
          { id: 'svc4', name: 'Cooking Classes', description: 'Learn to make fresh pasta and classic Italian dishes with Chef Marco', price: '$120/person', icon: 'book-open' },
        ],
        customLinks: [
          { id: 'lnk1', title: 'Reserve a Table', url: 'https://bellacucina.nyc/reserve', icon: 'calendar' },
          { id: 'lnk2', title: 'View Our Menu', url: 'https://bellacucina.nyc/menu', icon: 'menu' },
          { id: 'lnk3', title: 'Order Delivery', url: 'https://bellacucina.nyc/delivery', icon: 'shopping-bag' },
        ],
        businessHours: [
          { day: 'Monday', open: '', close: '', closed: true },
          { day: 'Tuesday', open: '11:30', close: '22:00', closed: false },
          { day: 'Wednesday', open: '11:30', close: '22:00', closed: false },
          { day: 'Thursday', open: '11:30', close: '22:00', closed: false },
          { day: 'Friday', open: '11:30', close: '23:00', closed: false },
          { day: 'Saturday', open: '10:00', close: '23:00', closed: false },
          { day: 'Sunday', open: '10:00', close: '21:00', closed: false },
        ],
      },
    });

    // Luminous Digital - Agency Business Pro
    const luminous = await prisma.user.upsert({
      where: { email: 'luminous@demo.cardova.app' },
      update: {},
      create: { email: 'luminous@demo.cardova.app', password, name: 'Alex Rivera', emailVerified: true, isPro: true },
    });
    await prisma.card.upsert({
      where: { userId: luminous.id },
      update: {},
      create: {
        userId: luminous.id, username: 'luminous', displayName: 'Alex Rivera', title: 'Founder & Creative Director', company: 'Luminous Digital', location: 'Austin, TX',
        bio: 'We help brands stand out in the digital world. From stunning websites to high-converting ad campaigns, our team of 12 creatives delivers results.',
        theme: 'neon', cardType: 'business', isPublished: true, leadFormEnabled: true,
        socialLinks: { twitter: 'https://twitter.com/luminousdigital', linkedin: 'https://linkedin.com/company/luminousdigital', website: 'https://luminous.digital', email: 'hello@luminous.digital' },
        services: [
          { id: 'asvc1', name: 'Web Design & Development', description: 'Custom websites that convert visitors into customers', price: 'From $3,500', icon: 'code' },
          { id: 'asvc2', name: 'Brand Identity', description: 'Logo, color palette, typography and brand guidelines', price: 'From $2,000', icon: 'palette' },
          { id: 'asvc3', name: 'Social Media Management', description: 'Content creation, scheduling and community management', price: '$1,200/mo', icon: 'heart' },
          { id: 'asvc4', name: 'SEO & Paid Ads', description: 'Google Ads, Meta Ads and organic SEO', price: 'From $800/mo', icon: 'briefcase' },
          { id: 'asvc5', name: 'Photography & Video', description: 'Professional product photography and brand videos', price: 'From $500', icon: 'camera' },
        ],
        customLinks: [
          { id: 'alnk1', title: 'View Our Portfolio', url: 'https://luminous.digital/work', icon: 'star' },
          { id: 'alnk2', title: 'Book a Free Consultation', url: 'https://luminous.digital/book', icon: 'calendar' },
          { id: 'alnk3', title: 'Download Services PDF', url: 'https://luminous.digital/services.pdf', icon: 'file-text' },
        ],
        businessHours: [
          { day: 'Monday', open: '09:00', close: '18:00', closed: false },
          { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
          { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
          { day: 'Thursday', open: '09:00', close: '18:00', closed: false },
          { day: 'Friday', open: '09:00', close: '17:00', closed: false },
          { day: 'Saturday', open: '', close: '', closed: true },
          { day: 'Sunday', open: '', close: '', closed: true },
        ],
      },
    });

    console.log('✅ Demo accounts ready');
  } catch (err) {
    console.warn('⚠️  Demo seed skipped (may already exist):', (err as Error).message);
  }
}

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Seed demo accounts (safe - uses upsert, skips if exists)
    await seedDemoAccounts();

    // Test Redis connection (if configured)
    if (redis) {
      await redis.ping();
      console.log('✅ Redis connected');
    }

    // Start email worker (if Redis available)
    startEmailWorker();

    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 Cardova API running on port ${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  redis?.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await prisma.$disconnect();
  redis?.disconnect();
  process.exit(0);
});

main();
