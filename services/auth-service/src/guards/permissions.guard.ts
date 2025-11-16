import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, PERMISSIONS_KEY } from '../decorators/permissions.decorator';

// Role to permissions mapping
const rolePermissions: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission), // Admin has all permissions
  INSTRUCTOR: [
    Permission.CREATE_COURSE,
    Permission.UPDATE_COURSE,
    Permission.VIEW_COURSE,
    Permission.CREATE_BOOTCAMP,
    Permission.MANAGE_BOOTCAMP,
    Permission.VIEW_USERS,
    Permission.VIEW_ORGANIZATION,
  ],
  MENTOR: [
    Permission.VIEW_COURSE,
    Permission.VIEW_USERS,
    Permission.MANAGE_BOOTCAMP,
  ],
  STUDENT: [
    Permission.VIEW_COURSE,
    Permission.VIEW_ORGANIZATION,
  ],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    const userPermissions = rolePermissions[user.role] || [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
