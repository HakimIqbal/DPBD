import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donation, Program]), EmailModule],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
