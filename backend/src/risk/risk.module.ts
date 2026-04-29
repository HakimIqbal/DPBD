import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskAlert, RiskThreshold } from '../entities';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { InvestmentModule } from '../investment/investment.module';

/**
 * Risk & Compliance module. Owns the threshold catalog, the evaluation
 * engine that compares current portfolio metrics against each rule, and
 * the alert log. Depends on:
 *   - InvestmentModule for `getSummary()` (the source of truth for
 *     portfolio metrics)
 *   - AuditModule for write-side logging on every mutation + evaluation
 *   - AuthModule for JwtAuthGuard + PermissionsGuard
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([RiskThreshold, RiskAlert]),
    AuthModule,
    AuditModule,
    InvestmentModule,
  ],
  providers: [RiskService],
  controllers: [RiskController],
  exports: [RiskService],
})
export class RiskModule {}
