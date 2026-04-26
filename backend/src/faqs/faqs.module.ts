import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from '../entities/faq.entity';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Faq]), AuthModule],
  providers: [FaqsService],
  controllers: [FaqsController],
  exports: [FaqsService],
})
export class FaqsModule {}
