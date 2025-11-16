import { SetMetadata } from '@nestjs/common';

export enum Permission {
  // Course permissions
  CREATE_COURSE = 'create:course',
  UPDATE_COURSE = 'update:course',
  DELETE_COURSE = 'delete:course',
  VIEW_COURSE = 'view:course',

  // User permissions
  MANAGE_USERS = 'manage:users',
  VIEW_USERS = 'view:users',

  // Bootcamp permissions
  CREATE_BOOTCAMP = 'create:bootcamp',
  MANAGE_BOOTCAMP = 'manage:bootcamp',

  // Organization permissions
  MANAGE_ORGANIZATION = 'manage:organization',
  VIEW_ORGANIZATION = 'view:organization',
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
