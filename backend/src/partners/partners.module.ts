import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from '../entities/partner.entity';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Partner]), AuthModule],
  providers: [PartnersService],
  controllers: [PartnersController],
  exports: [PartnersService],
})
export class PartnersModule {}
