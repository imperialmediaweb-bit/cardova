import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { redis } from './config/redis';
import { startEmailWorker } from './jobs/emailWorker';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

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
