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
import { DonationsService } from './donations.service';
import {
  CreateDonationDto,
  UpdateDonationDto,
} from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('programId') programId?: string,
  ) {
    return this.donationsService.findAll({ status, userId, programId });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.donationsService.findById(id);
  }

  @Get('program/:programId/stats')
  async getDonationStats(@Param('programId') programId: string): Promise<{
    totalDonations: number;
    totalAmount: number;
    donorCount: number;
    averageDonation: number;
  }> {
    return this.donationsService.getDonationStats(programId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDonationDto: UpdateDonationDto,
  ) {
    return this.donationsService.update(id, updateDonationDto);
  }

  @Patch(':id/status/:status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.donationsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.donationsService.delete(id);
    return { message: 'Donation deleted successfully' };
  }
}
