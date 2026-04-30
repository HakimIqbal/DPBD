import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Disbursement } from '../entities/disbursement.entity';
import { DisbursementsController } from './disbursements.controller';
import { DisbursementsService } from './disbursements.service';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  // AuthModule supplies JwtAuthGuard + PermissionsGuard.
  // AuditModule supplies AuditService for write-side logging on
  // approve/reject.
  imports: [TypeOrmModule.forFeature([Disbursement]), AuthModule, AuditModule],
  controllers: [DisbursementsController],
  providers: [DisbursementsService],
  exports: [DisbursementsService],
})
export class DisbursementsModule {}
