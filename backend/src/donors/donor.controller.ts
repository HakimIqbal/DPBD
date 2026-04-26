import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
import { DonorService } from './donor.service';
import {
  DonorPreferencesDto,
  SearchDonorsDto,
  TierLevel,
} from './dto/donor.dto';

@Controller('donors')
export class DonorController {
  constructor(private donorService: DonorService) {}

  /**
   * Get donor profile
   */
  @Get('profile/:userId')
  async getDonorProfile(@Param('userId') userId: string) {
    return this.donorService.getDonorProfile(userId);
  }

  /**
   * Get donor donation history with pagination
   */
  @Get(':userId/history')
  async getDonationHistory(
    @Param('userId') userId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe)
    offset: number,
  ) {
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 1;
    if (offset < 0) offset = 0;

    return this.donorService.getDonationHistory(userId, limit, offset);
  }

  /**
   * Get donor communication preferences
   */
  @Get(':userId/preferences')
  async getPreferences(@Param('userId') userId: string) {
    return this.donorService.getPreferences(userId);
  }

  /**
   * Update donor communication preferences
   */
  @Put(':userId/preferences')
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: DonorPreferencesDto,
  ) {
    return this.donorService.updatePreferences(userId, dto);
  }

  /**
   * Get donor loyalty and tier status
   */
  @Get(':userId/loyalty')
  async getLoyaltyStatus(@Param('userId') userId: string) {
    return this.donorService.getLoyaltyStatus(userId);
  }

  /**
   * Get donor analytics
   */
  @Get(':userId/analytics')
  async getDonorAnalytics(@Param('userId') userId: string) {
    return this.donorService.getDonorAnalytics(userId);
  }

  /**
   * Search donors with filters
   */
  @Get('search')
  async searchDonors(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('city') city?: string,
    @Query('tier') tier?: string,
    @Query('isActive') isActive?: boolean,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 1;

    const tierValue =
      tier && Object.values(TierLevel).includes(tier as TierLevel)
        ? (tier as TierLevel)
        : undefined;

    const filters: SearchDonorsDto = {
      name,
      email,
      city,
      tier: tierValue,
      isActive,
    };

    return this.donorService.searchDonors(filters, limit);
  }
}
