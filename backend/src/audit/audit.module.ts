import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  // AuthModule is imported so AuditController can pick up JwtAuthGuard +
  // PermissionsGuard without each module redeclaring its own copy.
  imports: [TypeOrmModule.forFeature([AuditLog]), AuthModule],
  providers: [AuditService],
  controllers: [AuditController],
  // AuditService is exported so other modules can inject it for write-side
  // logging (e.g. AdminService when creating users, DonationsService when
  // approving / rejecting / refunding).
  exports: [AuditService],
})
export class AuditModule {}
