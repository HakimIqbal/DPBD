import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../types';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/create-user.dto';
import { AuditService } from '../audit/audit.service';
import { auditActorFromReq } from '../audit/audit-actor.util';

/**
 * Roles allowed to read any user's profile/stats. Anyone NOT in this list
 * can still read their *own* profile (self-access bypass — see the
 * `assertSelfOrAdmin` helper below). Kept as a const so adding/removing a
 * supervisory role in the future is a one-line change.
 */
const ADMIN_LEVEL_ROLES = [
  'admin',
  'ceo',
  'finance',
  'audit_independent',
  'dewan_pengawas',
] as const;

/**
 * Throws 403 unless the caller is the user being looked up OR holds an
 * admin-level role. Used by the `:id` GET endpoints below.
 *
 * Note: we intentionally don't combine RolesGuard with these endpoints —
 * RolesGuard rejects before the handler runs, which would block a
 * personal user from reading their own profile. Inline checking keeps
 * the self-access escape hatch reachable.
 */
function assertSelfOrAdmin(req: AuthenticatedRequest, targetUserId: string): void {
  const callerId = req.user?.id;
  const callerRole = req.user?.role;

  if (callerId === targetUserId) return;
  if (callerRole && (ADMIN_LEVEL_ROLES as readonly string[]).includes(callerRole)) return;

  throw new ForbiddenException('Akses ditolak');
}

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.usersService.findById((req.user as { id: string }).id);
  }

  /**
   * Read a single user's profile. Allowed for the user themselves OR any
   * admin-level role (see ADMIN_LEVEL_ROLES). Anonymous → 401 via
   * JwtAuthGuard; wrong-role authenticated user → 403 via assertSelfOrAdmin.
   *
   * Was previously fully public — that allowed anyone to enumerate
   * names/emails/roles of every user.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req, id);
    return this.usersService.findById(id);
  }

  /** Donation stats for a single user. Same access rules as the profile read. */
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrAdmin(req, id);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'active' | 'suspended' | 'deleted',
    @Req() req: AuthenticatedRequest,
  ) {
    const updated = await this.usersService.updateStatus(id, status);

    await this.auditService.log({
      ...auditActorFromReq(req),
      action: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: id,
      metadata: { newStatus: status },
    });

    return updated;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const result = await this.usersService.delete(id);

    await this.auditService.log({
      ...auditActorFromReq(req),
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: id,
    });

    return result;
  }
}
