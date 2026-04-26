import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from '../entities/donation.entity';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donation]), AuthModule],
  providers: [DonationsService],
  controllers: [DonationsController],
  exports: [DonationsService],
})
export class DonationsModule {}
