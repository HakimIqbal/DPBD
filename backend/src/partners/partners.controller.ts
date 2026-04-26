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
import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/create-partner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  async findAll(@Query('all') all?: string) {
    return this.partnersService.findAll(!all);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.partnersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(@Param('id') id: string) {
    return this.partnersService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.partnersService.delete(id);
    return { message: 'Partner deleted successfully' };
  }
}
