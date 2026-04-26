import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from '../entities/news.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([News]), AuthModule],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
