import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../types';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.usersService.findById((req.user as { id: string }).id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.usersService.getDonationStats(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status/:status')
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'active' | 'suspended' | 'deleted',
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
