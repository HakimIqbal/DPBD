import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { Donation } from '../entities/donation.entity';
import { Program } from '../entities/program.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, Program, User]),
    ConfigModule,
    AuthModule,
    EmailModule,
    PdfModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ReminderSchedulerService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
