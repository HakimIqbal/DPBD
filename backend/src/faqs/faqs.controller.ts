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
import { FaqsService } from './faqs.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/create-faq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqsService.create(createFaqDto);
  }

  @Get()
  async findAll(@Query('all') all?: string) {
    return this.faqsService.findAll(!all);
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    return this.faqsService.findByCategory(category);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.faqsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqsService.update(id, updateFaqDto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(@Param('id') id: string) {
    return this.faqsService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.faqsService.delete(id);
    return { message: 'FAQ deleted successfully' };
  }
}
