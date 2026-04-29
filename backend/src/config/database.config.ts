import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import {
  User,
  Program,
  Donation,
  Partner,
  News,
  Faq,
  Disbursement,
  AuditLog,
  Investment,
  InvestmentTransaction,
} from '../entities';

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'postgres',
      entities: [
        User,
        Program,
        Donation,
        Partner,
        News,
        Faq,
        Disbursement,
        AuditLog,
        Investment,
        InvestmentTransaction,
      ],
      migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
      synchronize: !isProduction,
      logging: process.env.NODE_ENV === 'development',
      ssl: isProduction
        ? { rejectUnauthorized: false }
        : { rejectUnauthorized: false }, // Supabase memerlukan SSL
      extra: {
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 20,
      },
    };
  },
);
