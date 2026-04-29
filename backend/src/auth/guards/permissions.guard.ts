import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission, roleHasPermissions } from '../permissions';

interface RequestUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Permission-based authorization guard. Reads the @RequirePermissions()
 * metadata from the handler (and falls back to the controller class), then
 * looks up ROLE_PERMISSIONS[req.user.role] and requires every listed
 * permission to be present.
 *
 * If no @RequirePermissions() decorator is present, this guard is a pass-
 * through — combine with JwtAuthGuard (and optionally RolesGuard) as
 * needed at the route level.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Authenticated user with role required',
      );
    }

    if (!roleHasPermissions(user.role, required)) {
      throw new ForbiddenException(
        `Insufficient permissions: requires [${required.join(', ')}]`,
      );
    }

    return true;
  }
}
