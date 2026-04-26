import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation, Program])],
  providers: [ReportingService],
  controllers: [ReportingController],
  exports: [ReportingService],
})
export class ReportingModule {}
