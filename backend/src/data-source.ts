import 'dotenv/config';
import { DataSource } from 'typeorm';
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
  RiskThreshold,
  RiskAlert,
} from './entities';

/**
 * Standalone DataSource for the TypeORM CLI (migration:run, migration:generate, etc.).
 * The runtime app uses TypeOrmModule.forRootAsync in app.module.ts; this file is *only*
 * for tooling and is never imported by Nest at runtime.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
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
    RiskThreshold,
    RiskAlert,
  ],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  logging: !isProduction,
  ssl: { rejectUnauthorized: false },
});
