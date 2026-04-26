import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation, Program, User])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
