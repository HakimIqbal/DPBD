/**
 * Frontend permission catalog — kept manually in sync with
 * `backend/src/auth/permissions.ts`. Duplication is intentional so the
 * frontend has no compile-time coupling to backend source. If you add a
 * permission or change the role→permission map on either side, update both.
 *
 * NOTE: This file does NOT enforce security. The backend's PermissionsGuard
 * is the source of truth. Frontend gates here are purely for UI affordance —
 * hiding buttons/menus the user has no business clicking.
 */

export enum Permission {
  READ_DONATIONS = "READ_DONATIONS",
  WRITE_DONATIONS = "WRITE_DONATIONS",
  APPROVE_DISBURSEMENT = "APPROVE_DISBURSEMENT",

  READ_PORTFOLIO = "READ_PORTFOLIO",
  WRITE_PORTFOLIO = "WRITE_PORTFOLIO",

  READ_RISK = "READ_RISK",
  WRITE_RISK = "WRITE_RISK",

  FLAG_TRANSACTION = "FLAG_TRANSACTION",
  SUSPEND_TRANSACTION = "SUSPEND_TRANSACTION",

  EXPORT_ALL = "EXPORT_ALL",
  READ_REPORTS = "READ_REPORTS",

  MANAGE_PROGRAMS = "MANAGE_PROGRAMS",
  MANAGE_PARTNERS = "MANAGE_PARTNERS",
  MANAGE_USERS = "MANAGE_USERS",

  READ_AUDIT_TRAIL = "READ_AUDIT_TRAIL",
  WRITE_AUDIT_TRAIL = "WRITE_AUDIT_TRAIL",
}

export type UserRole =
  | "admin"
  | "editor"
  | "finance"
  | "personal"
  | "company"
  | "ceo"
  | "cfo"
  | "investment_manager"
  | "risk_manager"
  | "ethic_committee"
  | "audit_independent"
  | "dewan_pengawas"
  | "dewan_pembina"
  | "partnership_onboarding"

const ALL_PERMISSIONS: Permission[] = Object.values(Permission)

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
}

/** Returns the permission list for a role, or [] if the role is unknown. */
export function permissionsForRole(role: string | null | undefined): Permission[] {
  if (!role) return []
  const granted = ROLE_PERMISSIONS[role as UserRole]
  return granted ?? []
}

/** True if the role grants the given permission. */
export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission)
}

/** True if the role grants AT LEAST ONE of the given permissions. */
export function hasAnyPermission(role: string | null | undefined, permissions: Permission[]): boolean {
  if (permissions.length === 0) return true
  const granted = permissionsForRole(role)
  return permissions.some((p) => granted.includes(p))
}

/** True if the role grants ALL of the given permissions. */
export function hasAllPermissions(role: string | null | undefined, permissions: Permission[]): boolean {
  if (permissions.length === 0) return true
  const granted = permissionsForRole(role)
  return permissions.every((p) => granted.includes(p))
}
