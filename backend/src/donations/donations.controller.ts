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
  Req,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import {
  CreateDonationDto,
  UpdateDonationDto,
} from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { auditActorFromReq } from '../audit/audit-actor.util';
import type { AuthenticatedRequest } from '../types';

@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly auditService: AuditService,
  ) {}

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'finance')
  async update(
    @Param('id') id: string,
    @Body() updateDonationDto: UpdateDonationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const updated = await this.donationsService.update(id, updateDonationDto);

    // Only audit when the patch actually changed status. Other field
    // updates aren't part of the audit-trail spec for this endpoint.
    if (updateDonationDto.status) {
      await this.auditService.log({
        ...auditActorFromReq(req),
        action: 'DONATION_STATUS_CHANGED',
        entityType: 'Donation',
        entityId: id,
        metadata: { newStatus: updateDonationDto.status },
      });
    }

    return updated;
  }

  @Patch(':id/status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'finance')
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const updated = await this.donationsService.updateStatus(id, status);

    await this.auditService.log({
      ...auditActorFromReq(req),
      action: 'DONATION_STATUS_CHANGED',
      entityType: 'Donation',
      entityId: id,
      metadata: { newStatus: status },
    });

    return updated;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    await this.donationsService.delete(id);
    return { message: 'Donation deleted successfully' };
  }
}
