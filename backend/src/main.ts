import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { seedPrograms } from './seeds/program.seed';
import { clearPrograms } from './seeds/clear-programs.seed';
import { seedInvestments } from './seeds/investment.seed';
import { seedNews } from './seeds/news.seed';
import { seedRiskThresholds } from './seeds/risk-thresholds.seed';
import { bootstrapCEO } from './seeds/bootstrap.seed';
import { seedDisbursements } from './seeds/disbursements.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with flexible origin handling
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests without origin (mobile apps, curl, etc)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow localhost and 192.168.x.x (development)
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        /^http:\/\/192\.168\..+:3000$/,
        /^http:\/\/192\.168\..+:3001$/,
      ];

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return allowed === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }));
        return new BadRequestException(messages);
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Initialize database seeds
  try {
    const dataSource = app.get(DataSource);
    console.log('🌱 Starting database seed...');
    await clearPrograms(dataSource);  // Clear existing programs first
    await seedPrograms(dataSource);    // Then seed fresh 6 programs
    await seedInvestments(dataSource); // Seed 6 sample investments (idempotent — skipped if rows exist)
    await seedNews(dataSource);        // Seed 3 published news articles (idempotent — skipped if rows exist)
    await seedRiskThresholds(dataSource); // Seed 3 default risk thresholds (idempotent — skipped if rows exist)
    await seedDisbursements(dataSource);  // Seed 3 pending disbursements for CFO queue demo (idempotent)
    console.log('✅ Database seed completed successfully');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    // Continue app startup even if seeding fails, but log the error
  }

  // CEO bootstrap runs in its own try/catch (separate from the seed block)
  // so a CEO-account problem can't mask a seed problem and vice versa.
  // Bootstrap failure must NEVER prevent server start — log loud and move on.
  try {
    const dataSource = app.get(DataSource);
    await bootstrapCEO(dataSource);
  } catch (error) {
    console.error('❌ CEO bootstrap failed (non-fatal, continuing startup):', error);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
