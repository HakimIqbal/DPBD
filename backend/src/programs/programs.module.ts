import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from '../entities';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Program]), AuthModule],
  providers: [ProgramsService],
  controllers: [ProgramsController],
  exports: [ProgramsService],
})
export class ProgramsModule {}
