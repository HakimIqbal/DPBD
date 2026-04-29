"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import type { Permission } from "@/lib/permissions"

interface PermissionGateProps {
  /** The permission required to render `children`. */
  require: Permission
  /** Rendered when the user lacks the permission. Defaults to `null`. */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Conditionally renders its children based on the current user's permissions.
 *
 * UI affordance only — never rely on this for security. The backend's
 * PermissionsGuard is the enforcement boundary.
 *
 * @example
 *   <PermissionGate require={Permission.APPROVE_DISBURSEMENT}>
 *     <Button>Approve</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ require, fallback = null, children }: PermissionGateProps) {
  const { hasPermission } = useAuth()
  return hasPermission(require) ? <>{children}</> : <>{fallback}</>
}
