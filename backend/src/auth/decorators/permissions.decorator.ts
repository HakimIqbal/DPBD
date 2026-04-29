import { SetMetadata } from '@nestjs/common';
import { Permission } from '../permissions';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Marks a controller or handler as requiring all of the listed permissions.
 * The user's role is resolved against ROLE_PERMISSIONS in PermissionsGuard.
 *
 * @example
 *   @RequirePermissions(Permission.APPROVE_DISBURSEMENT)
 *   approveDisbursement(...) { ... }
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
