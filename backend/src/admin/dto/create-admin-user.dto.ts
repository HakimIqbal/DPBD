import {
  IsEmail,
  IsIn,
  IsString,
  MinLength,
} from 'class-validator';
import type { UserRole } from '../../entities';

/**
 * Allowed roles for admin-created accounts. `personal` and `company`
 * intentionally excluded — those self-register via /api/auth/register.
 */
export const ADMIN_CREATABLE_ROLES = [
  'admin',
  'editor',
  'finance',
  'ceo',
  'cfo',
  'investment_manager',
  'risk_manager',
  'ethic_committee',
  'audit_independent',
  'dewan_pengawas',
  'dewan_pembina',
  'partnership_onboarding',
] as const;

export type AdminCreatableRole = (typeof ADMIN_CREATABLE_ROLES)[number];

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  /**
   * Donor roles (`personal`, `company`) are blocked because those accounts
   * must self-register so the consent / privacy flow runs. Use the public
   * /api/auth/register endpoint for them.
   */
  @IsIn([...ADMIN_CREATABLE_ROLES], {
    message:
      'Role must be an organizational role; personal/company users self-register via /auth/register',
  })
  role: UserRole;
}
