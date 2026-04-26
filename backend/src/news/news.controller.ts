import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  async findAll(@Query('all') all?: string) {
    return this.newsService.findAll(!all);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.newsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@Param('id') id: string) {
    return this.newsService.publish(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  async unpublish(@Param('id') id: string) {
    return this.newsService.unpublish(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.newsService.delete(id);
    return { message: 'News deleted successfully' };
  }
}
