"use client"

import { useAuth } from "@/lib/auth-context"
import type { Permission, UserRole } from "@/lib/permissions"

/**
 * Returns true if the current user holds the given permission.
 *
 * Thin wrapper around the auth context's `hasPermission` so callers don't
 * have to destructure the whole context just to read one bit.
 *
 * @example
 *   const canApprove = usePermission(Permission.APPROVE_DISBURSEMENT)
 *   <Button disabled={!canApprove}>Approve</Button>
 */
export function usePermission(p: Permission): boolean {
  const { hasPermission } = useAuth()
  return hasPermission(p)
}

/**
 * Returns the current user's role, or null if no user is authenticated.
 */
export function useRole(): UserRole | null {
  const { user } = useAuth()
  return user?.role ?? null
}
