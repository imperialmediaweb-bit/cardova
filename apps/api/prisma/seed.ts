import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('Demo123!', 12);

  // ─── 1. Admin Account (Pro) ───────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cardova.app' },
    update: {},
    create: {
      email: 'admin@cardova.app',
      password: await bcrypt.hash('Admin123!', 12),
      name: 'Cardova Admin',
      emailVerified: true,
      role: 'admin',
      isPro: true,
      aiCreditsUsed: 0,
    },
  });

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

  // ─── 2. Personal Card — Sarah Chen (Free) ────────────────
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@demo.cardova.app' },
    update: {},
    create: {
      email: 'sarah@demo.cardova.app',
      password,
      name: 'Sarah Chen',
      emailVerified: true,
      isPro: false,
      aiCreditsUsed: 3,
    },
  });

  await prisma.card.upsert({
    where: { userId: sarah.id },
    update: {},
    create: {
      userId: sarah.id,
      username: 'sarahchen',
      displayName: 'Sarah Chen',
      title: 'Product Designer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      bio: 'I design interfaces that make complex financial products feel simple. Currently leading the Stripe Dashboard redesign and building design systems that scale.',
      theme: 'glass',
      cardType: 'personal',
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

  // ─── 3. Business Card — Bella Cucina Restaurant (Pro) ─────
  const restaurant = await prisma.user.upsert({
    where: { email: 'bella@demo.cardova.app' },
    update: {},
    create: {
      email: 'bella@demo.cardova.app',
      password,
      name: 'Marco Rossi',
      emailVerified: true,
      isPro: true,
      aiCreditsUsed: 0,
    },
  });

  await prisma.card.upsert({
    where: { userId: restaurant.id },
    update: {},
    create: {
      userId: restaurant.id,
      username: 'bellacucina',
      displayName: 'Marco Rossi',
      title: 'Owner & Head Chef',
      company: 'Bella Cucina',
      location: 'New York, NY',
      bio: 'We bring authentic Italian flavors to the heart of Manhattan. Family recipes passed down three generations, made with locally sourced ingredients and a whole lot of love.',
      theme: 'sunset',
      cardType: 'business',
      isPublished: true,
      leadFormEnabled: true,
      socialLinks: {
        instagram: 'https://instagram.com/bellacucina',
        website: 'https://bellacucina.nyc',
        phone: '+1 212 555 0142',
        email: 'hello@bellacucina.nyc',
      },
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

  // ─── 4. Business Card — Luminous Digital Agency (Pro) ─────
  const agency = await prisma.user.upsert({
    where: { email: 'luminous@demo.cardova.app' },
    update: {},
    create: {
      email: 'luminous@demo.cardova.app',
      password,
      name: 'Alex Rivera',
      emailVerified: true,
      isPro: true,
      aiCreditsUsed: 0,
    },
  });

  await prisma.card.upsert({
    where: { userId: agency.id },
    update: {},
    create: {
      userId: agency.id,
      username: 'luminous',
      displayName: 'Alex Rivera',
      title: 'Founder & Creative Director',
      company: 'Luminous Digital',
      location: 'Austin, TX',
      bio: 'We help brands stand out in the digital world. From stunning websites to high-converting ad campaigns, our team of 12 creatives delivers results that matter.',
      theme: 'neon',
      cardType: 'business',
      isPublished: true,
      leadFormEnabled: true,
      socialLinks: {
        twitter: 'https://twitter.com/luminousdigital',
        linkedin: 'https://linkedin.com/company/luminousdigital',
        instagram: 'https://instagram.com/luminousdigital',
        website: 'https://luminous.digital',
        email: 'hello@luminous.digital',
      },
      services: [
        { id: 'asvc1', name: 'Web Design & Development', description: 'Custom websites that convert visitors into customers, built with modern tech', price: 'From $3,500', icon: 'code' },
        { id: 'asvc2', name: 'Brand Identity', description: 'Logo, color palette, typography and brand guidelines that tell your story', price: 'From $2,000', icon: 'palette' },
        { id: 'asvc3', name: 'Social Media Management', description: 'Content creation, scheduling and community management across all platforms', price: '$1,200/mo', icon: 'heart' },
        { id: 'asvc4', name: 'SEO & Paid Ads', description: 'Google Ads, Meta Ads and organic SEO to drive qualified traffic', price: 'From $800/mo', icon: 'briefcase' },
        { id: 'asvc5', name: 'Photography & Video', description: 'Professional product photography, brand videos and social media content', price: 'From $500', icon: 'camera' },
      ],
      customLinks: [
        { id: 'alnk1', title: 'View Our Portfolio', url: 'https://luminous.digital/work', icon: 'star' },
        { id: 'alnk2', title: 'Book a Free Consultation', url: 'https://luminous.digital/book', icon: 'calendar' },
        { id: 'alnk3', title: 'Download Our Services PDF', url: 'https://luminous.digital/services.pdf', icon: 'file-text' },
        { id: 'alnk4', title: 'Client Reviews', url: 'https://luminous.digital/reviews', icon: 'star' },
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

  // ─── Demo analytics views ────────────────────────────────
  const now = new Date();
  const allCards = [sarah.id, restaurant.id, agency.id];

  for (const userId of allCards) {
    const card = await prisma.card.findUnique({ where: { userId } });
    if (!card) continue;

    const viewCount = userId === sarah.id ? 50 : userId === restaurant.id ? 120 : 85;
    const views = [];
    for (let i = 0; i < viewCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const viewedAt = new Date(now);
      viewedAt.setDate(viewedAt.getDate() - daysAgo);
      views.push({
        cardId: card.id,
        referrer: ['twitter', 'linkedin', 'direct', 'qr', 'email', 'instagram', 'google'][Math.floor(Math.random() * 7)],
        viewedAt,
      });
    }
    await prisma.cardView.createMany({ data: views });
  }

  // ─── Demo leads for business cards ───────────────────────
  const restaurantCard = await prisma.card.findUnique({ where: { userId: restaurant.id } });
  const agencyCard = await prisma.card.findUnique({ where: { userId: agency.id } });

  if (restaurantCard) {
    await prisma.lead.createMany({
      data: [
        { cardId: restaurantCard.id, name: 'Emily Watson', email: 'emily@example.com', phone: '+1 555 0101', message: 'Hi! We\'d love to book a private event for 25 people on March 15th. Is your private room available?', isRead: false },
        { cardId: restaurantCard.id, name: 'David Park', email: 'david.park@company.com', message: 'Interested in your catering services for a corporate lunch (50 people). Can you send pricing?', isRead: true },
        { cardId: restaurantCard.id, name: 'Sofia Martinez', email: 'sofia@gmail.com', phone: '+1 555 0202', message: 'Do you offer gluten-free pasta options? My daughter has celiac and we\'d love to dine with you.', isRead: false },
      ],
    });
  }

  if (agencyCard) {
    await prisma.lead.createMany({
      data: [
        { cardId: agencyCard.id, name: 'James Thompson', email: 'james@startupxyz.com', phone: '+1 555 0303', message: 'We just raised our Series A and need a complete rebrand + new website. Budget around $15K. Can we chat?', isRead: false },
        { cardId: agencyCard.id, name: 'Rachel Kim', email: 'rachel@boutique.co', message: 'Love your portfolio! We need social media management for our boutique. What\'s your availability?', isRead: true },
        { cardId: agencyCard.id, name: 'Michael Brown', email: 'mbrown@realestate.com', phone: '+1 555 0404', message: 'Need a landing page for a new property development. Tight deadline - 2 weeks. Possible?', isRead: false },
        { cardId: agencyCard.id, name: 'Lisa Chen', email: 'lisa@techfirm.io', message: 'Interested in your SEO services. Our organic traffic dropped 40% last quarter. Need help ASAP.', isRead: false },
      ],
    });
  }

  console.log('');
  console.log('✅ Seed complete!');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  Demo Accounts (password: Demo123!)');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('  👤 Admin (Pro)');
  console.log('     admin@cardova.app / Admin123!');
  console.log('     Card: /admin');
  console.log('');
  console.log('  👩 Personal Card (Free)');
  console.log('     sarah@demo.cardova.app');
  console.log('     Card: /sarahchen');
  console.log('');
  console.log('  🍝 Restaurant Business (Pro)');
  console.log('     bella@demo.cardova.app');
  console.log('     Card: /bellacucina');
  console.log('');
  console.log('  🚀 Digital Agency Business (Pro)');
  console.log('     luminous@demo.cardova.app');
  console.log('     Card: /luminous');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
