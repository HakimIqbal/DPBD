import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment, InvestmentTransaction } from '../entities';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment, InvestmentTransaction]),
    AuthModule, // exposes JwtAuthGuard + PermissionsGuard
    AuditModule, // exposes AuditService for write-side logging
  ],
  providers: [InvestmentService],
  controllers: [InvestmentController],
  exports: [InvestmentService],
})
export class InvestmentModule {}
