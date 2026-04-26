import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Donation } from '../entities/donation.entity';
import { DonorService } from './donor.service';
import { DonorController } from './donor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Donation])],
  providers: [DonorService],
  controllers: [DonorController],
  exports: [DonorService],
})
export class DonorModule {}
