import { UserRole } from '../entities';

/**
 * Permission catalog — granular capabilities that can be required at the
 * route level via @RequirePermissions(). Roles are mapped to permissions
 * in ROLE_PERMISSIONS below.
 */
export enum Permission {
  READ_DONATIONS = 'READ_DONATIONS',
  WRITE_DONATIONS = 'WRITE_DONATIONS',
  APPROVE_DISBURSEMENT = 'APPROVE_DISBURSEMENT',

  READ_PORTFOLIO = 'READ_PORTFOLIO',
  WRITE_PORTFOLIO = 'WRITE_PORTFOLIO',

  READ_RISK = 'READ_RISK',
  WRITE_RISK = 'WRITE_RISK',

  FLAG_TRANSACTION = 'FLAG_TRANSACTION',
  SUSPEND_TRANSACTION = 'SUSPEND_TRANSACTION',

  EXPORT_ALL = 'EXPORT_ALL',
  READ_REPORTS = 'READ_REPORTS',

  MANAGE_PROGRAMS = 'MANAGE_PROGRAMS',
  MANAGE_PARTNERS = 'MANAGE_PARTNERS',
  MANAGE_USERS = 'MANAGE_USERS',

  READ_AUDIT_TRAIL = 'READ_AUDIT_TRAIL',
  WRITE_AUDIT_TRAIL = 'WRITE_AUDIT_TRAIL',
}

const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

/**
 * Single source of truth: role → permissions. Update here only — guards and
 * any UI logic should consume this map rather than hard-coding role checks.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ALL_PERMISSIONS,
  ceo: ALL_PERMISSIONS,

  cfo: [
    Permission.READ_DONATIONS,
    Permission.APPROVE_DISBURSEMENT,
    Permission.READ_PORTFOLIO,
    Permission.READ_RISK,
    Permission.EXPORT_ALL,
    Permission.READ_REPORTS,
    Permission.READ_AUDIT_TRAIL,
  ],

  investment_manager: [
    Permission.READ_DONATIONS,
    Permission.READ_PORTFOLIO,
    Permission.WRITE_PORTFOLIO,
    Permission.READ_RISK,
    Permission.EXPORT_ALL,
    Permission.READ_REPORTS,
  ],

  risk_manager: [
    Permission.READ_DONATIONS,
    Permission.READ_PORTFOLIO,
    Permission.READ_RISK,
    Permission.WRITE_RISK,
    Permission.EXPORT_ALL,
    Permission.READ_REPORTS,
  ],

  ethic_committee: [
    Permission.READ_DONATIONS,
    Permission.FLAG_TRANSACTION,
    Permission.SUSPEND_TRANSACTION,
    Permission.READ_REPORTS,
  ],

  finance: [
    Permission.READ_DONATIONS,
    Permission.WRITE_DONATIONS,
    Permission.APPROVE_DISBURSEMENT,
    Permission.READ_REPORTS,
    Permission.EXPORT_ALL,
  ],

  audit_independent: [
    Permission.READ_DONATIONS,
    Permission.READ_PORTFOLIO,
    Permission.READ_RISK,
    Permission.EXPORT_ALL,
    Permission.READ_REPORTS,
    Permission.READ_AUDIT_TRAIL,
    Permission.WRITE_AUDIT_TRAIL,
  ],

  dewan_pengawas: [
    Permission.READ_DONATIONS,
    Permission.READ_REPORTS,
    Permission.EXPORT_ALL,
  ],

  dewan_pembina: [Permission.READ_REPORTS],

  partnership_onboarding: [
    Permission.MANAGE_PROGRAMS,
    Permission.MANAGE_PARTNERS,
  ],

  editor: [Permission.MANAGE_PROGRAMS, Permission.MANAGE_PARTNERS],

  personal: [],
  company: [],
};

/**
 * Returns true if the given role has ALL of the required permissions.
 */
export function roleHasPermissions(
  role: UserRole | string | undefined,
  required: Permission[],
): boolean {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role as UserRole];
  if (!granted) return false;
  return required.every((p) => granted.includes(p));
}
